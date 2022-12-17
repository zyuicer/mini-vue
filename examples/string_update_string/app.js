import { h, ref } from "../../lib/mini-vue.esm.js";
export const app = {
  setup(props) {
    const flag = ref(false);
    window.flag = flag;
    return {
      flag,
    };
  },
  render() {
    const foo = "old";
    const bar = "string";
    // return h('div', {}, "hi yuice"
    return h("div", {}, this.flag ? foo : bar);
  },
};
