import { isReactive, isReadonly, reactive, readonly } from "../reactive";

describe("reactive", () => {
  it("readonly", () => {
    const user = readonly({ age: 1 });
    // user.age++;
    expect(user.age).not.toBe(2);
  });
  it("isReadonly", () => {
    const user = readonly({ age: 1 });
    const flag = isReadonly(user);
    expect(flag).toBe(true);
  });
  it("isReactive", () => {
    const user = readonly({ age: 1 });
    const user2 = reactive({ age: 1 });
    const flag = isReactive(user);
    const flag2 = isReactive(user2);
    expect(flag).toBe(false);
    expect(flag2).toBe(true);
  });
});
