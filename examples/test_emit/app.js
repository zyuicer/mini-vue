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
    return h(foo, {
      propMessage: this.message,
      onFoo(message) {
        console.log("emit call back", message);
      },
    });
  },
};
