import { ReactElementType } from 'shared/ReactTypes';
import { FiberNode } from './fiber';
import { processUpdateQueue, UpdateQueue } from './updateQueue';
import { Fragment, FunctionComponent, HostComponent, HostRoot, HostText } from './workTags';
import { mountChildFibers, reconcileChildFibers } from './childFibers';
import { renderWithHooks } from './fiberHooks';
import { Lane } from './fiberLanes';

// 比较新旧虚拟DOM，返回需要更新的fiber节点
export const beginWork = (wip: FiberNode, lane: Lane) => {
  switch (wip.tag) {
    case HostRoot:
      return updateHostRoot(wip, lane);
    case HostComponent:
      return updateHostComponent(wip);
    case HostText:
      return null;
    case FunctionComponent:
      return updateFunctionComponent(wip, lane);
    case Fragment:
      return updateFragment(wip);
    default:
      if (__DEV__) {
        console.warn('beginWork未实现的类型', wip);
      }
      break;
  }
  return null;
};

// TODO: 实现Fragment的beginWork
function updateFragment(wip: FiberNode) {
  const nextChildren = wip.pendingProps;
  reconcileChildren(wip, nextChildren);
  return wip.child;
}

function updateFunctionComponent(wip: FiberNode, lane: Lane) {
  const nextChildren = renderWithHooks(wip, lane);
  reconcileChildren(wip, nextChildren);
  return wip.child;
}

// 1、计算最新值 2、创建子fiberNode
function updateHostRoot(wip: FiberNode, lane: Lane) {
  const baseState = wip.memoizedState;
  const updateQueue = wip.updateQueue as UpdateQueue<Element>;
  const pendingUpdate = updateQueue.shared.pending;
  updateQueue.shared.pending = null;

  const { memoizedState } = processUpdateQueue(baseState, pendingUpdate, lane);
  wip.memoizedState = memoizedState;

  const nextChildren = wip.memoizedState;
  reconcileChildren(wip, nextChildren);

  return wip.child;
}

// 1、创建子fiberNode
function updateHostComponent(wip: FiberNode) {
  const nextProps = wip.pendingProps;
  const nextChildren = nextProps.children;
  reconcileChildren(wip, nextChildren);
  return wip.child;
}

function reconcileChildren(wip: FiberNode, children?: ReactElementType) {
  const current = wip.alternate;

  if (current !== null) {
    // update
    wip.child = reconcileChildFibers(wip, current.child, children);
  } else {
    // mount
    wip.child = mountChildFibers(wip, null, children);
  }
}
