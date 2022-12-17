import { reactive } from "../reactive";
import { effect, stop } from "../effect";
describe("effect", () => {
  it("happy test", () => {
    const user = reactive({ age: 1 });
    let index = 0;
    effect(() => {
      index = user.age + 1;
    });

    user.age++;
    expect(index).toBe(3);
  });

  it("stop", () => {
    const user = reactive({ age: 1 });
    let index = 0;
    const runner = effect(() => {
      index = user.age + 1;
    });

    stop(runner);
    user.age++;
    expect(index).not.toBe(3);
  });
});
