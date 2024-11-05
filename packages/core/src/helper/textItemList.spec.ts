import { describe, expect, test } from "vitest";
import { TextItemList } from "./textItemList.js";
import { faker } from "@faker-js/faker";

class TestTextItemList extends TextItemList {
  public unwrapSearchAndAddBefore(item: TextItemList) {
    return this.searchAndAddBefore(item);
  }

  public unwrapSearchAndAddAfter(item: TextItemList) {
    return this.searchAndAddAfter(item);
  }

  public unwrapAddBefore(item: TextItemList) {
    return this.addBefore(item);
  }

  public unwrapAddAfter(item: TextItemList) {
    return this.addAfter(item);
  }
}

describe("LineList", () => {
  test("constructor", () => {
    const start = faker.number.int();
    const end = faker.number.int();
    const list = new TextItemList({ start, end });
    expect(list.start).toBe(start);
    expect(list.end).toBe(end);
    expect(list.length).toBe(end - start);
    expect(list.isFirstItem()).toBe(true);
    expect(list.isLastItem()).toBe(true);
  });

  test("add", () => {
    const list0 = new TextItemList({ start: 0, end: 7 });
    const list13 = new TextItemList({ start: 13, end: 20 });
    const list37 = new TextItemList({ start: 37, end: 39 });
    const list40 = new TextItemList({ start: 40, end: 42 });
    const list80 = new TextItemList({ start: 80, end: 87 });
    const list97 = new TextItemList({ start: 97, end: 137 });

    list37.add(list13);
    expect(list37.prev()).toBe(list13);
    list37.add(list97);
    expect(list37.next()).toBe(list97);
    list97.add(list40);
    expect(list97.prev()).toBe(list40);
    expect(list97.next()).toBe(undefined);
    expect(list97.isLastItem()).toBe(true);
    expect(list37.next()).toBe(list40);
    list97.add(list0);
    expect(list97.prev()).toBe(list40);
    expect(list13.prev()).toBe(list0);
    expect(list13.next()).toBe(list37);
    expect(list13.isFirstItem()).toBe(false);
    list0.add(list80);
    expect(list0.next()).toBe(list13);
    expect(list0.prev()).toBe(undefined);
    expect(list0.isFirstItem()).toBe(true);
    expect(list13.prev()).toBe(list0);
  });

  test("add with adding other list", () => {
    const list0 = new TextItemList({ start: 0, end: 7 });
    const list13 = new TextItemList({ start: 13, end: 20 });
    const list37 = new TextItemList({ start: 37, end: 39 });
    const list40 = new TextItemList({ start: 40, end: 42 });
    const list80 = new TextItemList({ start: 80, end: 87 });
    const list97 = new TextItemList({ start: 97, end: 137 });

    list0.add(list80);
    list0.add(list40);

    list37.add(list13);
    list37.add(list97);

    list80.add(list37);

    expect(list0.next()).toBe(list13);
    expect(list0.prev()).toBe(undefined);
    expect(list13.next()).toBe(list37);
    expect(list13.prev()).toBe(list0);
    expect(list37.next()).toBe(list40);
    expect(list37.prev()).toBe(list13);
    expect(list40.next()).toBe(list80);
    expect(list40.prev()).toBe(list37);
    expect(list80.next()).toBe(list97);
    expect(list80.prev()).toBe(list40);
    expect(list97.next()).toBe(undefined);
    expect(list97.prev()).toBe(list80);
  });

  test("add with large list", () => {
    const amount = faker.number.int({ min: 20000, max: 43000 });
    const elements: TextItemList[] = [];
    const elementSize = faker.number.int({ min: 1, max: 300 });
    let lastElement: TextItemList | undefined;
    for (let i = 0; i < amount; i++) {
      const randomNumber = faker.number.int();
      const nextStart = lastElement?.end ?? 0 + randomNumber;
      lastElement = new TextItemList({
        start: nextStart,
        end: nextStart + elementSize,
      });
      elements.push(lastElement);
    }

    expect(elements.length).toBe(amount);

    let list0 = elements.shift()!;
    while (elements.length > 7) {
      const random = faker.number.int({ min: 1, max: elements.length - 2 });
      if (elements.length < random) {
        break;
      }
      const subList = elements.shift();
      for (let i = 0; i < random; i++) {
        subList!.add(elements.shift()!);
      }
      list0.add(subList!);
      list0 = list0.getLastItem();
    }

    while (elements.length > 0) {
      list0.add(elements.shift()!);
    }

    let count = 1;
    let item = list0.getFirstItem();
    while (item.hasNext()) {
      item = item.next()!;
      count++;
    }

    expect(count).toBe(amount);
  });

  test("searchAndAddBefore via unwrap", () => {
    const list0 = new TestTextItemList({ start: 0, end: 7 });
    const list37 = new TestTextItemList({ start: 37, end: 39 });
    const list13 = new TestTextItemList({ start: 13, end: 20 });
    const list40 = new TestTextItemList({ start: 40, end: 42 });
    const list80 = new TestTextItemList({ start: 80, end: 87 });

    list80.unwrapSearchAndAddBefore(list13);
    expect(list80.prev()).toBe(list13);
    list80.unwrapSearchAndAddBefore(list40);
    expect(list13.next()).toBe(list40);
    expect(list80.prev()).toBe(list40);
    expect(list40.prev()).toBe(list13);
    list40.unwrapSearchAndAddBefore(list0);
    expect(list40.prev()).toBe(list13);
    expect(list13.prev()).toEqual(list0);

    list40.unwrapSearchAndAddBefore(list37);
    expect(list40.prev()).toBe(list37);
    expect(list40.next()).toBe(list80);
    expect(list37.prev()).toBe(list13);
  });

  test("searchAndAddAfter via unwrap", () => {
    const list37 = new TestTextItemList({ start: 37, end: 39 });
    const list13 = new TestTextItemList({ start: 13, end: 20 });
    const list40 = new TestTextItemList({ start: 40, end: 42 });
    const list80 = new TestTextItemList({ start: 80, end: 87 });

    list13.unwrapSearchAndAddAfter(list80);
    expect(list13.next()).toBe(list80);
    list13.unwrapSearchAndAddAfter(list40);
    expect(list80.prev()).toBe(list40);
    expect(list13.next()).toBe(list40);
    expect(list40.next()).toBe(list80);

    list13.unwrapSearchAndAddAfter(list37);
    expect(list13.next()).toBe(list37);
  });

  test("addBefore via unwrap", () => {
    const list0 = new TestTextItemList({ start: 0, end: 7 });
    const list13 = new TestTextItemList({ start: 13, end: 20 });
    const list40 = new TestTextItemList({ start: 40, end: 42 });
    const list80 = new TestTextItemList({ start: 80, end: 87 });

    list80.unwrapAddBefore(list13);
    expect(list80.prev()).toBe(list13);
    list80.unwrapAddBefore(list40);
    expect(list13.next()).toBe(list40);
    expect(list80.prev()).toBe(list40);
    expect(list40.prev()).toBe(list13);
    list40.unwrapAddBefore(list0);
    expect(list40.prev()).toBe(list0);
  });

  test("addAfter via unwrap", () => {
    const list0 = new TestTextItemList({ start: 0, end: 7 });
    const list13 = new TestTextItemList({ start: 13, end: 20 });
    const list40 = new TestTextItemList({ start: 40, end: 42 });
    const list80 = new TestTextItemList({ start: 80, end: 87 });

    list80.unwrapAddAfter(list13);
    expect(list80.next()).toBe(list13);
    list80.unwrapAddAfter(list40);
    expect(list13.prev()).toBe(list40);
    expect(list80.next()).toBe(list40);
    expect(list40.next()).toBe(list13);
    list40.unwrapAddAfter(list0);
    expect(list40.next()).toBe(list0);
  });

  test("hasNext", () => {
    const list0 = new TextItemList({ start: 0, end: 7 });
    const list80 = new TextItemList({ start: 80, end: 87 });
    const list97 = new TextItemList({ start: 97, end: 137 });

    list0.add(list80);
    expect(list0.hasNext()).toBe(true);
    expect(list80.hasNext()).toBe(false);
    expect(list97.hasNext()).toBe(false);
    list0.add(list97);
    expect(list0.hasNext()).toBe(true);
    expect(list80.hasNext()).toBe(true);
    expect(list97.hasNext()).toBe(false);
  });

  test("hasPrev", () => {
    const list0 = new TextItemList({ start: 0, end: 7 });
    const list80 = new TextItemList({ start: 80, end: 87 });
    const list97 = new TextItemList({ start: 97, end: 137 });

    list0.add(list80);
    expect(list0.hasPrev()).toBe(false);
    expect(list80.hasPrev()).toBe(true);
    expect(list97.hasPrev()).toBe(false);
    list0.add(list97);
    expect(list0.hasPrev()).toBe(false);
    expect(list80.hasPrev()).toBe(true);
    expect(list97.hasPrev()).toBe(true);
  });

  describe("Test with reverse", () => {
    test("getLastReverse", () => {
      const list0 = new TextItemList({ start: 0, end: 7 });
      const list8 = new TextItemList({ start: 8, end: 12 });
      const list13 = new TextItemList({ start: 13, end: 20 });
      const list37 = new TextItemList({ start: 37, end: 39 });
      const list40 = new TextItemList({
        start: 40,
        end: 42,
        readReverse: true,
      });
      const list80 = new TextItemList({
        start: 80,
        end: 87,
        readReverse: true,
      });
      const list200 = new TextItemList({
        start: 200,
        end: 300,
        readReverse: true,
      });

      list0.add(list13);
      list0.add(list37);
      list0.add(list80);
      list0.add(list40);
      list13.add(list200);
      list200.add(list8);

      expect(list0.getLastReverse()).toBe(list40);
      expect(list40.getLastReverse()).toBe(list40);
      expect(list80.getLastReverse()).toBe(list40);
      expect(list37.getLastReverse()).toBe(list40);
      expect(list200.getLastReverse()).toBe(list40);
      expect(list13.getLastReverse()).toBe(list40);
    });

    test("getLastReverse with no reverse", () => {
      const list0 = new TextItemList({ start: 0, end: 7 });
      const list8 = new TextItemList({ start: 8, end: 12 });
      const list13 = new TextItemList({ start: 13, end: 20 });
      const list37 = new TextItemList({ start: 37, end: 39 });
      const list40 = new TextItemList({ start: 40, end: 42 });
      const list80 = new TextItemList({ start: 80, end: 87 });
      const list200 = new TextItemList({ start: 200, end: 300 });

      list0.add(list13);
      list0.add(list37);
      list0.add(list80);
      list0.add(list40);
      list13.add(list200);
      list200.add(list8);

      expect(list8.getLastReverse()).toBeUndefined();
      expect(list200.getLastReverse()).toBeUndefined();
      expect(list13.getLastReverse()).toBeUndefined();
      expect(list37.getLastReverse()).toBeUndefined();
      expect(list80.getLastReverse()).toBeUndefined();
      expect(list40.getLastReverse()).toBeUndefined();
      expect(list0.getLastReverse()).toBeUndefined();
    });

    test("getLastReverse with only reverse", () => {
      const list0 = new TextItemList({ start: 0, end: 7, readReverse: true });
      const list8 = new TextItemList({ start: 8, end: 12, readReverse: true });
      const list13 = new TextItemList({
        start: 13,
        end: 20,
        readReverse: true,
      });
      const list37 = new TextItemList({
        start: 37,
        end: 39,
        readReverse: true,
      });
      const list40 = new TextItemList({
        start: 40,
        end: 42,
        readReverse: true,
      });
      const list80 = new TextItemList({
        start: 80,
        end: 87,
        readReverse: true,
      });
      const list200 = new TextItemList({
        start: 200,
        end: 300,
        readReverse: true,
      });

      list0.add(list13);
      list0.add(list37);
      list0.add(list80);
      list0.add(list40);
      list13.add(list200);
      list200.add(list8);

      expect(list8.getLastReverse()).toBe(list0);
      expect(list200.getLastReverse()).toBe(list0);
      expect(list13.getLastReverse()).toBe(list0);
      expect(list37.getLastReverse()).toBe(list0);
      expect(list80.getLastReverse()).toBe(list0);
      expect(list40.getLastReverse()).toBe(list0);
      expect(list0.getLastReverse()).toBe(list0);
    });

    test("getLastForward", () => {
      const list0 = new TextItemList({ start: 0, end: 7 });
      const list8 = new TextItemList({ start: 8, end: 12 });
      const list13 = new TextItemList({ start: 13, end: 20 });
      const list37 = new TextItemList({ start: 37, end: 39 });
      const list40 = new TextItemList({
        start: 40,
        end: 42,
        readReverse: true,
      });
      const list80 = new TextItemList({
        start: 80,
        end: 87,
        readReverse: true,
      });
      const list97 = new TextItemList({
        start: 97,
        end: 137,
        readReverse: true,
      });

      list0.add(list13);
      list0.add(list37);
      list0.add(list80);
      list0.add(list40);
      list40.add(list97);
      list13.add(list8);

      expect(list0.getLastForward()).toBe(list37);
      expect(list40.getLastForward()).toBe(list37);
      expect(list80.getLastForward()).toBe(list37);
      expect(list37.getLastForward()).toBe(list37);
      expect(list97.getLastForward()).toBe(list37);
      expect(list13.getLastForward()).toBe(list37);
    });

    test("getLastForward with only reverse", () => {
      const list0 = new TextItemList({ start: 0, end: 7, readReverse: true });
      const list8 = new TextItemList({ start: 8, end: 12, readReverse: true });
      const list13 = new TextItemList({
        start: 13,
        end: 20,
        readReverse: true,
      });
      const list37 = new TextItemList({
        start: 37,
        end: 39,
        readReverse: true,
      });
      const list40 = new TextItemList({
        start: 40,
        end: 42,
        readReverse: true,
      });
      const list80 = new TextItemList({
        start: 80,
        end: 87,
        readReverse: true,
      });
      const list97 = new TextItemList({
        start: 97,
        end: 137,
        readReverse: true,
      });

      list0.add(list13);
      list0.add(list37);
      list0.add(list80);
      list0.add(list40);
      list40.add(list97);
      list13.add(list8);

      expect(list8.getLastForward()).toBeUndefined();
      expect(list97.getLastForward()).toBeUndefined();
      expect(list13.getLastForward()).toBeUndefined();
      expect(list37.getLastForward()).toBeUndefined();
      expect(list80.getLastForward()).toBeUndefined();
      expect(list40.getLastForward()).toBeUndefined();
      expect(list0.getLastForward()).toBeUndefined();
    });

    test("getLastForward with no reverse", () => {
      const list0 = new TextItemList({ start: 0, end: 7 });
      const list8 = new TextItemList({ start: 8, end: 12 });
      const list13 = new TextItemList({ start: 13, end: 20 });
      const list37 = new TextItemList({ start: 37, end: 39 });
      const list40 = new TextItemList({ start: 40, end: 42 });
      const list80 = new TextItemList({ start: 80, end: 87 });
      const list97 = new TextItemList({ start: 97, end: 137 });

      list0.add(list13);
      list0.add(list37);
      list0.add(list80);
      list0.add(list40);
      list40.add(list97);
      list13.add(list8);

      expect(list8.getLastForward()).toBe(list97);
      expect(list13.getLastForward()).toBe(list97);
      expect(list37.getLastForward()).toBe(list97);
      expect(list80.getLastForward()).toBe(list97);
      expect(list40.getLastForward()).toBe(list97);
      expect(list97.getLastForward()).toBe(list97);
      expect(list0.getLastForward()).toBe(list97);
    });
  });
});
