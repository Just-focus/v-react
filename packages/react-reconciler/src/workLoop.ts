import { scheduleMicrotask } from 'hostConfig';
import { beginWork } from './beginWork';
import {
  commitHookEffectListCreate,
  commitHookEffectListDestroy,
  commitHookEffectListUnmount,
  commitMutationEffects,
} from './commitWork';
import { completeWork } from './completeWork';
import { createWorkInProgress, FiberNode, FiberRootNode, PendingPassiveEffects } from './fiber';
import { MutationMask, NoFlags, PassiveMask } from './fiberFlags';
import {
  getHighestPriorityLane,
  Lane,
  markRootFinished,
  mergeLanes,
  NoLane,
  SyncLane,
} from './fiberLanes';
import { HostRoot } from './workTags';
import { scheduleSyncCallback, flushSyncCallbacks } from './syncTaskQueue';
import { unstable_NormalPriority, unstable_scheduleCallback } from 'scheduler';
import { HookHasEffect, Passive } from './hookEffectTags';

let workInProgress: FiberNode | null = null;
let wipRootRenderLane: Lane = NoLane;
let rootDoesHavePassiveEffects: boolean = false;

function prepareFreshStack(root: FiberRootNode, lane: Lane) {
  workInProgress = createWorkInProgress(root.current, {});
  wipRootRenderLane = lane;
}

function markUpdateFromFiberToRoot(fiber: FiberNode): FiberRootNode | null {
  let node = fiber;
  let parent = node.return;

  while (parent !== null) {
    node = parent;
    parent = node.return;
  }

  if (node.tag === HostRoot) {
    return node.stateNode;
  }

  return null;
}

export function scheduleUpdateOnFiber(fiber: FiberNode, lane: Lane) {
  // 调度更新
  const root = markUpdateFromFiberToRoot(fiber);
  if (root !== null) {
    markRootUpdated(root, lane);
    ensureRootIsScheduled(root);
  }
}

function ensureRootIsScheduled(root: FiberRootNode) {
  const updateLane = getHighestPriorityLane(root.pendingLanes);

  if (updateLane === NoLane) {
    return;
  }

  if (updateLane === SyncLane) {
    // 同步优先级，微任务调度
    if (__DEV__) {
      console.log('同步优先级，微任务调度', updateLane);
    }
    scheduleSyncCallback(performSyncOnRoot.bind(null, root, updateLane));
    scheduleMicrotask(flushSyncCallbacks);
  } else {
    // 异步优先级，宏任务调度
  }
}

function markRootUpdated(root: FiberRootNode, lane: Lane) {
  root.pendingLanes = mergeLanes(root.pendingLanes, lane);
}

function performSyncOnRoot(rootFiber: FiberRootNode, lane: Lane) {
  const nextLane = getHighestPriorityLane(rootFiber.pendingLanes);
  // 优先级低 & NoLane
  if (nextLane !== SyncLane) {
    ensureRootIsScheduled(rootFiber);
    return;
  }

  // 初始化工作单元
  prepareFreshStack(rootFiber, lane);

  do {
    try {
      workLoop();
      break;
    } catch (thrownValue) {
      console.warn('workLoop发生错误', thrownValue);
      workInProgress = null;
    }
    // eslint-disable-next-line no-constant-condition
  } while (true);

  const finishedWork = rootFiber.current.alternate;
  rootFiber.finishedWork = finishedWork;
  rootFiber.finishedLane = lane;
  wipRootRenderLane = NoLane;

  commitRoot(rootFiber);
}

function commitRoot(root: FiberRootNode) {
  const finishedWork = root.finishedWork;

  if (finishedWork === null) {
    return;
  }

  if (__DEV__) {
    console.log('commit阶段开始', finishedWork);
  }

  const lane = root.finishedLane;

  if (lane === NoLane && __DEV__) {
    console.log('commitRoot: lane 不能为空');
  }

  // 重置
  root.finishedWork = null;
  root.finishedLane = NoLane;

  markRootFinished(root, lane);

  if (
    (finishedWork.flags & PassiveMask) !== NoFlags ||
    (finishedWork.subtreeFlags & PassiveMask) !== NoFlags
  ) {
    if (!rootDoesHavePassiveEffects) {
      rootDoesHavePassiveEffects = true;
      // 调度副作用
      unstable_scheduleCallback(unstable_NormalPriority, () => {
        // 执行副作用
        flushPassiveEffect(root.pendingPassiveEffects);
        return;
      });
    }
  }

  // 判断存在3个子阶段需要执行的操作
  const subtreeHasEffect = (finishedWork.subtreeFlags & MutationMask) !== NoFlags;
  const rootHasEffect = (finishedWork.flags & MutationMask) !== NoFlags;

  if (subtreeHasEffect || rootHasEffect) {
    // beforeMutation
    // mutation
    commitMutationEffects(finishedWork, root);

    root.current = finishedWork;
    // layout
  } else {
    root.current = finishedWork;
  }

  rootDoesHavePassiveEffects = false;
  ensureRootIsScheduled(root);
}

function flushPassiveEffect(pendingPassiveEffects: PendingPassiveEffects) {
  pendingPassiveEffects.unmount.forEach((effect) => {
    commitHookEffectListUnmount(Passive, effect);
  });
  pendingPassiveEffects.unmount = [];

  pendingPassiveEffects.update.forEach((effect) => {
    commitHookEffectListDestroy(Passive | HookHasEffect, effect);
  });
  pendingPassiveEffects.update.forEach((effect) => {
    commitHookEffectListCreate(Passive | HookHasEffect, effect);
  });
  pendingPassiveEffects.update = [];

  flushSyncCallbacks();
}

function workLoop() {
  while (workInProgress !== null) {
    performUnitOfWork(workInProgress);
  }
}

function performUnitOfWork(fiber: FiberNode) {
  // 执行当前工作单元，返回下一个工作单元
  const next = beginWork(fiber, wipRootRenderLane);
  fiber.memoizedProps = fiber.pendingProps;

  if (next === null) {
    completeUnitOfWork(fiber);
  } else {
    workInProgress = next;
  }
}

function completeUnitOfWork(fiber: FiberNode) {
  let node: FiberNode | null = fiber;

  do {
    completeWork(node);

    if (node.sibling !== null) {
      workInProgress = node.sibling;
      return;
    }

    node = node.return;
    workInProgress = node;
  } while (node !== null);
}
