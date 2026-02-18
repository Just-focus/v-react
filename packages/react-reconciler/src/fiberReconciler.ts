import { Container } from 'hostConfig';
import { FiberNode, FiberRootNode } from './fiber';
import { HostRoot } from './workTags';
import { createUpdate, createUpdateQueue, enqueueUpdate, UpdateQueue } from './updateQueue';
import { scheduleUpdateOnFiber } from './workLoop';
import { ReactElementType } from 'shared/ReactTypes';

export const createContainer = (containerInfo: Container) => {
  console.log('createContainer', containerInfo);
  const hostRootFiber = new FiberNode(HostRoot, {}, null);
  const root = new FiberRootNode(containerInfo, hostRootFiber);
  hostRootFiber.updateQueue = createUpdateQueue();
  return root;
};

export const updateContainer = (element: ReactElementType | null, root: FiberRootNode) => {
  console.log('updateContainer', element, root);
  const hostRootFiber = root.current;
  const update = createUpdate<ReactElementType | null>(element);
  enqueueUpdate(hostRootFiber.updateQueue as UpdateQueue<ReactElementType | null>, update);
  scheduleUpdateOnFiber(hostRootFiber);
  return element;
};
