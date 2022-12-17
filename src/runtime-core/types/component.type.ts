import { IVnode } from "./node.type";

export interface ISetupState {
  [key: string]: any;
  [key: symbol]: any;
}

export interface ISlots {
  [key: string]: any;
}

export interface IComponentInstance {
  type: IVnode["type"];
  vnode: IVnode;
  props: any;
  slots: ISlots;
  setupState: ISetupState;
  proxy: {};
  provide: { [key: string]: any; [key: symbol]: any };
  parent: IComponentInstance | null;
  isMounted: boolean;
  subTree: IVnode;
  emit: IComponentEmit | null;
  render: () => IVnode | void;
}

export type IComponentEmit = (
  instance: IComponentInstance,
  eventName: string,
  payload?: any
) => void;
