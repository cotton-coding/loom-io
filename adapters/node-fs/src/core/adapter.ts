import { FileHandler } from './file-handler.js';
import * as fs from 'node:fs/promises';
import type { SourceAdapter, rmdirOptions, ObjectDirentInterface } from '@loom-io/core';
import { DirectoryNotEmptyException, PathNotFoundException } from '@loom-io/core';
import { PathLike } from 'node:fs';
import { dirname, join, normalize, resolve, sep } from 'node:path';
import { isNodeErrnoExpression } from '../utils/error-handling.js';
import { ObjectDirent } from './object-dirent.js';
export class Adapter implements SourceAdapter {

  protected rootdir: string;

  constructor(
    rootdir: PathLike = process.cwd(),
  ) {
    const fullPath = resolve(rootdir.toString());
    this.rootdir = fullPath.endsWith(sep) ? fullPath : normalize(`${fullPath}/`);
  }

  get raw() {
    return fs;
  }

  protected getFullPath(path: string): string {
    console.log({path, rootdir: this.rootdir});
    if(path.match(/^[A-Za-z]{1}:/) && !['', '\\'].includes(this.rootdir)) {
      return join(this.rootdir, path.slice(2));
    }
    return join(this.rootdir || '', path);
  }

  protected getRelativePath(path: string): string {
    return path.replace(this.rootdir, sep);
  }

  protected async exists(path: string, ref: number): Promise<boolean> {
    const fullPath = this.getFullPath(path);
    try {
      await fs.access(fullPath, ref);
      return true;
    } catch {
      return false;
    }
  }

  async fileExists(path: string): Promise<boolean> {
    return this.exists(path, fs.constants.F_OK);
  }

  async dirExists(path: string): Promise<boolean> {
    return this.exists(path, fs.constants.R_OK);
  }


  async mkdir(path: string): Promise<void> {
    const fullPath = this.getFullPath(path);
    console.log({fullPath});
    await fs.mkdir(fullPath, { recursive: true });
  }

  async readdir(path: PathLike): Promise<ObjectDirentInterface[]> {
    const fullPath = this.getFullPath(path.toString());
    const paths =  await fs.readdir(fullPath, {withFileTypes: true});
    return paths.map((dirent) => new ObjectDirent(dirent, this.rootdir.toString()));
  }

  async rmdir(path: string, options: rmdirOptions= {}): Promise<void> {
    try {
      path = path.trim();
      const fullPath = this.getFullPath(path);
      if(options.recursive || options.force) {
        await fs.rm(fullPath, options);
        if(path === sep || path === '') {
          await fs.mkdir(this.rootdir);
        }
      } else {
        if(path !== sep && path !== '') {
          await fs.rmdir(fullPath);
        }
      }
    } catch (err) {
      if(isNodeErrnoExpression(err)) {
        switch(err.code) {
        case 'ENOTEMPTY':
          throw new DirectoryNotEmptyException(path);
        case 'ENOENT':
          throw new PathNotFoundException(path);
        }
      }
      throw err;
    }
  }

  async stat (path: string) {
    const fullPath = this.getFullPath(path);
    const {size, mtime, birthtime, ctime, atime} = await fs.stat(fullPath);
    return {
      size,
      atime,
      mtime,
      ctime,
      birthtime,
    };
  }

  async readFile(path: string): Promise<Buffer>
  async readFile(path: string, encoding: BufferEncoding): Promise<string>
  async readFile(path: string, encoding?: BufferEncoding): Promise<Buffer | string> {
    const fullPath = this.getFullPath(path);
    return await fs.readFile(fullPath, encoding);
  }

  async writeFile(path: string, data: Buffer | string): Promise<void> {
    const fullPath = this.getFullPath(path);
    try {
      await fs.writeFile(fullPath, data);
    } catch (err) {
      if(isNodeErrnoExpression(err)) {
        switch(err.code) {
        case 'ENOENT':
          throw new PathNotFoundException(fullPath);
        }
      }
      throw err;
    }
  }

  async deleteFile(path: PathLike): Promise<void> {
    const fullPath = this.getFullPath(path.toString());
    await fs.rm(fullPath);
  }

  async openFile(path: string, mode: 'r' | 'w' = 'r'): Promise<FileHandler> {
    const fullPath = this.getFullPath(path);
    const fileHandle = await fs.open(fullPath, mode);
    return new FileHandler(fileHandle);
  }

  async isCopyable(adapter: SourceAdapter): Promise<boolean> {
    return adapter instanceof Adapter;
  }

  async copyFile(from: string, to: string): Promise<void> {
    try {
      const fromPath = this.getFullPath(from);
      const toPath = this.getFullPath(to);
      await fs.copyFile(fromPath, toPath);
    } catch (err) {
      if(isNodeErrnoExpression(err)) {
        if(err.code === 'ENOENT') {
          const srcExists = await this.fileExists(from);
          throw new PathNotFoundException(srcExists ? dirname(to) : from);
        }
      }
      throw err;
    }
  }


}