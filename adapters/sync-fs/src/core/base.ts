import * as fs from "fs";
import { pipe, g, map } from "pipe-and-combine";
import * as np from "path";
import type { Base, File, Directory, ListItem, Entity } from "./definitions.js";
import { FTYPES } from "./definitions.js";
import { convertListItem, list, only } from "./list.js";
import { getPath } from "./helper.js";
import { IGNORE_FIlES } from "../core/definitions.js";
import { isDirectory } from "../../dist/core/general.js";

export function base<TBase extends FTYPES>(basePath: string, baseType?: TBase) {
  if (!baseType) {
    return (path: string) => {
      return {
        $type: baseType,
        base: basePath,
        path: np.join(basePath, path),
      };
    };
  } else {
    return <TType extends FTYPES>(path: string, type: TType) => {
      return {
        $type: type,
        base: basePath,
        path: np.join(basePath, path),
      };
    };
  }
}

export function navigateTo(path: string, type: FTYPES.FILE): (x: Base) => File;
export function navigateTo(
  path: string,
  type: FTYPES.DIRECTORY
): (x: Base) => Directory;
export function navigateTo(
  path: string,
  type: FTYPES.FILE | FTYPES.DIRECTORY
): (x: Base) => File | Directory {
  return g(({ path: currentPath, base: string }) => {
    return {
      $type: type,
      base,
      path: np.join(currentPath, path),
    };
  });
}

export const readFile = (encoding?: BufferEncoding) =>
  g((file: File) => {
    return {
      readAt: new Date(),
      content: fs.readFileSync(file.path, { encoding }),
    };
  });
export const writeTo = (dest: string | File, encoding: BufferEncoding) => {
  const destPath = getPath(dest);
  return g(({ content, base }: Required<File>) => {
    fs.writeFileSync(np.join(base, destPath), content, { encoding });
  });
};
export const write = (encoding: BufferEncoding) =>
  g(({ content, path }: Required<File>) => {
    fs.writeFileSync(path, content, { encoding });
  });

export const rm = () =>
  g(({ path }: Base) => {
    fs.rmSync(path);
  });

export const mkdir = (recursive: boolean = true) =>
  g(({ $type, path }: { $type: FTYPES; path: string }) => {
    fs.mkdirSync(path, { recursive });
    return {};
  });

export const getAllFiles = pipe(list(true), only(FTYPES.FILE));

export const copyDirContent = (dest: string | Directory) =>
  pipe(list(), map(convertListItem()), map(copyTo(getPath(dest))));

export const copyDir = (dest: string | Directory) => {
  const destPath = getPath(dest);
  return g((dir: Directory) => {
    const subPath = np.join(destPath, np.basename(dir.path));
    fs.mkdirSync(subPath);
    copyDirContent(subPath)(dir);
  });
};

export const copyTo = (dest: string | Directory) => {
  const destPath = getPath(dest);
  return g((base: Directory | File) => {
    if (isDirectory(base)) {
      copyDir(destPath)(base);
    } else {
      copyFile(destPath)(base);
    }
  });
};

export const copyFile = (dest: string | Directory) => {
  const destPath = getPath(dest);
  return g((file: File) => {
    if (IGNORE_FIlES.includes(np.basename(file.path))) {
      return;
    }
    fs.copyFileSync(file.path, destPath);
  });
};

export const exists =
  () =>
  ({ path, $type }: File | Directory): boolean => {
    try {
      const ok =
        $type === FTYPES.DIRECTORY ? fs.constants.R_OK : fs.constants.F_OK;
      fs.accessSync(path, ok);
      return true;
    } catch (err) {
      return false;
    }
  };
