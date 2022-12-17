import { h } from "../../lib/mini-vue.esm.js";
import { Foo } from "./foo.js";
export const app = {
  render() {
    // return h('div', {}, "hi yuice"
    return h("div", {}, [
      h("div", {}, "hhh"),
      h(
        "button",
        {
          onClick() {
            console.log("handler");
          },
        },
        "test"
      ),
      h(Foo),
    ]);
  },
};
