import { vi, describe, test, expect } from "vitest";
import { CombinedConverter } from "./CombinedConverter";
import { FileConverter } from "./definitions";
import { LoomFile } from "@loom-io/core";

import { faker } from "@faker-js/faker";

function createConverter(): FileConverter {
	return {
		verify: vi.fn(),
		parse: vi.fn(),
		stringify: vi.fn(),
	};
}

describe("Test Combined Converter", () => {
	test("Create Combined Converter", () => {
		const converter = createConverter();
		const combined = new CombinedConverter(converter);
		expect(combined).toBeInstanceOf(CombinedConverter);
	});

	test("Add Converter", () => {
		const converter = createConverter();
		const combined = new CombinedConverter(converter);
		const converter2 = createConverter();
		combined.addConverter(converter2);
		expect(combined["converters"]).toEqual([converter, converter2]);
	});

	test("Remove Converter", () => {
		const converter = createConverter();
		const converter2 = createConverter();
		const combined = new CombinedConverter([converter, converter2]);
		combined.removeConverter(converter);
		expect(combined["converters"]).toEqual([converter2]);
	});

	test.each([true, false])(
		"Verify Converter return %s",
		async (trueOrFalse) => {
			const converters: FileConverter[] = [];
			const amount = faker.number.int({ min: 2, max: 20 });
			for (let i = 0; i < amount; i++) {
				const converter = createConverter();
				// @ts-expect-error verify is a mock
				converter.verify.mockReturnValueOnce(trueOrFalse);
				converters.push(converter);
			}
			const combined = new CombinedConverter(converters);
			const file = {} as LoomFile;
			expect(await combined.verify(file)).toBe(trueOrFalse);
			for (let i = 0; i < amount; i++) {
				expect(converters[i].verify).toHaveBeenCalledWith(file);
			}
		}
	);

	test("parse", async () => {
		const converters: FileConverter[] = [];
		const converterNumber = faker.number.int({ min: 1, max: 20 });
		const amount = faker.number.int({ min: converterNumber, max: 21 });
		for (let i = 0; i <= amount; i++) {
			const converter = createConverter();
			// @ts-expect-error verify is a mock
			converter.verify.mockReturnValueOnce(i === converterNumber);
			// @ts-expect-error verify is a mock
			converter.parse.mockResolvedValueOnce(i);
			converters.push(converter);
		}
		const combined = new CombinedConverter(converters);
		const file = {} as LoomFile;
		expect(await combined.parse(file)).toBe(converterNumber);
		expect(converters[converterNumber].parse).toHaveBeenCalledWith(file);
	});

	test("stringify", async () => {
		const converters: FileConverter[] = [];
		const converterNumber = faker.number.int({ min: 1, max: 20 });
		const amount = faker.number.int({ min: converterNumber, max: 21 });
		for (let i = 0; i <= amount; i++) {
			const converter = createConverter();
			// @ts-expect-error verify is a mock
			converter.verify.mockReturnValueOnce(i === converterNumber);
			// @ts-expect-error verify is a mock
			converter.stringify.mockResolvedValueOnce(i);
			converters.push(converter);
		}
		const combined = new CombinedConverter(converters);
		const file = {} as LoomFile;
		await combined.stringify(file, { test: "test" });
		expect(converters[converterNumber].stringify).toHaveBeenCalledWith(file, {
			test: "test",
		});
	});
});
