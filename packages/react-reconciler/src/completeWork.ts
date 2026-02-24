import { createInstance, appendInitialChild, createTextInstance, Container } from 'hostConfig';
import { FiberNode } from './fiber';
import { Fragment, FunctionComponent, HostComponent, HostRoot, HostText } from './workTags';
import { NoFlags, Update } from './fiberFlags';
import { updateFiberProps } from 'react-dom/src/SyntheticEvent';

function markUpdate(fiber: FiberNode) {
  fiber.flags |= Update;
}

// 比较新旧虚拟DOM，返回需要更新的fiber节点
export const completeWork = (wip: FiberNode) => {
  const newProps = wip.pendingProps;
  const current = wip.alternate;

  switch (wip.tag) {
    case HostComponent:
      if (current !== null && wip.stateNode) {
        // update
        // TODO 需要实现：比较新旧属性，标记Update
        updateFiberProps(wip.stateNode, newProps);
      } else {
        // 1、构建DOM元素 2、将DOM元素插入到正确的位置
        const instance = createInstance(wip.type, newProps);
        appendAllChildren(instance, wip);
        wip.stateNode = instance;
      }
      bubbleProperties(wip);
      return null;
    case HostText:
      if (current !== null && wip.stateNode) {
        // update
        const oldText = current.memoizedProps.content;
        const newText = newProps.content;

        if (oldText !== newText) {
          // 1、更新文本内容
          markUpdate(wip);
        }
      } else {
        // 1、构建DOM元素 2、将DOM元素插入到正确的位置
        const instance = createTextInstance(newProps.content);
        wip.stateNode = instance;
      }
      bubbleProperties(wip);
      return null;
    case HostRoot:
    case FunctionComponent:
    case Fragment:
      bubbleProperties(wip);
      return null;
    default:
      if (__DEV__) {
        console.warn('completeWork未实现的类型', wip);
      }
      break;
  }
};

function appendAllChildren(parent: Container, wip: FiberNode) {
  let node = wip.child;

  while (node !== null) {
    if (node.tag === HostComponent || node.tag === HostText) {
      appendInitialChild(parent, node.stateNode);
    } else if (node.child !== null) {
      node.child.return = node;
      node = node.child;
      continue;
    }

    if (node === wip) {
      return;
    }

    while (node.sibling === null) {
      if (node.return === null || node.return === wip) {
        return;
      }
      node = node.return;
    }
    node.sibling.return = node.return;
    node = node.sibling;
  }
}

function bubbleProperties(wip: FiberNode) {
  let subtreeFlags = NoFlags;
  let child = wip.child;

  while (child !== null) {
    subtreeFlags |= child.subtreeFlags;
    subtreeFlags |= child.flags;

    child.return = wip;
    child = child.sibling;
  }

  wip.subtreeFlags |= subtreeFlags;
}
