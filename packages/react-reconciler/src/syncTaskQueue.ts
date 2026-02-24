let syncQueue: ((...args: any) => void)[] | null = null;
let isFlushingSyncQueue = false;

export function scheduleSyncCallback(callback: (...args: any) => void) {
  if (syncQueue === null) {
    syncQueue = [callback];
  } else {
    syncQueue.push(callback);
  }
}

export function flushSyncCallbacks() {
  if (__DEV__) {
    console.log('flushSyncCallbacks', syncQueue?.length);
  }

  if (syncQueue !== null && !isFlushingSyncQueue) {
    isFlushingSyncQueue = true;

    try {
      syncQueue.forEach((callback) => callback());
    } catch (error) {
      if (__DEV__) {
        console.error('flushSyncCallbacks error', error);
      }
    } finally {
      isFlushingSyncQueue = false;
      syncQueue = null;
    }
  }
}
