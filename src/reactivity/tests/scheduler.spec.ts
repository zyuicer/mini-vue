import { effect } from "../effect";
import { reactive } from "../reactive";

describe("scheduler", () => {
  it("happy path", () => {
    const obj = reactive({
      age: 1,
    });
    let nextFoo;
    const runner = effect(
      () => {
        nextFoo = obj.age + 2;
      },
      {
        scheduler() {
          if (nextFoo) {
            nextFoo += 2;
          } else {
            nextFoo = 2;
          }
        },
      }
    );
    expect(nextFoo).not.toBe(2);
    obj.age = 2;
    // runner();
    expect(nextFoo).toBe(5);
  });
});
