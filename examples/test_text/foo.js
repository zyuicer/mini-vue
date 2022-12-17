import { h, renderText } from "../../lib/mini-vue.esm.js";

export const foo = {
  render() {
    return h("h1", { class: "red" }, [renderText("text")]);
  },
};
