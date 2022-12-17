import { camelize, hasOwn, toHandleKey } from "../shared";
import { IComponentEmit, IComponentInstance } from "./types/component.type";

export const CreateEmit: IComponentEmit = function (
  instance: IComponentInstance,
  eventName: string,
  payload: any
): void {
  const { props } = instance;
  const handleName = toHandleKey(camelize(eventName));

  if (hasOwn(props, handleName)) {
    const handler = props[handleName];
    handler(payload);
  }
};
