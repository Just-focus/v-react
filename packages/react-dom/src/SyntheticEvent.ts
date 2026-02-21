import { Container } from 'hostConfig';
import { Props } from 'shared/ReactTypes';

export const elementPropsKey = '__props';
const validEventTypeList = ['click'];

type EventCallback = (event: Event) => void;

interface SyntheticEvent extends Event {
  __stopPropagation: boolean;
}

interface Paths {
  capture: EventCallback[];
  bubble: EventCallback[];
}

export interface DomElement extends Element {
  [elementPropsKey]: Props;
}

export function updateFiberProps(node: DomElement, props: Props) {
  node[elementPropsKey] = props;
}

export function initEvent(container: Container, eventType: string) {
  if (!validEventTypeList.includes(eventType)) {
    console.warn('当前不支持的事件类型', eventType);
    return;
  }

  if (__DEV__) {
    console.warn('初始化事件', eventType);
  }

  container.addEventListener(eventType, (event) => {
    dispatchEvent(container, eventType, event);
  });
}

function createSyntheticEvent(nativeEvent: Event) {
  const syntheticEvent = nativeEvent as SyntheticEvent;
  syntheticEvent.__stopPropagation = false;

  const originStopPropagation = nativeEvent.stopPropagation;
  syntheticEvent.stopPropagation = function () {
    syntheticEvent.__stopPropagation = true;
    if (originStopPropagation) {
      originStopPropagation();
    }
  };
  return syntheticEvent;
}

function dispatchEvent(container: Container, eventType: string, event: Event) {
  const targetElement = event.target;

  if (targetElement === null) {
    console.warn('事件不存在target', event);
    return;
  }

  // 1、收集沿途的事件处理函数
  const { capture, bubble } = collectPaths(targetElement as DomElement, container, eventType);
  // 2、构建合成事件
  const syntheticEvent = createSyntheticEvent(event);
  // 3、依次执行capture的事件处理函数
  triggerEventFlow(capture, syntheticEvent);
  if (!syntheticEvent.__stopPropagation) {
    // 4、依次执行bubble的事件处理函数
    triggerEventFlow(bubble, syntheticEvent);
  }
}

function triggerEventFlow(paths: EventCallback[], syntheticEvent: SyntheticEvent) {
  for (let i = 0; i < paths.length; i++) {
    const callback = paths[i];
    callback.call(null, syntheticEvent);

    if (syntheticEvent.__stopPropagation) {
      break;
    }
  }
}

function getEventCallback(element: DomElement, eventType: string): string[] | undefined {
  return {
    click: ['onClickCapture', 'onClick'],
  }[eventType];
}

function collectPaths(targetElement: DomElement, container: Element, eventType: string) {
  const paths: Paths = {
    capture: [],
    bubble: [],
  };

  while (targetElement && targetElement !== container) {
    // 收集
    const elementProps = targetElement[elementPropsKey];
    if (elementProps) {
      const callbackNameList = getEventCallback(targetElement, eventType);
      if (callbackNameList) {
        callbackNameList.forEach((callbackName, index) => {
          const eventCallback = elementProps[callbackName];
          if (eventCallback) {
            if (index === 0) {
              // capture
              paths.capture.unshift(eventCallback);
            } else {
              // bubble
              paths.bubble.push(eventCallback);
            }
          }
        });
      }
    }
    targetElement = targetElement.parentNode as DomElement;
  }

  return paths;
}
