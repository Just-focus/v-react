import { Key, Props, ReactElementType, Ref } from 'shared/ReactTypes';
import { Fragment, FunctionComponent, HostComponent, WorkTag } from './workTags';
import { Flags, NoFlags } from './fiberFlags';
import { Container } from 'hostConfig';
import { Lane, Lanes, NoLane, NoLanes } from './fiberLanes';

export class FiberNode {
  tag: WorkTag;
  key: Key;
  stateNode: any;
  type: any;
  return: FiberNode | null;
  child: FiberNode | null;
  sibling: FiberNode | null;
  index: number;
  ref: Ref;
  pendingProps: Props;
  memoizedProps: Props | null;
  memoizedState: any;
  alternate: FiberNode | null;
  flags: Flags;
  subtreeFlags: Flags;
  updateQueue: unknown;
  deletions: FiberNode[] | null;

  constructor(tag: WorkTag, pendingProps: Props, key: Key) {
    this.tag = tag;
    this.key = key || null;
    this.stateNode = null;
    this.type = null;

    // 构成树状结构
    this.return = null;
    this.child = null;
    this.sibling = null;
    this.index = 0;

    this.ref = null;

    // 构成工作单元
    this.pendingProps = pendingProps; // 需要生效的属性
    this.memoizedProps = null; // 已经生效的属性
    this.memoizedState = null; // 已经生效的状态
    this.updateQueue = null;

    this.alternate = null; // 双缓存
    this.flags = NoFlags; // 副作用
    this.subtreeFlags = NoFlags; // 子树的副作用
    this.deletions = null; // 需要删除的子Fiber列表
  }
}

export class FiberRootNode {
  container: Container; // 根节点对应的宿主环境容器
  current: FiberNode; // 当前正在使用的Fiber树
  finishedWork: FiberNode | null; // 已经完成的工作
  pendingLanes: Lanes; // 待处理的lane
  finishedLane: Lane; // 已经处理的lane

  constructor(container: Container, hostRootFiber: FiberNode) {
    this.container = container;
    this.current = hostRootFiber;
    hostRootFiber.stateNode = this;
    this.finishedWork = null;
    this.pendingLanes = NoLanes;
    this.finishedLane = NoLane;
  }
}

export function createWorkInProgress(current: FiberNode, pendingProps: Props): FiberNode {
  let wip = current.alternate;

  if (wip === null) {
    // mount
    wip = new FiberNode(current.tag, pendingProps, current.key);
    wip.stateNode = current.stateNode;

    wip.alternate = current;
    current.alternate = wip;
  } else {
    // update
    wip.pendingProps = pendingProps;
    wip.flags = NoFlags;
    wip.subtreeFlags = NoFlags;
    wip.deletions = null;
  }
  wip.type = current.type;
  wip.updateQueue = current.updateQueue;
  wip.child = current.child;
  wip.memoizedProps = current.memoizedProps;
  wip.memoizedState = current.memoizedState;

  return wip;
}

export function createFiberFromElement(element: ReactElementType): FiberNode {
  const { type, key, props } = element;
  let fiberTag: WorkTag = FunctionComponent;

  if (typeof type === 'string') {
    // 原生标签
    fiberTag = HostComponent;
  } else if (typeof type !== 'function' && __DEV__) {
    console.warn('createFiberFromElement未实现的type类型', element);
  }

  const fiber = new FiberNode(fiberTag, props, key);
  fiber.type = type;
  return fiber;
}

export function createFiberFromFragment(elements: any[], key: Key): FiberNode {
  const fiber = new FiberNode(Fragment, elements, key);
  return fiber;
}
