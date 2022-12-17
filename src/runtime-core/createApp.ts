import { VNodeType } from "./types/node.type";
import { createVnode } from "./vnode";

export function createAppApi(render) {
  return function (rootVnode: VNodeType) {
    return {
      mount(rootContainer: Element | string) {
        if (typeof rootContainer === "string") {
          const node = document.querySelector(rootContainer);
          rootContainer = node ? node : rootContainer;
        }
        const node = createVnode(rootVnode);
        render(node, rootContainer as Element);
      },
    };
  };
}
