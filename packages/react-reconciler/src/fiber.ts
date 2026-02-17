import { Key, Props, Ref } from 'shared/ReactTypes';
import { WorkTag } from './workTags';
import { Flags, NoFlags } from './fiberFlags';
import { Container } from 'hostConfig';

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
  alternate: FiberNode | null;
  flags: Flags;
  updateQueue: unknown;

  constructor(tag: WorkTag, pendingProps: Props, key: Key) {
    this.tag = tag;
    this.key = key;
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
    this.updateQueue = null;

    this.alternate = null; // 双缓存
    this.flags = NoFlags; // 副作用
  }
}

export class FiberRootNode {
  container: Container; // 根节点对应的宿主环境容器
  current: FiberNode; // 当前正在使用的Fiber树
  finishedWork: FiberNode | null; // 已经完成的工作

  constructor(container: Container, hostRootFiber: FiberNode) {
    this.container = container;
    this.current = hostRootFiber;
    hostRootFiber.stateNode = this;
    this.finishedWork = null;
  }
}
