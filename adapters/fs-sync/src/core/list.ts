import { readdirSync } from "node:fs";
import type { Directory, Entity, File, ListItem } from "./definitions.js";
import { FTYPES } from "./definitions.js";
import { isDirectory, isFile, isListItem } from "./helper.js";
import * as np from "path";

export const names =
  () =>
  (list: ListItem[]): string[] => {
    return list.map(({ dirent }) => dirent.name);
  };

export const convert =
  () =>
  (item: Entity): File | Directory => {
    if (!isListItem(item)) {
      return item;
    }

    if (item.dirent.isDirectory()) {
      return {
        $type: FTYPES.DIRECTORY,
        path: np.join(item.path, item.dirent.name),
      };
    } else {
      return {
        $type: FTYPES.FILE,
        path: np.join(item.path, item.dirent.name),
      };
    }
  };

export function only(type: FTYPES.FILE): (dir: Entity[]) => File[];
export function only(type: FTYPES.DIRECTORY): (dir: Entity[]) => Directory[];
export function only(type: FTYPES): (list: Entity[]) => (File | Directory)[] {
  return (list) => {
    const convertedList = list.map(convert());
    return convertedList.filter(({ $type }) => $type === type);
  };
}
