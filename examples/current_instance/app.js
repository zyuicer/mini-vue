import { currentInstance, h } from "../../lib/mini-vue.esm.js";

export const app = {
  setup() {
    const instance = currentInstance();
    console.log(instance);
  },
  render() {
    return h("div", {}, "app");
  },
};
