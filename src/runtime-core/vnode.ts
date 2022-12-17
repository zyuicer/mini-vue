import { isObject } from "../shared";
import { ShapeFlags } from "../shared/shapeFlags";
import { IVnode, VNodeType } from "./types/node.type";

export const Fragment = "fragment";
export const Text = "text";

export function createVnode(
  type: VNodeType,
  props: any = {},
  children?
): IVnode {
  const vnode = {
    type,
    props,
    children,
    el: undefined,
    key: props.key || undefined,
    shapeFlag: createShapeFlag(type),
  };

  if (Array.isArray(children)) {
    vnode.shapeFlag |= ShapeFlags.ARRAY_CHILDREN;
  } else if (typeof children === "string") {
    vnode.shapeFlag |= ShapeFlags.TEXT_CHILDREN;
  }

  if (vnode.shapeFlag & ShapeFlags.STATEFUL_COMPONENT && isObject(children)) {
    vnode.shapeFlag |= ShapeFlags.SLOT_CHILDREN;
  }

  return vnode;
}

// 不是 字符串和 object 类型的边界判断 不做了
function createShapeFlag(type: VNodeType) {
  if (isObject(type)) {
    return ShapeFlags.STATEFUL_COMPONENT;
  } else {
    return ShapeFlags.ELEMENT;
  }
}
