import { describe, test, expect } from "vitest";
import { FilesystemAdapter } from "./lib";
import { normalize } from "node:path";

describe("FilesystemAdapter", () => {
  test("should be able to create a new instance", () => {
    const adapter = new FilesystemAdapter();
    expect(adapter).toBeDefined();
  });

  test("fullPath should return the full path of a file", () => {
    const adapter = new FilesystemAdapter(normalize("/root/dir"));
    const file = adapter.file("file.txt");
    expect(adapter.getFullPath(file)).toBe(normalize("/root/dir/file.txt"));
  });

  test("fullPath should return the full path of a directory", () => {
    const adapter = new FilesystemAdapter(normalize("/etc/loom"));
    const dir = adapter.dir("dir");
    expect(adapter.getFullPath(dir)).toBe(normalize("/etc/loom/dir"));
  });

  test("fullPath should fail to other adapters", () => {
    const adapter = new FilesystemAdapter(normalize("/etc/loom"));
    const adapter2 = new FilesystemAdapter(normalize("/etc/loom"));
    const dir2 = adapter2.dir("dir");
    expect(() => adapter.getFullPath(dir2)).toThrowError();
  });

  test("fullPath should return the full path also from other adapter if flag is set", () => {
    const adapter = new FilesystemAdapter(normalize("/etc/loom"));
    const adapter2 = new FilesystemAdapter(normalize("/etc/loom"));
    const dir2 = adapter2.dir("dir");
    expect(adapter.getFullPath(dir2, true)).toBe(normalize("/etc/loom/dir"));
  });

  test("fullPath should return the full path of a file (cwd)", () => {
    const adapter = new FilesystemAdapter();
    const file = adapter.file("file.txt");
    expect(adapter.getFullPath(file)).toBe(normalize(process.cwd() + "/file.txt"));
  });

  test("fullPath should return the full path of a file (cwd)", () => {
    const adapter = new FilesystemAdapter();
    const file = adapter.file(normalize("/deep/file.txt"));
    expect(adapter.getFullPath(file)).toBe(normalize(process.cwd() + "/deep/file.txt"));
  });

  test("fullPath should return the full path of a directory (cwd)", () => {
    const adapter = new FilesystemAdapter();
    const dir = adapter.dir("dir");
    expect(adapter.getFullPath(dir)).toBe(normalize(process.cwd() + "/dir"));
  });

  test("file should return a new LoomFile instance", () => {
    const adapter = new FilesystemAdapter();
    const file = adapter.file("file.txt");
    expect(file).toBeDefined();
  });

  test("dir should return a new Directory instance", () => {
    const adapter = new FilesystemAdapter();
    const dir = adapter.dir("dir");
    expect(dir).toBeDefined();
  });
});
