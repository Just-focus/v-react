import { FiberNode, FiberRootNode } from "./fiber";
import { ChildDeletion, NoFlags, Placement, Update } from "./fiberFlags";
import { HostComponent, HostRoot, HostText } from "./workTags";

let nextEffect: FiberNode | null = null;

export const commitMutationEffects = (finishedWork: FiberNode) => {
  nextEffect = finishedWork;

  // 深度优先遍历 Fiber 树，寻找更新 flags
  while(nextEffect !== null) {
    // 向下遍历
    const child: FiberNode | null = nextEffect.child;
    if((nextEffect.subtreeFlags & MutationMask) !== NoFlags && child !== null) {
      // 子节点存在 mutation 阶段需要执行的 flags
      nextEffect = child;
    } else {
      // 子节点不存在 mutation 阶段需要执行的 flags 或没有子节点
      up: while(nextEffect !== null) {
        // 处理 flags
        commitMutationEffectsOnFiber(nextEffect);

        const sibling: FiberNode | null = nextEffect.sibling;
        // 遍历兄弟节点
        if(sibling !== null) {
          nextEffect = sibling;
          break up;
        }
        // 遍历父节点
        nextEffect = nextEffect.return;
      }
    }
  }
}

const commitMutationEffectsOnFiber = (finishedWork: FiberNode) => {
  const flags = finishedWork.flags;
  if((flags & Placement) !== NoFlags) {
    // 处理插入
    commitPlacement(finishedWork);
		finishedWork.flags &= ~Placement;
  }
  if((flags & Update) !== NoFlags) {
    // 处理更新
    finishedWork.flags &= ~Update;
  }
  if((flags & ChildDeletion) !== NoFlags) {
    // 处理删除
    finishedWork.flags &= ~ChildDeletion;
  }
}

// 执行 DOM 插入操作，将 FiberNode 对应的 DOM 插入 parent DOM 中
const commitPlacement = (finishedWork: FiberNode) => {
  const hostParent = getHostParent(finishedWork);
  if (hostParent !== null) {
    // 将 finishedWork 对应的 DOM 插入到 hostParent 中
    appendPlacementNodeIntoContainer(finishedWork, hostParent);
  }
}

// 获取 parent DOM 节点
const getHostParent = (fiber: FiberNode): Container | null => {
  let parent = fiber.return;
  while (parent !== null) {
    const parentTag = parent.tag;
    // 处理 Root 节点
    if(parentTag === HostRoot) {
      return parent.stateNode.container;
    }
    // 处理原生 DOM 元素节点
    if(parentTag === HostComponent) {
      return parent.stateNode;
    } else {
      parent = parent.return;
    }
  }
  return null;
}

const appendPlacementNodeIntoContainer = (finishedWork: FiberNode, hostParent: Container) => {
  if(finishedWork.tag === HostComponent || finishedWork.tag === HostText) {
    appendChildToContainer(finishedWork.stateNode, hostParent);
  } else {
    const child = finishedWork.child;
    if(child !== null) {
      appendPlacementNodeIntoContainer(child, hostParent);
      let sibling = child.sibling;
      while(sibling !== null) {
        appendPlacementNodeIntoContainer(sibling, hostParent);
        sibling = sibling.sibling;
      }
    }
  }
}