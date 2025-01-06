import { describe, test, expect } from "vitest";
import { createDirectory } from "./general";
import { pipe } from "pipe-and-combine";
import { listToNames, list } from "./list";

describe("Base functionlaity", () => {
  test("list dir", () => {
    const fixTestDir = createDirectory("/test/files/fix");
    const listNames = pipe(list(), listToNames());
    expect(listNames(fixTestDir)).length(2);
    expect(listNames(fixTestDir)).toEqual(["test.md", "unique.txt"]);
  });
});
