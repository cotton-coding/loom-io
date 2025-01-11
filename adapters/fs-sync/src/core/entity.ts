import * as fs from "fs";
import { pipe, g, map } from "pipe-and-combine";
import * as np from "path";
import type {
  File,
  Directory,
  Entity,
  ListItem,
  Content,
} from "./definitions.js";
import { FTYPES } from "./definitions.js";
import * as listFu from "./list.js";
import { getPath, isDirectory, isFile } from "./helper.js";
import { IGNORE_FIlES } from "./definitions.js";
import { dir } from "./base.js";
import { isFileSystemException } from "./exceptions.js";

/**
 * Resolves the path of an entity to the given base path
 *
 * @param basePath - path to resolve to. Default is current work directory
 * @returns
 */
export function resolveTo(basePath: string | Directory = ".") {
  const dirObj = dir(basePath);
  return (entity?: Entity) => {
    return {
      ...dirObj,
      path: np.resolve(dirObj.path, entity?.path ?? ""),
    };
  };
}

/**
 * Navigates to a file or directory. Use the dir or file function to create the entity
 * e.g. goto(dir("path/to/dir"))
 * e.g. goto(file("path/to/file"))
 *
 * @param file - File to navigate to. Could be absolute or relative path
 */
export function goto(entity: File): (x: Entity) => File;
export function goto(entity: Directory): (x: Entity) => Directory;
export function goto(
  entity: File | Directory
): (x: Entity) => File | Directory {
  const to = getPath(entity);
  return ({ path }: Entity) => {
    return {
      $type: entity.$type,
      path: np.resolve(path, to),
    };
  };
}

/**
 * Reads the content of a file and save it to a content property. To read or convert the content use some converter functions.
 * @param [encoding] - BufferEncoding value e.g. 'UTF-8'
 * @returns
 */
export const readFile = <T extends BufferEncoding | undefined>(encoding?: T) =>
  g((file: File): Content<T> => {
    return {
      ...file,
      readAt: new Date(),
      content: fs.readFileSync(file.path, { encoding }),
    } as Content<T>;
  });

export const listDir =
  (recursive: boolean = false) =>
  (dir: Directory): ListItem[] => {
    return fs
      .readdirSync(dir.path, { withFileTypes: true, recursive })
      .map((dirent) => ({
        $type: FTYPES.LISTITEM,
        path: dir.path,
        dirent,
      }));
  };

export const writeFile = (encoding: BufferEncoding) =>
  g(({ content, path }: Content) => {
    fs.writeFileSync(path, content, { encoding });
  });

export const remove = () =>
  g((entity: File | Directory) => {
    const { path } = entity;
    if (isDirectory(entity)) {
      fs.rmdirSync(path, { recursive: true });
    } else {
      fs.rmSync(path);
    }
  });

/**
 * Creates a file or directory
 * @param recursive - If false and the base directory does not exist, an error will be thrown
 */
export const create = (recursive: boolean = true) =>
  g((entity: File | Directory) => {
    if (isDirectory(entity)) {
      fs.mkdirSync(entity.path, { recursive });
    } else if (isFile(entity)) {
      if (recursive) {
        fs.mkdirSync(np.dirname(entity.path), { recursive });
      }
      fs.writeFileSync(entity.path, "");
    }
  });

export const listAllFiles = (recursive: boolean = false) =>
  pipe(listDir(recursive), listFu.only(FTYPES.FILE));

export const copyDirContent = (dest: string | Directory) => {
  return pipe(listDir(), map(listFu.convert()), map(copyTo(dir(dest))));
};

export const copyDir = (dest: string | Directory) => {
  const destPath = getPath(dest);
  return g((dir: Directory) => {
    const subPath = np.resolve(destPath, np.basename(dir.path));
    fs.mkdirSync(subPath);
    copyDirContent(subPath)(dir);
  });
};

export const copyTo = (dest: string | File | Directory) => {
  const destPath = dir(getPath(dest));
  return g((base: Directory | File) => {
    if (isDirectory(base)) {
      copyDir(destPath)(base);
    } else {
      copyFile(destPath)(base);
    }
  });
};

export const copyFile = (dest: string | Directory | File) => {
  const path = getPath(dest);
  const destPath = isDirectory(dest) ? np.join(path, np.basename(path)) : path;
  return g((file: File) => {
    if (IGNORE_FIlES.includes(np.basename(file.path))) {
      return;
    }
    fs.copyFileSync(
      file.path,
      isDirectory(dest) ? np.resolve(path, np.basename(file.path)) : path
    );
  });
};

export const moveTo = (dest: string | File | Directory) => {
  const destPath = getPath(dest);
  return g((base: Directory | File) => {
    if (isDirectory(base)) {
      fs.renameSync(base.path, destPath);
      return {
        path: destPath,
      };
    } else if (isDirectory(dest)) {
      const fullDestPath = np.resolve(destPath, np.basename(base.path));
      fs.renameSync(base.path, fullDestPath);
      return {
        path: fullDestPath,
      };
    } else {
      fs.renameSync(base.path, destPath);
      return {
        path: destPath,
      };
    }
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
