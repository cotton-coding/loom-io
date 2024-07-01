import { describe, test, expect } from "vitest";
import { FilesystemAdapter } from "./lib";

describe("FilesystemAdapter", () => {
	test("should be able to create a new instance", () => {
		const adapter = new FilesystemAdapter();
		expect(adapter).toBeDefined();
	});

	test("fullPath should return the full path of a file", () => {
		const adapter = new FilesystemAdapter("/root/dir");
		const file = adapter.file("file.txt");
		expect(adapter.getFullPath(file)).toBe("/root/dir/file.txt");
	});

	test("fullPath should return the full path of a directory", () => {
		const adapter = new FilesystemAdapter("/etc/loom");
		const dir = adapter.dir("dir");
		expect(adapter.getFullPath(dir)).toBe("/etc/loom/dir");
	});

	test("fullPath should return the full path of a file (cwd)", () => {
		const adapter = new FilesystemAdapter();
		const file = adapter.file("file.txt");
		expect(adapter.getFullPath(file)).toBe(process.cwd() + "/file.txt");
	});

	test("fullPath should return the full path of a directory (cwd)", () => {
		const adapter = new FilesystemAdapter();
		const dir = adapter.dir("dir");
		expect(adapter.getFullPath(dir)).toBe(process.cwd() + "/dir");
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
