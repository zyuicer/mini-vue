export interface IReactive {
  [key: string]: any;
  [key: symbol]: any;
}


export type IReactiveOptions = {
  scheduler?: () => void;
};
export type IReactiveKey = string | symbol;
