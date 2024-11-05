import { join as joinPath, relative as relativePath} from 'node:path';
import { LoomFile } from './file.js';
import { List } from './list.js';
import { SourceAdapter } from '../definitions.js';
import { DirectoryNotEmptyException, EXCEPTION_REF, isInstanceOfLoomException } from '../exceptions.js';
import { removeTailingSlash } from '@loom-io/common';

export class Directory {

  protected readonly _path: string;
  protected readonly _adapter: SourceAdapter;
  protected _strict: boolean = false;
  protected isRoot: boolean;

  constructor(
    adapter: SourceAdapter,
    path: string,
    ...paths: string[]
  ) {
    this._path = joinPath(path, ...(paths || []));
    this._adapter = adapter;
    this.isRoot = this._path === '' || this._path === '/';
  }

  strict(strictMode: boolean = true) {
    this._strict = strictMode;
    return this;
  }

  get path() {
    return this._path;
  }

  get name() {
    if(this.isRoot) {
      return '';
    }

    const split = removeTailingSlash(this.path).split('/');
    return split.pop()!;
  }

  get parent(): Directory | undefined {
    if(this.isRoot) return undefined;
    const split = this.path.split('/');
    split.pop();
    return new Directory(this._adapter, `/${split.join('/')}`);
  }

  get adapter() {
    return this._adapter;
  }

  async exists(): Promise<boolean> {
    return await this._adapter.dirExists(this.path);
  }

  async create(): Promise<void> {
    await this._adapter.mkdir(this.path);
  }

  async copyTo(target: Directory): Promise<void> {
    if(target.adapter.isCopyable(this.adapter)) {
      const targetSub = await target.subDir(this.name);
      await targetSub.create();
      const list = await this.list();
      for(const element of list) {
        if(target instanceof Directory) {
          await element.copyTo(targetSub);
        } else {
          await element.copyTo(targetSub);
        }
      }
    } else {
      throw new Error('Coping between different adapters is currently not supported');
    }
  }

  async delete(recursive: boolean = false): Promise<void> {
    try {
      await this._adapter.rmdir(this.path, {recursive});
    } catch (err) {
      if(isInstanceOfLoomException(err, EXCEPTION_REF.DIRECTORY_NOT_EMPTY)) {
        throw new DirectoryNotEmptyException(this.path);
      } else if(this._strict) {
        throw err;
      }
    }
  }

  subDir(name: string) {
    return new Directory(this._adapter, this.path, name);
  }

  async list(): Promise<List> {

    const paths =  await this._adapter.readdir(this.path);

    return new List(this, paths);
  }

  /**
	 * Returns the relative path to the given path or undefined if the given dir or file is parent or not related
	 */
  relativePath(dir: Directory | LoomFile): string | undefined {
    const p = relativePath(this.path, dir.path);
    return p === '' ? undefined : p;
  }


  file(name: string): LoomFile {
    return new LoomFile(this._adapter, this, name);
  }

  protected async filesRecursion(list: List): Promise<List<LoomFile>>{

    const dirList = list.only('dirs');
    let fileList = list.only('files');

    for(const el of dirList) {
      const subList = await el.list();
      fileList = fileList.concat(await this.filesRecursion(subList));
    }

    return fileList;
  }

  async files(recursive: boolean = false): Promise<List<LoomFile>> {
    const list = await this.list();

    if(recursive) {
      return this.filesRecursion(list);
    } else {
      const fileList = list.only('files');
      return fileList;
    }
  }

  [Symbol.toPrimitive](): string {
    return this.path;
  }

  get [Symbol.toStringTag]() {
    return 'LoomDirectory';
  }
}