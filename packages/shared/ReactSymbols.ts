const supportSymbol = typeof Symbol === 'function' && Symbol.for('react.support');

export const REACT_ELEMENT_TYPE = supportSymbol ? Symbol.for('react.element') : 0xeac7;

export const REACT_FRAGMENT_TYPE = supportSymbol ? Symbol.for('react.fragment') : 0xeac8;
