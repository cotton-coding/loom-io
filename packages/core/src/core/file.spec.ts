import { expect, test, describe, beforeEach, afterEach } from "vitest";
import { LoomFile } from "./file.js";
import { InMemoryAdapterHelper } from "@loom-io/test-utils";

import { Directory } from "./dir.js";
import { FILE_SIZE_UNIT } from "../definitions.js";
import { faker } from "@faker-js/faker";
import { Editor } from "./editor.js";

describe("Test File Service", () => {
	let testHelper: InMemoryAdapterHelper;
	let adapter: InMemoryAdapterHelper["adapter"];

	beforeEach(async () => {
		testHelper = await InMemoryAdapterHelper.init();
		await testHelper.createDirectory("test/data");
		await testHelper.createFile(
			"test/data/test.json",
			JSON.stringify({ test: true })
		);
		adapter = testHelper.adapter;
	});

	test("Create Instance and set path", () => {
		const path = "test/data/test.txt";
		const file = LoomFile.from(adapter, path);
		expect(file).toBeInstanceOf(LoomFile);
		expect(file.path).toBe(`${path}`);
	});

	test("Get file size", async () => {
		const path = "test/data/test.txt";
		const content = faker.lorem.words(10000);
		const testFilePath = testHelper.createFile(path, content);
		const file = LoomFile.from(adapter, testFilePath);
		const bytes = await file.getSize(FILE_SIZE_UNIT.BYTE);
		expect(bytes).toBe(content.length);
		const megaBytes = await file.getSize(FILE_SIZE_UNIT.MEGABYTE);
		expect(megaBytes).toBe(content.length / 1024 / 1024);
		const yottaBytes = await file.getSize(FILE_SIZE_UNIT.YOTTABYTE);
		expect(yottaBytes).toBe(
			content.length / 1024 / 1024 / 1024 / 1024 / 1024 / 1024 / 1024 / 1024
		);
		const gigaByte = await file.getSize(FILE_SIZE_UNIT.GIGABYTE);
		expect(gigaByte).toBe(content.length / 1024 / 1024 / 1024);
		testHelper.destroy();
	});

	test("Get file meta data", async () => {
		const path = "test/data/test.txt";
		const content = faker.lorem.words(10000);
		const testFilePath = testHelper.createFile(path, content);
		const file = LoomFile.from(adapter, testFilePath);
		const meta = await file.getMeta();
		expect(meta.size).toBe(content.length);
		expect(meta.createdAt).toBeInstanceOf(Date);
		expect(meta.updatedAt).toBeInstanceOf(Date);
		const rawMeta = await file.getRawMeta();
		expect(rawMeta.size).toBe(content.length);
		expect(rawMeta.birthtime).toBeDefined();
		expect(rawMeta.mtime).toBeDefined();
	});

	test("If File exists on Object", async () => {
		const file = LoomFile.from(adapter, "./test/data/test.json");
		await expect(file.exists()).resolves.toBeTruthy();
	});
	test("If File exists on Object does not exists", async () => {
		const file = LoomFile.from(adapter, "./test/data/notexists.json");
		await expect(file.exists()).resolves.toBeFalsy();
	});

	test("get parent or dir", () => {
		const file = LoomFile.from(adapter, "./test/data/test.json");
		expect(file.dir).instanceOf(Directory);
		expect(file.dir.path).toBe("test/data");
		expect(file.dir).toBe(file.parent);
	});

	test("get reader object", async () => {
		const file = LoomFile.from(adapter, "./test/data/test.json");
		const reader = await file.reader();
		expect(reader).toBeDefined();
		expect(reader).toBeInstanceOf(Editor);
		reader.close();
	});

	describe("Test meta data", () => {
		test("Get extension", () => {
			const file = LoomFile.from(adapter, "./test/data/test.json");
			expect(file.extension).toBe("json");
		});

		test("Get extension with no extension", () => {
			const file = LoomFile.from(adapter, "./test/data/test");
			expect(file.extension).toBe(undefined);
		});

		test("Get File Name", () => {
			const file = LoomFile.from(adapter, "./test/data/test.json");
			expect(file.name).toBe("test.json");
			expect(file.getNameWithoutExtension()).toBe("test");
		});

		test("Get File Name with no extension", () => {
			const file = LoomFile.from(adapter, "./test/data/test");
			expect(file.name).toBe("test");
			expect(file.getNameWithoutExtension()).toBe("test");
		});
	});

	describe("Test with generated file", () => {
		beforeEach(async () => {
			testHelper = await InMemoryAdapterHelper.init();
			adapter = testHelper.adapter;
		});

		afterEach(async () => {
			await testHelper.destroy();
		});

		test("Read text file", async () => {
			const contentToWrite = faker.lorem.words(1000);
			const testFile = testHelper.createFile(
				"someTestFile/file.txt",
				contentToWrite
			);
			const file = LoomFile.from(adapter, testFile);
			const content = await file.text();
			expect(content).toBe(contentToWrite);
		});

		test.each(["json", "yaml", "yml", "log", "txt"])(
			"Get extension %s",
			async (extension) => {
				const testFile = testHelper.createFile(
					faker.system.commonFileName(extension),
					"test"
				);
				const file = LoomFile.from(adapter, testFile);
				expect(file.extension).toBe(extension);
			}
		);

		test("Read file plain", async () => {
			const testContent = "1234k2hk3jh1fasdasfc%";
			const testFile = await testHelper.createFile(undefined, testContent);

			const file = LoomFile.from(adapter, testFile);
			const content = await file.plain();
			expect(content).toBeInstanceOf(Buffer);
			expect(content.toString()).toBe(testContent);
		});

		test("Write file", async () => {
			const testContent = "1234k2hk3jh1fasdasfc%";
			const testFile = await testHelper.createFile(undefined, testContent);

			const file = LoomFile.from(adapter, testFile);
			const newContent = "new content";
			await file.write(newContent);
			const content = await file.text();
			expect(content).toBe(newContent);
		});

		test("Create file", async () => {
			const testFile = await testHelper.createFile(undefined, "test");
			const file = LoomFile.from(adapter, testFile);
			await file.create();
			expect(await file.exists()).toBeTruthy();
		});

		test("Copy file into file", async () => {
			const testFile = await testHelper.createFile(undefined, "test");
			const file = LoomFile.from(adapter, testFile);
			await file.create();
			await file.write("new content");
			const newFile = new LoomFile(adapter, file.dir, "newFile.txt");
			await file.copyTo(newFile);
			expect(await newFile.exists()).toBeTruthy();
		});

		test("Copy file into directory", async () => {
			const testFile = await testHelper.createFile(undefined, "test");
			const file = LoomFile.from(adapter, testFile);
			await file.create();
			await file.write("new content");
			const newDir = new Directory(adapter, "newDir");
			await newDir.create();
			const newFile = await file.copyTo(newDir);
			expect(await newFile.exists()).toBeTruthy();
			expect(newFile.name).toBe(file.name);
			expect(newFile.text()).resolves.toBe("new content");
		});

		test("Delete file", async () => {
			const testFile = await testHelper.createFile(undefined, "test");
			const file = LoomFile.from(adapter, testFile);
			await file.delete();
			expect(await file.exists()).toBeFalsy();
		});
	});

	describe("Test Symbol", () => {
		test("toPrimitive", () => {
			const file = LoomFile.from(adapter, "./test/data/test.json");
			expect(`${file}`).toBe("test/data/test.json");
			expect(file + "").toBe("test/data/test.json");
			expect(String(file)).toBe("test/data/test.json");
			expect(+file).toBeNaN();
		});

		test("toStringTag", () => {
			const file = LoomFile.from(adapter, "./test/data/test.json");
			expect(Object.prototype.toString.call(file)).toBe("[object LoomFile]");
		});
	});
});
