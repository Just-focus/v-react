const supportSymbol = typeof Symbol === 'function' && Symbol.for('react.support');

export const REACT_ELEMENT_TYPE = supportSymbol ? Symbol.for('react.element') : 0xeac7;
