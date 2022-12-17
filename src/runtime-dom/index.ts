import { createRenderer } from "../runtime-core/render";
import { IVnode } from "../runtime-core/types/node.type";

const isOn = (key) => /on[A-Z]/.test(key);
const patchEventName = (key: string) => {
  return key.charAt(0).toLowerCase() + key.slice(1).toLowerCase();
};

// set element props
function patchProps(el: Element, key: string, value: any) {
  const eventName = patchEventName(key);
  if (isOn(key)) {
    el.addEventListener(eventName.slice(2), value);
  } else {
    el.setAttribute(key, value);
  }
}

// 插入方法
function insert(container: Element, el: Element, anchor?: Node) {
  console.log(container, anchor);

  container.insertBefore(el, anchor || null);
}

// set element text
function setElementText(el: Element, val: string) {
  el.textContent = val;
}

function remove(child: Element) {
  const parent = child.parentNode;
  if (parent) {
    parent.removeChild(child);
  }
}
const renderer: any = createRenderer({
  patchProps,
  insert,
  setElementText,
  remove,
});

export function createApp(...arg) {
  return renderer.createApp(...arg);
}
