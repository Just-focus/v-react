import { Dispatch } from 'react/src/currentDispatcher';
import { Action } from 'shared/ReactTypes';
import { Lane } from './fiberLanes';

export interface Update<State> {
  action: Action<State>;
  lane: Lane;
  next: Update<State> | null;
}

export interface UpdateQueue<State> {
  shared: {
    pending: Update<State> | null;
  };
  dispatch: Dispatch<State> | null;
}

export const createUpdate = <State>(action: Action<State>, lane: Lane): Update<State> => {
  return {
    action,
    lane,
    next: null,
  };
};

export const createUpdateQueue = <State>() => {
  return {
    shared: {
      pending: null,
    },
    dispatch: null,
  } as UpdateQueue<State>;
};

export const enqueueUpdate = <State>(updateQueue: UpdateQueue<State>, update: Update<State>) => {
  const pending = updateQueue.shared.pending;
  if (pending === null) {
    update.next = update;
  } else {
    update.next = pending.next;
    pending.next = update;
  }
  // pending 指向 update 环状链表的最后一个节点
  updateQueue.shared.pending = update;
};

export const processUpdateQueue = <State>(
  baseState: State,
  pendingUpdate: Update<State> | null,
  lane: Lane,
): { memoizedState: State } => {
  const result: ReturnType<typeof processUpdateQueue<State>> = {
    memoizedState: baseState,
  };

  if (pendingUpdate !== null) {
    const firstUpdate = pendingUpdate.next;
    let pending = pendingUpdate.next as Update<any>;
    do {
      const updateLane = pending?.lane;

      if (updateLane === lane) {
        const action = pending.action;

        if (action instanceof Function) {
          baseState = action(baseState);
        } else {
          baseState = action;
        }
      } else {
        if (__DEV__) {
          console.warn('不应该进入当前优先级的更新', pending);
        }
      }
      pending = pending.next as Update<any>;
    } while (pending !== firstUpdate);
  }

  result.memoizedState = baseState;
  return result;
};
