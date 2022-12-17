import { h, provide } from "../../lib/mini-vue.esm.js";
import { foo } from "./foo.js";
export const app = {
  setup() {
    const message = "provide props msg";
    provide("message", message);
    return {
      message,
    };
  },
  render() {
    return h(foo, { propMessage: this.message });
  },
};
