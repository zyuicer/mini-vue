import { h } from "../../lib/mini-vue.esm.js";
import { foo } from "./foo.js";
export const app = {
  setup() {
    const message = "provide props msg";
    return {
      message,
    };
  },
  render() {
    return h(
      foo,
      { propMessage: this.message },
      {
        header() {
          return h("h1", {}, "header");
        },
      }
    );
  },
};
