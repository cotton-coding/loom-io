import type { Base, File, Directory, ListItem } from "./definitions.js";
import { FTYPES } from "./definitions.js";
import { g } from "pipe-and-combine";
import * as np from "path";

export const switchFile = (pathOrFile: string | File) =>
  isFile(pathOrFile)
    ? g((_base: { base: string }) => {
        const { base } = _base ?? { base: "/" };
        return {
          $type: FTYPES.FILE,
          base,
          path: pathOrFile.path,
        };
      })
    : g((_base: { base: string }) => {
        const { base } = _base ?? { base: "/" };
        return {
          $type: FTYPES.FILE,
          base,
          path: np.join(base, pathOrFile),
        };
      });

export const switchDirectory = (pathOrDir: string | Directory) =>
  isDirectory(pathOrDir)
    ? g((_base: { base: string }) => {
        const { base } = _base ?? { base: "/" };
        return {
          $type: FTYPES.DIRECTORY,
          base,
          path: pathOrDir.path,
        };
      })
    : g((_base: { base: string }) => {
        const { base } = _base ?? { base: "/" };
        return {
          $type: FTYPES.DIRECTORY,
          base,
          path: np.join(base, pathOrDir),
        };
      });

export const switchBase = (base: string) =>
  g(() => ({
    base,
  }));

export const createFile = (path: string, base = process.cwd()): File => ({
  $type: FTYPES.FILE,
  base: base,
  path: np.join(base, path),
});

export const createDirectory = (
  path: string,
  base = process.cwd()
): Directory => ({
  $type: FTYPES.DIRECTORY,
  base,
  path: np.join(base, path),
});

export function init(base: string, type: FTYPES.DIRECTORY): () => Directory;
export function init(base: string, type: FTYPES.FILE): () => File;
export function init(
  base: string,
  type: FTYPES.FILE | FTYPES.DIRECTORY = FTYPES.DIRECTORY
): () => File | Directory {
  return type === FTYPES.DIRECTORY
    ? () => {
        return createDirectory(base);
      }
    : () => {
        return createFile(base);
      };
}
const isBase = (item: NonNullable<unknown>): item is Base =>
  typeof item === "object" && "$type" in item;
export const isDirectory = (item: NonNullable<unknown>): item is Directory =>
  isBase(item) && item.$type === FTYPES.DIRECTORY;
export const isFile = (item: NonNullable<unknown>): item is File =>
  isBase(item) && item.$type === FTYPES.FILE;
export const isListItem = (item: NonNullable<unknown>): item is ListItem =>
  isBase(item) && item.$type === FTYPES.LISTITEM;
