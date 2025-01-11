import type { File, Directory } from "./definitions.js";
import { FTYPES } from "./definitions.js";
import { isDirectory, isFile } from "./helper.js";

export function file(path: string | File): File {
  if (isFile(path)) {
    return path;
  }
  return {
    $type: FTYPES.FILE,
    path,
  };
}

export function dir(path: string | Directory): Directory {
  if (isDirectory(path)) {
    return path;
  }
  return {
    $type: FTYPES.DIRECTORY,
    path,
  };
}
