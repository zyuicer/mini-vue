export const extend = Object.assign;

export function isObject(value: any) {
  return value != null && typeof value === "object";
}

export const hasChange = Object.is;

export const hasOwn = (target, property) => {
  return Object.prototype.hasOwnProperty.call(target, property);
};

// 处理 emit key
export const camelize = (eventName: string) => {
  return eventName.replace(/-(\w)/g, (_, c) => {
    return c ? c.toUpperCase() : "";
  });
};

export const caplization = (eventName: string) => {
  return eventName.charAt(0).toUpperCase() + eventName.slice(1);
};
export const toHandleKey = (eventName: string) => {
  return eventName ? "on" + caplization(eventName) : "";
};
