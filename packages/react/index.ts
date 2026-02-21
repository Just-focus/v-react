import currentDispatcher, { Dispatcher, resolveDispatcher } from './src/currentDispatcher';
import { jsxDev } from './src/jsx';

export const useState: Dispatcher['useState'] = (initialState) => {
  const dispatcher = resolveDispatcher();
  return dispatcher.useState(initialState);
};

export { Fragment } from './src/jsx';

// 内部数据共享层
export const __SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED = {
  currentDispatcher,
};

export default {
  version: '0.1.0',
  createElement: jsxDev,
};
