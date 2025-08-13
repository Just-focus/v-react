import { ReactElementType } from "shared/src/reactTypes";
import { FiberNode, createFiberFromElement } from "./fiber";
import { REACT_ELEMENT_TYPE } from 'shared/src/ReactSymbols';
import { HostText } from "./workTags";
import { Placement } from "./fiberFlags";

function ChildReconciler(shouldTrackSideEffects: boolean) {
  // 处理单个 Element 节点的情况
  // 对比 currentFiber 与 ReactElement
  // 生成 workInProgress FiberNode
  function reconcilerSingleElement(returnFiber: FiberNode, currentFiber: FiberNode | null, element: ReactElementType): FiberNode {
    // 根据 ReactElement 创建新的 FiberNode
    const fiber = createFiberFromElement(element);
    // 将新创建的 fiber 挂载到父节点上
    fiber.return = returnFiber;
    return fiber;
  }

  // 处理文本节点的情况
  // 对比 currentFiber 与 ReactElement
  // 生成 workInProgress FiberNode
  function reconcilerSingleTextNode(returnFiber: FiberNode, currentFiber: FiberNode | null, content: string | number): FiberNode {
    const fiber = new FiberNode(HostText, { content }, null);
    fiber.return = returnFiber;
    return fiber;
  }
  
  // 为 Fiber 节点添加更新 flags
  function placeSingleChild(fiber: FiberNode) {
    // 首屏渲染且追踪副作用时，才添加更新 flags
    if (shouldTrackSideEffects && fiber.alternate === null) {
      fiber.flags |= Placement;
    }
    return fiber;
  }

  // 闭包，根据 shouldTrackSideEffects 返回不同的 reconcileChildFibers 的实现
  return function reconcileChildFibers(returnFiber: FiberNode, currentFiber: FiberNode | null, newChild?: ReactElementType) {
    // 判断当前 fiber 的类型
    // 单个 Element 节点
    if(typeof newChild === 'object' && newChild !== null) {
      switch (newChild.$$typeof) {
        case REACT_ELEMENT_TYPE:
          return placeSingleChild(reconcilerSingleElement(returnFiber, currentFiber, newChild));
        default:
          break;
      }
    }

    // 多个 Element 节点
    if(Array.isArray(newChild)) {
      // TODO: 实现多节点的更新
      console.warn('还未实现的多节点的更新');
    }

    // 文本节点
    if(typeof newChild === 'string' || typeof newChild === 'number') {
      return placeSingleChild(reconcilerSingleTextNode(returnFiber, currentFiber, newChild));
    }

    return null;
  }
}

// 组件的更新阶段中，追踪副作用
export const reconcileChildFibers = ChildReconciler(true);

// 首屏渲染阶段中不追踪副作用，只对根节点执行一次 DOM 插入操作
export const mountChildFibers = ChildReconciler(false);