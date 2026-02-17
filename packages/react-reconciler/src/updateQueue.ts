import { Action } from 'shared/ReactTypes';

export interface Update<State> {
  action: Action<State>;
}

export interface UpdateQueue<State> {
  shared: {
    pending: Update<State> | null;
  };
}

export const createUpdate = <State>(action: Action<State>): Update<State> => {
  return {
    action,
  };
};

export const createUpdateQueue = <Action>() => {
  return {
    shared: {
      pending: null,
    },
  } as UpdateQueue<Action>;
};

export const enqueueUpdate = <Action>(updateQueue: UpdateQueue<Action>, update: Update<Action>) => {
  // const pending = updateQueue.shared.pending;

  // if (pending === null) {
  //   // 没有更新，形成环状链表
  //   update.next = update;
  // } else {
  //   // 已经有更新，插入到环状链表中
  //   update.next = pending.next;
  //   pending.next = update;
  // }

  updateQueue.shared.pending = update;
};

export const processUpdateQueue = <State>(
  baseState: State,
  pendingUpdate: Update<State> | null,
): { memoizedState: State } => {
  const result: ReturnType<typeof processUpdateQueue<State>> = {
    memoizedState: baseState,
  };

  if (pendingUpdate !== null) {
    const action = pendingUpdate.action;

    if (action instanceof Function) {
      result.memoizedState = action(result.memoizedState);
    } else {
      result.memoizedState = action;
    }
  }
  return result;
};
