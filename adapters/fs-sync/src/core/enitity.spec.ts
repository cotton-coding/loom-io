import { describe, test, expect } from "vitest";
import { dir, file } from "./base.js";
import {
  copyDirContent,
  goto,
  listDir,
  create,
  resolveTo,
  remove,
  readFile,
  copyTo,
} from "./entity.js";
import { pipe } from "pipe-and-combine";
import * as str from "./str.js";
import * as listFu from "./list";
import { faker } from "@faker-js/faker";
import * as fs from "fs";
import * as np from "path";

const createTestDir = pipe(
  resolveTo(dir("./test/tests")),
  goto(dir(faker.string.ulid())),
  create()
);

const deleteTestDir = pipe(remove());

describe("Entity functionlaity", () => {
  test("list dir", () => {
    const fixTestDir = dir("./test/files/fix");
    const listNames = pipe(listDir(), listFu.names());
    expect(listNames(fixTestDir)).length(4);
    expect(listNames(fixTestDir).sort()).toEqual(
      ["obj.json", "nested", "test.md", "unique.txt"].sort()
    );
  });

  test("copy dir content", () => {
    const testDir = createTestDir();
    const copyFixDir = pipe(
      resolveTo(dir(".")),
      goto(dir("./test/files/fix")),
      copyDirContent(testDir)
    );
    copyFixDir();
    expect(fs.readdirSync(testDir.path)).length(4);

    expect(fs.readdirSync(testDir.path).sort()).toEqual(
      ["obj.json", "test.md", "unique.txt", "nested"].sort()
    );
    deleteTestDir(testDir);
    expect(fs.existsSync(testDir.path)).toBeFalsy();
  });

  test("copy dir", () => {
    const testDir = createTestDir();
    const copyFixDir = pipe(
      resolveTo(dir(".")),
      goto(dir("./test/files/fix")),
      copyTo(testDir)
    );
    copyFixDir();
    expect(fs.readdirSync(testDir.path)).length(1);
    expect(fs.readdirSync(np.resolve(testDir.path, "fix"))).length(4);
    expect(fs.readdirSync(testDir.path).sort()).toEqual(["fix"].sort());
    deleteTestDir(testDir);
    expect(fs.existsSync(testDir.path)).toBeFalsy();
  });

  test("delete file", () => {
    const testDir = createTestDir();

    expect(fs.existsSync(testDir.path)).toBeTruthy();
    deleteTestDir(testDir);
    expect(fs.existsSync(testDir.path)).toBeFalsy();
  });

  test("read file", () => {
    const readTxt = pipe(
      resolveTo(dir("./test/files/fix")),
      goto(file("unique.txt")),
      readFile("utf8"),
      str.returnContent()
    );
    const content = readTxt();
    expect(content).toBe("Some unique text!");
  });
});
