import { Dirent } from "node:fs";

export const IGNORE_FIlES = [".DS_Store"];
export enum FTYPES {
  FILE,
  DIRECTORY,
  LISTITEM,
}

export interface Base {
  $type: FTYPES;
  base: string;
  path: string;
}

export interface ListItem extends Base {
  $type: FTYPES.LISTITEM;
  base: string;
  path: string;
  dirent: Dirent;
}

export interface File extends Base {
  $type: FTYPES.FILE;
  base: string;
  readAt?: Date;
  content?: Buffer | string;
}

export interface Directory extends Base {
  $type: FTYPES.DIRECTORY;
  base: string;
}

export type Entity = File | Directory | ListItem;
