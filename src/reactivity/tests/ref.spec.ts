import { effect } from "../effect";
import { reactive } from "../reactive";
import { isRef, proxyRefs, ref } from "../ref";

describe("ref", () => {
  it("happy path", () => {
    const user = ref({ age: 1 });
    let index = 0;
    effect(() => {
      index = user.value.age + 1;
    });
    user.value.age++;
    expect(index).toBe(3);
  });

  it("isRef", () => {
    const user = ref({ age: 1 });
    expect(isRef(user)).toBe(true);
  });
  it("proxyRefs", () => {
    const user = ref({ age: 1 });
    const result = proxyRefs({
      user,
    });
    let index = 0;
    effect(() => {
      index = result.user.age + 1;
    });
    result.user.age++;
    expect(index).toBe(3);
  });
});
