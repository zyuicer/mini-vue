import { effect } from "../reactivity";
import { ShapeFlags } from "../shared/shapeFlags";
import { createComponent, setupComponent } from "./component";
import { createAppApi } from "./createApp";
import { IComponentInstance } from "./types/component.type";
import { IVnode } from "./types/node.type";
import {
  CreateRendererFn,
  CreeateRendererRes,
  IRendererOptions,
} from "./types/renderer.type";
import { Fragment, Text } from "./vnode";

export const createRenderer: CreateRendererFn = function (options) {
  const {
    patchProps: hostPatchProps,
    insert: hostInsert,
    setElementText: hostSetElementText,
    remove: hostRemove,
  } = options;

  function render(vnode: IVnode, rootContainer: Element) {
    patch(undefined, vnode, rootContainer, null);
  }

  function patch(
    n1: IVnode | undefined,
    n2: IVnode,
    container: Element,
    parentComponent: IComponentInstance | null,
    anchor?: Node
  ) {
    const { type, shapeFlag } = n2;
    switch (type) {
      case Fragment:
        processFragment(n2, container, parentComponent);
        break;
      case Text:
        processText(n2, container);
        break;
      default:
        if (shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
          processComponent(n1, n2, container, parentComponent);
        } else if (shapeFlag & ShapeFlags.ELEMENT) {
          processElement(n1, n2, container, parentComponent, anchor);
        }
        break;
    }
  }

  // 处理组件vnode
  function processComponent(
    n1: IVnode | undefined,
    n2: IVnode,
    container: Element,
    parentComponent: IComponentInstance | null
  ) {
    if (n1) {
      updateComponent(n1, n2);
    } else {
      mountComponent(n2, container, parentComponent);
    }
  }

  // 挂载组件
  function mountComponent(
    n2: IVnode,
    container: Element,
    parentComponent: IComponentInstance | null
  ) {
    const instance = createComponent(n2, parentComponent);
    setupComponent(instance);
    setupRenderEffect(instance, n2, container, parentComponent);
  }

  // 更新组件
  function updateComponent(n1: IVnode, n2: IVnode) {
    console.log("update");
  }

  // 处理 组件内部 虚拟node树
  function setupRenderEffect(
    instance: IComponentInstance,
    initVnode: IVnode,
    container: Element,
    parentComponent: IComponentInstance | null
  ) {
    effect(() => {
      const { render, proxy, isMounted } = instance;

      if (!isMounted) {
        const subTree = render.call(proxy);

        if (subTree) {
          patch(undefined, subTree, container, instance);
          instance.subTree = subTree;
          initVnode.el = subTree.el;
        }

        instance.isMounted = true;
      } else {
        const { subTree: PreSubTree } = instance;
        const newSubTree = render.call(proxy) as IVnode;
        newSubTree && patch(PreSubTree, newSubTree, container, instance);
      }
    });
  }

  // 处理 element
  function processElement(
    n1: IVnode | undefined,
    n2: IVnode,
    container: Element,
    parentComponent: IComponentInstance | null,
    anchor?: Node
  ) {
    if (n1) {
      patchElement(n1, n2, container, parentComponent);
    } else {
      mountElement(n2, container, anchor);
    }
  }

  // 挂载element
  function mountElement(vnode: IVnode, container: Element, anchor?: Node) {
    const el = document.createElement(vnode.type);
    vnode.el = el;
    const { shapeFlag, children, props } = vnode;
    if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
      hostSetElementText(el, children as string);
    } else if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
      mountChildren(children as IVnode[], el, null, anchor);
    }

    // props

    for (let key in props) {
      const val = props[key];
      hostPatchProps(el, key, val);
    }
    hostInsert(container, el, anchor);
  }

  // 更新element
  function patchElement(
    n1: IVnode,
    n2: IVnode,
    container: Element | undefined,
    parentComponent: IComponentInstance | null
  ) {
    const el = (n2.el = n1.el);

    patchChildren(n1, n2, el as HTMLElement, parentComponent);
  }

  function patchChildren(
    n1: IVnode,
    n2: IVnode,
    container: HTMLElement,
    parentComponent: IComponentInstance | null
  ) {
    const { shapeFlag: preShapeFlag } = n1;
    const { shapeFlag } = n2;
    const c1 = n1.children;
    const c2 = n2.children;

    if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
      if (preShapeFlag & ShapeFlags.TEXT_CHILDREN) {
        hostSetElementText(container, c2 as string);
      } else if (preShapeFlag & ShapeFlags.ARRAY_CHILDREN) {
        unmountChildren(c1 as IVnode[]);
        hostSetElementText(container, c2 as string);
      }
    } else {
      if (preShapeFlag & ShapeFlags.TEXT_CHILDREN) {
        hostSetElementText(container, "");
        mountChildren(c2 as IVnode[], container, null);
      } else if (preShapeFlag * ShapeFlags.ARRAY_CHILDREN) {
        // array to array
        patchKeyedChildren(c1, c2, container, parentComponent);
      }
    }
  }

  // diff
  function isSomeTypeWithKey(n1: IVnode, n2: IVnode) {
    return n1.type === n2.type && n1.key === n2.key;
  }
  function patchKeyedChildren(
    c1: string | IVnode[],
    c2: string | IVnode[],
    container: HTMLElement,
    parentComponent: IComponentInstance | null
  ) {
    // 获取
    let l1 = c1.length - 1;
    let l2 = c2.length - 1;

    let i = 0;
    // 左侧对比 如果 type 与 key对应将n1 与n2 进行 patch 之后 将i 指向下一个vnode
    // 如果不相同 将退出while循环 找到左侧不同点
    while (i <= l1 && i <= l2) {
      const n1 = c1[i] as IVnode;
      const n2 = c2[i] as IVnode;
      if (isSomeTypeWithKey(n1, n2)) {
        patch(n1, n2, container, parentComponent);
      } else {
        break;
      }
      i++;
    }
    // a b
    //     -
    // a b e d
    // 双端对比 将会指向 undefined e, i = 2, l1 = 1, l2 = 3

    // a b c d
    //     -
    // a b e d
    // 双端对比 将会指向 c e, i = 2, l1 = 2, l2 = 2

    // a b c d
    //     -
    // a b
    // 双端对比 将会指向 c undefined, i = 2, l1 = 3, l2 = 1

    // 比较右侧
    while (i <= l2 && i <= l1) {
      const n1 = c1[i] as IVnode;
      const n2 = c2[i] as IVnode;
      if (isSomeTypeWithKey(n1, n2)) {
        patch(n1, n2, container, parentComponent);
      } else {
        break;
      }
      l1--;
      l2--;
    }
    // const foo = [
    //   h("div", { key: "A" }, "a"),
    //   h("div", { key: "B" }, "b"),
    //   h("div", { key: "C" }, "c"),
    // ];
    // const bar = [h("div", { key: "A" }, "A"), h("div", { key: "B" }, "B")];

    if (i > l1) {
      // 如果 i 大于老的数组长度
      // a b c e
      //     -
      // a b e d f
      // 双端对比 将会指向 undefined e, i = 2, l1 = 1, l2 = 3
      console.log(l1, l2);

      const nextPos = l2 + 1;
      const vnode = c2[nextPos] as IVnode;
      const anchor = nextPos > l2 ? undefined : vnode.el;
      while (i <= l2) {
        patch(undefined, c2[i] as IVnode, container, parentComponent, anchor);
        i++;
      }
    } else if (i > l2) {
      // 如果 i 小于 l1 表示 新的小于旧的
      // 老的比新的少 删除多余的
      while (i <= l1) {
        const n1 = c1[i] as IVnode;
        hostRemove(n1.el!);
        i++;
      }
    } else {
      // 相等的情况
      // diff
      // a b c e f
      //     - -
      // a b e d f
      // i = 2 , l1 = 3, l2 = 3

      let s1 = i;
      let s2 = i;
      // 数据映射
      let keyToNewIndexMap = new Map<any, number>();

      // 遍历一遍新的数组将key和索引收集
      for (let i = s2; i <= l2; i++) {
        keyToNewIndexMap.set((c2[i] as IVnode).key, i);
      }

      for (let i = s1; i <= l1; i++) {
        let indexValue;
        const preChild = c1[i] as IVnode;
        if (preChild.key) {
          indexValue = keyToNewIndexMap.get(preChild.key);
        } else {
          for (let j = s2; j <= c2.length; i++) {
            if (isSomeTypeWithKey(preChild, c2[j] as IVnode)) {
              indexValue = j;
              break;
            }
          }
        }
      }
    }
  }

  function unmountChildren(children: IVnode[]) {
    for (let i = 0; i < children.length; i++) {
      let el = children[i].el;

      el && hostRemove(el);
    }
  }

  function mountChildren(
    children: IVnode[],
    container,
    parentComponent: IComponentInstance | null,
    anchor?: Node
  ) {
    children.forEach((n) =>
      patch(undefined, n, container, parentComponent, anchor)
    );
  }

  // fragment
  function processFragment(
    vnode: IVnode,
    container: Element,
    parentComponent: IComponentInstance | null
  ) {
    const { children } = vnode;
    console.log(children);

    mountChildren(children as IVnode[], container, parentComponent);
  }

  // text
  function processText(vnode: IVnode, contaienr: Element) {
    const { children } = vnode;
    const textNode = document.createTextNode(children as string);
    contaienr.append(textNode);
  }
  return {
    createApp: createAppApi(render),
  };
};
