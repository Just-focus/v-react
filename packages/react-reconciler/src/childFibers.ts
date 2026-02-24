import { Props, ReactElementType, Key } from 'shared/ReactTypes';
import {
  createFiberFromElement,
  createFiberFromFragment,
  createWorkInProgress,
  FiberNode,
} from './fiber';
import { REACT_ELEMENT_TYPE, REACT_FRAGMENT_TYPE } from 'shared/ReactSymbols';
import { Fragment, HostText } from './workTags';
import { ChildDeletion, Placement } from './fiberFlags';

type ExistingChildren = Map<string | number, FiberNode>;

// shouldTrackEffects: 是否跟踪副作用
function ChildrenReconciler(shouldTrackEffects: boolean) {
  // 从父节点中删除指定的子节点
  function deleteChild(returnFiber: FiberNode, childToDelete: FiberNode): void {
    if (!shouldTrackEffects) {
      return;
    }
    const deletions = returnFiber.deletions;
    if (deletions === null) {
      returnFiber.deletions = [childToDelete];
      returnFiber.flags |= ChildDeletion;
    } else {
      deletions.push(childToDelete);
    }
  }

  // 删除当前节点的所有兄弟节点
  function deleteRemainingChildren(
    returnFiber: FiberNode,
    currentFirstChild: FiberNode | null,
  ): void {
    if (!shouldTrackEffects) {
      return;
    }

    let childToDelete = currentFirstChild;
    while (childToDelete !== null) {
      deleteChild(returnFiber, childToDelete);
      childToDelete = childToDelete.sibling;
    }
  }

  // 处理单个 Element 节点的情况
  // 对比 currentFiber 与 ReactElement，生成 workInProgress FiberNode
  function reconcileSingleElement(
    returnFiber: FiberNode,
    currentFiber: FiberNode | null,
    element: ReactElementType,
  ) {
    // 组件的更新阶段
    while (currentFiber !== null) {
      if (currentFiber.key === element.key) {
        if (element.$$typeof === REACT_ELEMENT_TYPE) {
          if (currentFiber.type === element.type) {
            // key 和 type 都相同，当前节点可以复用旧的 Fiber 节点
            // 处理 Fragment 的情况
            let props: Props = element.props;
            if (element.type === REACT_FRAGMENT_TYPE) {
              props = element.props.children;
            }

            const existing = useFiber(currentFiber, props);
            existing.return = returnFiber;
            // 剩下的兄弟节点标记删除
            deleteRemainingChildren(returnFiber, currentFiber.sibling);
            return existing;
          }
          // key 相同，但 type 不同，删除所有旧的 Fiber 节点
          deleteRemainingChildren(returnFiber, currentFiber);
          break;
        } else {
          if (__DEV__) {
            console.warn('还未实现的 React 类型', element);
            break;
          }
        }
      } else {
        // key 不同，删除当前旧的 Fiber 节点，继续遍历兄弟节点
        deleteChild(returnFiber, currentFiber);
        currentFiber = currentFiber.sibling;
      }
    }

    // 创建新的 Fiber 节点
    let fiber;
    if (element.type === REACT_FRAGMENT_TYPE) {
      fiber = createFiberFromFragment(element.props.children, element.key);
    } else {
      fiber = createFiberFromElement(element);
    }
    fiber.return = returnFiber;
    return fiber;
  }

  function reconcileSingleTextNode(
    returnFiber: FiberNode,
    currentFiber: FiberNode | null,
    content: string | number,
  ) {
    while (currentFiber !== null) {
      // update
      if (currentFiber.tag === HostText) {
        // type相同，可以复用
        const existing = useFiber(currentFiber, { content });
        existing.return = returnFiber;
        deleteRemainingChildren(returnFiber, currentFiber.sibling);
        return existing;
      } else {
        // type不同，删除旧Fiber
        deleteChild(returnFiber, currentFiber);
        currentFiber = currentFiber.sibling;
      }
    }
    const fiber = new FiberNode(HostText, { content }, null);
    fiber.return = returnFiber;
    return fiber;
  }

  function placeSingleChild(fiber: FiberNode) {
    if (shouldTrackEffects && fiber.alternate === null) {
      fiber.flags |= Placement;
    }
    return fiber;
  }

  function reconcileChildrenArray(
    returnFiber: FiberNode,
    currentFiber: FiberNode | null,
    newChildren: any[],
  ) {
    // 记录最后一个节点
    let lastPlacedIndex: number = 0;
    // 记录最后一个新节点
    let lastNewFiber: FiberNode | null = null;
    // 记录第一个新节点
    let firstNewFiber: FiberNode | null = null;

    // 1、将current保存在Map中
    const existingChildren: ExistingChildren = new Map();
    let current = currentFiber;
    while (current !== null) {
      const keyToUse = current.key !== null ? current.key : current.index;
      existingChildren.set(keyToUse, current);
      current = current.sibling;
    }
    // 2、遍历newChildren，判断是否可以复用currentFiber
    for (let i = 0; i < newChildren.length; i++) {
      const after = newChildren[i];
      const newFiber = updateFromMap(returnFiber, existingChildren, i, after);

      if (newFiber === null) {
        continue;
      }

      // 3、标记移动还是插入
      newFiber.index = i;
      newFiber.return = returnFiber;
      if (lastNewFiber === null) {
        lastNewFiber = newFiber;
        firstNewFiber = newFiber;
      } else {
        lastNewFiber.sibling = newFiber;
        lastNewFiber = lastNewFiber.sibling;
      }

      if (!shouldTrackEffects) {
        continue;
      }

      const current = newFiber.alternate;
      if (current !== null) {
        const oldIndex = current.index;
        if (oldIndex < lastPlacedIndex) {
          // 移动
          newFiber.flags |= Placement;
          continue;
        } else {
          // 不移动
          lastPlacedIndex = oldIndex;
        }
      } else {
        // 插入
        newFiber.flags |= Placement;
      }
    }
    // 4、将Map中剩下的标记删除
    existingChildren.forEach((fiber) => {
      deleteChild(returnFiber, fiber);
    });

    return firstNewFiber;
  }

  function updateFromMap(
    returnFiber: FiberNode,
    existingChildren: ExistingChildren,
    index: number,
    element: any,
  ): FiberNode | null {
    const keyToUse = element.key !== null ? element.key : index;
    const before = existingChildren.get(keyToUse);

    if (typeof element === 'string' || typeof element === 'number') {
      // HostText
      if (before) {
        if (before.tag === HostText) {
          // type相同，可以复用
          existingChildren.delete(keyToUse);
          return useFiber(before, { content: element + '' });
        }
        return new FiberNode(HostText, { content: element + '' }, null);
      }
    }

    if (typeof element === 'object' && element !== null) {
      if (Array.isArray(element)) {
        return updateFragment(returnFiber, before, element, keyToUse, existingChildren);
      }

      switch (element.$$typeof) {
        case REACT_ELEMENT_TYPE:
          if (element.type === REACT_FRAGMENT_TYPE) {
            return updateFragment(
              returnFiber,
              before,
              element.props.children,
              keyToUse,
              existingChildren,
            );
          }

          if (before) {
            if (before.tag === element.type) {
              // type相同，可以复用
              existingChildren.delete(keyToUse);
              return useFiber(before, element.props);
            }
          }
          return createFiberFromElement(element);
        default:
          if (__DEV__) {
            console.warn('updateFromMap未实现的类型', element);
          }
          break;
      }
    }
    return null;
  }

  return function reconcileChildFibers(
    returnFiber: FiberNode,
    currentFiber: FiberNode | null,
    newChild?: any,
  ) {
    // 判断Fragment
    const isUnKeyedTopLevelFragment =
      typeof newChild === 'object' &&
      newChild !== null &&
      newChild.$$typeof === REACT_FRAGMENT_TYPE &&
      newChild.key === null;
    if (isUnKeyedTopLevelFragment) {
      newChild = newChild.props.children;
    }

    // 判断newChild的类型
    if (typeof newChild === 'object' && newChild !== null) {
      switch (newChild.$$typeof) {
        case REACT_ELEMENT_TYPE:
          // ReactElement
          return placeSingleChild(reconcileSingleElement(returnFiber, currentFiber, newChild));
        default:
          if (__DEV__) {
            console.warn('reconcileChildFibers未实现的类型', newChild);
          }
          break;
      }
      // 多节点
      if (Array.isArray(newChild)) {
        return reconcileChildrenArray(returnFiber, currentFiber, newChild);
      }
    }

    if (typeof newChild === 'string' || typeof newChild === 'number') {
      // HostText
      return placeSingleChild(reconcileSingleTextNode(returnFiber, currentFiber, newChild));
    }

    if (currentFiber !== null) {
      // 兜底删除
      deleteRemainingChildren(returnFiber, currentFiber);
    }

    if (__DEV__) {
      console.warn('reconcileChildFibers未实现的类型', newChild);
    }
    return null;
  };
}

function useFiber(fiber: FiberNode, pendingProps: Props): FiberNode {
  const clone = createWorkInProgress(fiber, pendingProps);
  clone.index = 0;
  clone.sibling = null;
  return clone;
}

function updateFragment(
  returnFiber: FiberNode,
  current: FiberNode | undefined,
  elements: any[],
  key: Key,
  existingChildren: ExistingChildren,
) {
  let fiber;
  if (!current || current.tag !== Fragment) {
    fiber = createFiberFromFragment(elements, key);
  } else {
    existingChildren.delete(key);
    fiber = useFiber(current, elements);
  }
  fiber.return = returnFiber;
  return fiber;
}

export const reconcileChildFibers = ChildrenReconciler(true);
export const mountChildFibers = ChildrenReconciler(false);
