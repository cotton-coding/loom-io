import { Dirent } from "node:fs";

export const IGNORE_FIlES = [".DS_Store"];
export enum FTYPES {
  FILE,
  DIRECTORY,
  LISTITEM,
}

export interface EntityBase {
  $type: FTYPES;
  path: string;
}

export interface ListItem extends EntityBase {
  $type: FTYPES.LISTITEM;
  path: string;
  dirent: Dirent;
}

export interface File extends EntityBase {
  $type: FTYPES.FILE;
}

export interface Content<T = undefined | BufferEncoding> extends File {
  readAt: Date;
  content: T extends BufferEncoding ? string : Buffer;
}

export interface Directory extends EntityBase {
  $type: FTYPES.DIRECTORY;
}

export type Entity = File | Directory | ListItem;
