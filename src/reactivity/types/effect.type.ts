export interface IDeep {
  effects: Set<IReactiveEffect>;
  append: () => void;
  notify: () => void;
}

export interface IReactiveEffect {
  _deep?: IDeep;
  scheduler?: () => void;
  run: () => void;
  stop: () => void;
}

export interface IRunner {
  effect?: IReactiveEffect;
  stop?: (runner: IRunner) => void;
  (): void;
}
