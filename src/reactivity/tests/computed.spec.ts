import { computed } from "../computed";
import { reactive } from "../reactive";

describe("computed", () => {
  it("happy path", () => {
    const user = reactive({ age: 1 });
    const foo = computed(() => {
      return user.age + 1;
    });
    expect(foo.value).toBe(2);
  });
});
