import { h, inject } from "../../lib/mini-vue.esm.js";

export const foo = {
  setup() {
    const message = inject("message");
    console.log(message);
  },
  render() {
    h("div", {}, "foo");
  },
};
