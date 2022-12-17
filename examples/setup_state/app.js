import { h } from "../../lib/mini-vue.esm.js";
export const app = {
  setup() {
    const message = "test msg";
    const btnHandler = function () {
      console.log(message);
    };
    return {
      message,
      btnHandler,
    };
  },
  render() {
    // return h('div', {}, "hi yuice"
    return h(
      "button",
      {
        onClick: this.btnHandler,
      },
      this.message
    );
  },
};
