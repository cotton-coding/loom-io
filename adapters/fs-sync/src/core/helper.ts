import type { EntityBase, File, Directory, ListItem } from "./definitions.js";
import { FTYPES } from "./definitions.js";

export const getPath = (pathOrBase: string | EntityBase) =>
  typeof pathOrBase === "string" ? pathOrBase : pathOrBase.path;

const isBase = (item: NonNullable<unknown>): item is EntityBase =>
  typeof item === "object" && "$type" in item;
export const isDirectory = (item: NonNullable<unknown>): item is Directory =>
  isBase(item) && item.$type === FTYPES.DIRECTORY;
export const isFile = (item: NonNullable<unknown>): item is File =>
  isBase(item) && item.$type === FTYPES.FILE;
export const isListItem = (item: NonNullable<unknown>): item is ListItem =>
  isBase(item) && item.$type === FTYPES.LISTITEM;
