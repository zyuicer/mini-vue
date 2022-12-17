import { h } from "../../lib/mini-vue.esm.js";

export const foo = {
  render() {
    return h("div", {}, this.propMessage);
  },
};
