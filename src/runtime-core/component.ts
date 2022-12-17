import { proxyRefs } from "../reactivity";
import { isObject } from "../shared";
import { CreateEmit } from "./componentEmit";
import { initProps } from "./componentProps";
import { initSlots } from "./componentSlots";
import { proxyHandler } from "./renderProxy";
import {
  IComponentEmit,
  IComponentInstance,
  ISlots,
} from "./types/component.type";
import { IVnode } from "./types/node.type";

let CURRENT_INSTANCE: IComponentInstance | null = null;
export function createComponent(
  vnode: IVnode,
  parent: IComponentInstance | null
): IComponentInstance {
  const component: IComponentInstance = {
    type: vnode.type,
    vnode,
    setupState: {},
    props: {},
    slots: {},
    proxy: {},
    isMounted: false,
    provide: parent ? parent.provide : {},
    parent,
    subTree: {} as IVnode,
    render: () => {},
    emit: null,
  };
  component.emit = CreateEmit.bind(
    component,
    component
  ) as IComponentEmit["bind"];

  return component;
}

export function setupComponent(component: IComponentInstance) {
  // init props
  initProps(component, component.vnode.props);
  // init slots
  initSlots(component, component.vnode.children as ISlots);

  setupStatefulComponent(component);
}

function setupStatefulComponent(component: IComponentInstance) {
  const { type, props, emit } = component;
  const { setup } = type;
  let setupResult;
  if (setup) {
    updateCurrentInstance(component);
    setupResult = setup(props, { emit: emit as IComponentEmit });
    clearCurrentInstance();
  }
  handleSetupResult(component, setupResult);
}

function handleSetupResult(component: IComponentInstance, setupResult) {
  if (isObject(setupResult)) {
    component.setupState = proxyRefs(setupResult);
  }
  finishComponentSetup(component);
}

function finishComponentSetup(component: IComponentInstance) {
  const { render } = component.type;
  component.proxy = new Proxy({ _: component }, proxyHandler);
  if (render) {
    component.render = render;
  }
}

// 获取当前的 实例
export function currentInstance(): IComponentInstance {
  return CURRENT_INSTANCE as IComponentInstance;
}

export function updateCurrentInstance(instance: IComponentInstance) {
  CURRENT_INSTANCE = instance;
}

export function clearCurrentInstance() {
  CURRENT_INSTANCE = null;
}
