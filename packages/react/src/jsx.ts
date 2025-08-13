import { REACT_ELEMENT_TYPE, REACT_FRAGMENT_TYPE } from 'shared/src/reactSymbols';
import type { 
  Type,
	Ref,
	Key,
	Props,
	ReactElementType,
	ElementType 
} from 'shared/src/reactTypes';

function ReactElement(
  type: ElementType,
  key: Key = null,
  ref: Ref = null,
  props: Props = {}
): ReactElementType {
  return {
    $$typeof: REACT_ELEMENT_TYPE,
    type,
    key,
    ref,
    props,
    __mark: 'v-react'
  };
}

export function isValidElement(obj: any): obj is ReactElementType {
  return (
		typeof obj === 'object' &&
		obj !== null &&
		obj.$$typeof === REACT_ELEMENT_TYPE
	);
}

export const Fragment = REACT_FRAGMENT_TYPE;

export function jsx(type: ElementType, config: any, ...children: any): ReactElementType {
  let key: Key = null;
	let ref: Ref = null;

  const props: Props = {};
  for (const prop in config) {
		const val = config[prop];
		if (prop === 'key') {
			if (val !== undefined) {
				key = '' + val;
			}
			continue;
		}
		if (prop === 'ref') {
			if (val !== undefined) {
				ref = val;
			}
			continue;
		}
		if ({}.hasOwnProperty.call(config, prop)) {
			props[prop] = val;
		}
	}

  const childrenLength = children.length;
  if(childrenLength === 1) {
    props.children = children[0];
  }else {
    props.children = children;
  }

  return ReactElement(type, key, ref, props);
}

export const createElement = jsx;