import { Container } from 'hostConfig';
import { FiberNode, FiberRootNode } from './fiber';
import { HostRoot } from './workTags';
import { createUpdate, createUpdateQueue, enqueueUpdate, UpdateQueue } from './updateQueue';
import { scheduleUpdateOnFiber } from './workLoop';
import { ReactElementType } from 'shared/ReactTypes';
import { requestUpdateLane } from './fiberLanes';

export const createContainer = (containerInfo: Container) => {
  const hostRootFiber = new FiberNode(HostRoot, {}, null);
  const root = new FiberRootNode(containerInfo, hostRootFiber);
  hostRootFiber.updateQueue = createUpdateQueue();
  return root;
};

export const updateContainer = (element: ReactElementType | null, root: FiberRootNode) => {
  const hostRootFiber = root.current;
  const lane = requestUpdateLane();
  const update = createUpdate<ReactElementType | null>(element, lane);

  enqueueUpdate(hostRootFiber.updateQueue as UpdateQueue<ReactElementType | null>, update);
  scheduleUpdateOnFiber(hostRootFiber, lane);
  return element;
};
