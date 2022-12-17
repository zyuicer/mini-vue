import { ShapeFlags } from "../../shared/shapeFlags";
import { IComponentEmit } from "./component.type";

type ComponentVnodeType = {
  name?: string;
  render?: () => IVnode | void;
  setup?: (props?: any, context?: ComponentContextType) => void;
};

export type ComponentContextType = {
  emit: IComponentEmit;
};
export type VNodeType = ComponentVnodeType & string;

export type IVnodeBase = {
  type: VNodeType;
  props: any;
  key: any;
  children: string | IVnode[];
  el?: HTMLElement;
};

export type IVnodeSetup = {
  shapeFlag: ShapeFlags;
};

export type IVnode = IVnodeBase & IVnodeSetup;
