import { vi, describe, test, expect } from "vitest";
import { CombinedConverter } from "./CombinedConverter";
import { FileConverter } from "./definitions";
import { LoomFile } from "@loom-io/core";

import { faker } from "@faker-js/faker";
import { NoValidFileConverterException } from "./exceptions";

function createConverter(): FileConverter {
  return {
    verify: vi.fn(),
    parse: vi.fn(),
    unify: vi.fn(),
  };
}

describe("Test Combined Converter", () => {
  test("Create Combined Converter", () => {
    const converter = createConverter();
    const combined = new CombinedConverter(converter);
    expect(combined).toBeInstanceOf(CombinedConverter);
  });

  test("Default Options", () => {
    const combined = new CombinedConverter(createConverter());
    expect(combined.options).toEqual({ failOnNoConverter: true });
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

  test("Verify with no converter should return false", async () => {
    const converters: FileConverter[] = [];
    const amount = faker.number.int({ min: 1, max: 20 });
    for (let i = 0; i < amount; i++) {
      const converter = createConverter();
      // @ts-expect-error verify is a mock
      converter.verify.mockReturnValueOnce(false);
      converters.push(converter);
    }
    const combined = new CombinedConverter(converters);
    const file = {} as LoomFile;
    expect(await combined.verify(file)).toBe(false);
  });

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

  test("parse with no converter should throw an error", async () => {
    const converters: FileConverter[] = [];
    const amount = faker.number.int({ min: 1, max: 20 });
    for (let i = 0; i <= amount; i++) {
      const converter = createConverter();
      // @ts-expect-error verify is a mock
      converter.verify.mockReturnValueOnce(false);
      converters.push(converter);
    }
    const combined = new CombinedConverter(converters);
    const file = {} as LoomFile;
    await expect(combined.parse(file)).rejects.toThrow(
      NoValidFileConverterException
    );
  });

  test("unify", async () => {
    const converters: FileConverter[] = [];
    const converterNumber = faker.number.int({ min: 1, max: 20 });
    const amount = faker.number.int({ min: converterNumber, max: 21 });
    for (let i = 0; i <= amount; i++) {
      const converter = createConverter();
      // @ts-expect-error verify is a mock
      converter.verify.mockReturnValueOnce(i === converterNumber);
      // @ts-expect-error verify is a mock
      converter.unify.mockResolvedValueOnce(i);
      converters.push(converter);
    }
    const combined = new CombinedConverter(converters);
    const file = {} as LoomFile;
    await combined.unify(file, { test: "test" });
    expect(converters[converterNumber].unify).toHaveBeenCalledWith(file, {
      test: "test",
    });
  });

  test("unify with no converter should throw an error", async () => {
    const converters: FileConverter[] = [];
    const amount = faker.number.int({ min: 1, max: 20 });
    for (let i = 0; i <= amount; i++) {
      const converter = createConverter();
      // @ts-expect-error verify is a mock
      converter.verify.mockReturnValueOnce(false);
      converters.push(converter);
    }
    const combined = new CombinedConverter(converters);
    const file = {} as LoomFile;
    await expect(combined.unify(file, { test: "test" })).rejects.toThrow(
      NoValidFileConverterException
    );
  });

  describe("Do not fail on no converter (options test)", () => {
    test("parse", async () => {
      const converters: FileConverter[] = [];
      const amount = faker.number.int({ min: 1, max: 20 });
      for (let i = 0; i <= amount; i++) {
        const converter = createConverter();
        // @ts-expect-error verify is a mock
        converter.verify.mockReturnValueOnce(false);
        converters.push(converter);
      }
      const combined = new CombinedConverter(converters, {
        failOnNoConverter: false,
      });
      const file = {} as LoomFile;
      expect(combined.parse(file)).resolves.toBeUndefined();
    });

    test("unify", async () => {
      const converters: FileConverter[] = [];
      const amount = faker.number.int({ min: 1, max: 20 });
      for (let i = 0; i <= amount; i++) {
        const converter = createConverter();
        // @ts-expect-error verify is a mock
        converter.verify.mockReturnValueOnce(false);
        converters.push(converter);
      }
      const combined = new CombinedConverter(converters);
      combined.options = { failOnNoConverter: false };
      const file = {} as LoomFile;
      expect(combined.unify(file, { test: "test" })).resolves.toBeUndefined();
    });
  });
});
