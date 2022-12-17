import { ref, h } from "../../lib/mini-vue.esm.js";

export const app = {
  setup() {
    const user = ref({ age: 1 });
    function addHandler() {
      console.log(user.value);
      user.value.age++;
    }
    return {
      user,
      addHandler,
    };
  },
  render() {
    console.log(this.user);
    return h(
      "button",
      {
        onClick: this.addHandler,
      },
      String(this.user.age)
    );
  },
};
