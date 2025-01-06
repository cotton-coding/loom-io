import { readdirSync } from "node:fs";
import type { Base, Directory, Entity, File, ListItem } from "./definitions.js";
import { FTYPES } from "./definitions.js";
import { isDirectory, isFile, isListItem } from "./general.js";
import * as np from "path";

export const list =
  (recursive: boolean = false) =>
  (dir: Directory): ListItem[] => {
    return readdirSync(dir.path, { withFileTypes: true, recursive }).map(
      (dirent) => ({
        $type: FTYPES.LISTITEM,
        base: dir.base,
        path: dir.path,
        dirent,
      })
    );
  };

export const listToNames =
  () =>
  (list: ListItem[]): string[] => {
    return list.map(({ dirent }) => dirent.name);
  };

export const convertListItem =
  () =>
  (item: Entity): Exclude<Entity, ListItem> => {
    if (!isListItem(item)) {
      return item;
    }

    if (item.dirent.isDirectory()) {
      return {
        $type: FTYPES.DIRECTORY,
        base: item.base,
        path: np.join(item.path, item.dirent.name),
      };
    } else {
      return {
        $type: FTYPES.FILE,
        base: item.base,
        path: np.join(item.path, item.dirent.name),
      };
    }
  };

export function only(type: FTYPES.FILE): (dir: Entity[]) => File[];
export function only(type: FTYPES.DIRECTORY): (dir: Entity[]) => Directory[];
export function only(type: FTYPES): (list: Entity[]) => (File | Directory)[] {
  return (list) => {
    const convertedList = list.map(convertListItem());
    return convertedList.filter(({ $type }) => $type === type);
  };
}
