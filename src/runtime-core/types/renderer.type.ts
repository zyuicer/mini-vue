import { VNodeType } from "./node.type";

export interface IRendererOptions {
  patchProps: PatchPropsType;
  insert: InsertType;
  setElementText: SetElementTextType;
  remove: RemoveType;
}
type PatchPropsType = (el: Element, key: string, val: any) => void;
type InsertType = (container: Element, el: Element, anchor?: Node) => void;
type SetElementTextType = (el: Element, val: string) => void;
type RemoveType = (children: Element) => void;

export type CreateRendererFn = (
  options: IRendererOptions
) => CreeateRendererRes;

export type CreeateRendererRes = {
  createApp: (el: VNodeType) => void;
};
