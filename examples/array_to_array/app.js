import { h, ref } from "../../lib/mini-vue.esm.js";
export const app = {
  setup(props) {
    const flag = ref(true);
    window.flag = flag;
    return {
      flag,
    };
  },
  render() {
    const foo = [h("div", { key: "A" }, "a"), h("div", { key: "B" }, "b")];
    const bar = [
      h("div", { key: "A" }, "A"),
      h("div", { key: "B" }, "B"),
      h("div", { key: "C" }, "c"),
    ];
    // return h('div', {}, "hi yuice"
    return h("div", {}, this.flag ? foo : bar);
  },
};
