import { VNodeType } from "./types/node.type";
import { createVnode } from "./vnode";

export function h(type: VNodeType, props: any, children: any) {
  return createVnode(type, props, children);
}
