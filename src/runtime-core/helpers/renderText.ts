import { IVnode } from "../types/node.type";
import { createVnode, Text } from "../vnode";

export function renderText(text: string): IVnode {
  return createVnode(Text, {}, text);
}
