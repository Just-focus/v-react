import { beginWork } from './beginWork';
import { completeWork } from './completeWork';
import { FiberNode } from './fiber';

let workInProgress: FiberNode | null = null;

function prepareFreshStack(fiber: FiberNode) {
  workInProgress = fiber;
}

function renderRoot(rootFiber: FiberNode) {
  // 初始化工作单元
  prepareFreshStack(rootFiber);

  do {
    try {
      workLoop();
      break;
    } catch (thrownValue) {
      console.log('workLoop发生错误', thrownValue);
      workInProgress = null;
    }
    // eslint-disable-next-line no-constant-condition
  } while (true);
}

function workLoop() {
  while (workInProgress !== null) {
    performUnitOfWork(workInProgress);
  }
}

function performUnitOfWork(fiber: FiberNode) {
  // 执行当前工作单元，返回下一个工作单元
  const next = beginWork(fiber);
  fiber.memoizedProps = fiber.pendingProps;

  if (next === null) {
    completeUnitOfWork(fiber);
  } else {
    // workInProgress = next;
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

export { renderRoot };
