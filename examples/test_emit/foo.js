import { h, renderText } from "../../lib/mini-vue.esm.js";

export const foo = {
  setup(props, { emit }) {
    const handler = () => {
      emit("Foo", "test");
    };
    return {
      handler,
    };
  },
  render() {
    return h("div", { class: "red" }, [
      renderText("text"),
      h("button", { onClick: this.handler }, "emit"),
    ]);
  },
};
