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
    console.log({rootPath: this._rootPath, dirent: this._dirent});
    const pathFromRelativeRoot = this._dirent.parentPath.slice(this._rootPath.length);
    if(process.version.startsWith('v18') && pathFromRelativeRoot.endsWith(this.name)) {
      return addPrecedingAndTailingSlash(pathFromRelativeRoot.slice(0, -this.name.length));
    }
    return addPrecedingAndTailingSlash(pathFromRelativeRoot);
  }

}