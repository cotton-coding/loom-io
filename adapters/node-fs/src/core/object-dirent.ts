import { ObjectDirentInterface } from '@loom-io/core';
import { Dirent } from 'node:fs';
import { addPrecedingAndTailingSlash } from '@loom-io/common';

export class ObjectDirent implements ObjectDirentInterface{

  constructor(
		protected _dirent: Dirent,
		protected _rootPath: string,
  ) {}

  isDirectory() {
    return this._dirent.isDirectory();
  }

  isFile() {
    return this._dirent.isFile();
  }

  get name() {
    return this._dirent.name;
  }

  get path() {
    const pathFromRelativeRoot = this._dirent.path.slice(this._rootPath.length);
    if(process.version.startsWith('v18') && pathFromRelativeRoot.endsWith(this.name)) {
      return addPrecedingAndTailingSlash(pathFromRelativeRoot.slice(0, -this.name.length));
    }
    return addPrecedingAndTailingSlash(pathFromRelativeRoot);
  }

}