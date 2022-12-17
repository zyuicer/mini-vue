import { h, renderSlot } from "../../lib/mini-vue.esm.js";

export const foo = {
  render() {
    return h("div", {}, [
      h("div", {}, this.propMessage),
      renderSlot(this.$slots, "header"),
    ]);
  },
};
