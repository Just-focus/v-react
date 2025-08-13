import { FiberNode } from './fiber';
import {
	Update,
	UpdateQueue,
	createUpdate,
	enqueueUpdate,
	processUpdateQueue
} from './updateQueue';
import { Dispatch, Dispatcher } from 'react/src/currentDispatcher';
import { createUpdateQueue } from './updateQueue';
import { Action } from 'shared/src/ReactTypes';
import { scheduleUpdateOnFiber } from './workLoop';
import { Lane, NoLane, requestUpdateLanes } from './fiberLanes';
import { EffectTags, HookHasEffect, Passive } from './hookEffectTags';
import { PassiveEffect } from './fiberFlags';

// 当前正在被处理的 FiberNode
let currentlyRenderingFiber: FiberNode | null = null;
// Hooks 链表中当前正在处理的 Hook
let workInProgressHook: Hook | null = null;
let currentHook: Hook | null = null;
let renderLane: Lane = NoLane;

// TODO: 修改
const { currentDispatcher } = currentlyRenderingFiber;

// 定义 Hook 数据结构
export interface Hook {
  memoizedState: any; // 保存 Hook 的数据
  queue: any; // 更新队列
}
