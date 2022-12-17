import { IComponentInstance } from "./types/component.type";
import { IVnode } from "./types/node.type";

export function initProps<T extends object>(
  instance: IComponentInstance,
  props: T
) {
  instance.props = props;
}
