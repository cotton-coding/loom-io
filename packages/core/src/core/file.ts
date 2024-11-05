import { FILE_SIZE_UNIT, FileStat, SourceAdapter } from "../definitions.js";
import { Directory } from "./dir.js";
import { join as joinPath, extname, dirname, basename } from "node:path";
import { Editor } from "./editor.js";

export interface PrefixDefinition {
	dept: number;
	separator: string;
}

export class LoomFile<T extends SourceAdapter = SourceAdapter> {
  protected _extension: string | undefined;

  static from<T extends SourceAdapter>(adapter: T, dir: Directory, name: string): LoomFile<T>;
  static from<T extends SourceAdapter>(adapter: T, path: string): LoomFile<T>;
  static from<T extends SourceAdapter>(
    adapter: T,
    dirOrPath: Directory | string,
    name: string = ""
  ) {
    if (typeof dirOrPath === "string") {
      name = basename(dirOrPath);
      dirOrPath = new Directory(adapter, dirname(dirOrPath));
    }

    return new LoomFile(adapter, dirOrPath, name);
  }

  constructor(
		protected _adapter: T,
		protected _dir: Directory,
		protected _name: string
  ) {}

  get path(): string {
    return joinPath(this.dir.path, this.name);
  }

  get name(): string {
    return this._name;
  }

  getNameWithoutExtension() {
    const ext = this.extension;
    return ext ? this.name.slice(0, -ext.length - 1) : this.name;
  }

  get extension() {
    if (this._extension === undefined) {
      const ext = extname(this.name);
      this._extension = ext === "" ? undefined : ext.slice(1);
    }
    return this._extension;
  }

  get dir(): Directory {
    return this._dir;
  }

  get parent() {
    return this.dir;
  }

  get adapter() {
    return this._adapter;
  }

  async getSizeInBytes() {
    const stats = await this._adapter.stat(this.path);
    return stats.size;
  }

  async getSize(unit: FILE_SIZE_UNIT = FILE_SIZE_UNIT.BYTE) {
    const bytes = await this.getSizeInBytes();

    const index = Object.values(FILE_SIZE_UNIT).indexOf(unit);
    return bytes / Math.pow(1024, index);
  }

  protected getLastModificationTime(stats: FileStat) {
    if(stats.ctime === undefined) {
      return stats.mtime;
    }
    return stats.mtime.getTime() > (stats.ctime.getTime()) ? stats.mtime : stats.ctime;
  }

  async getMeta() {
    const meta = await this._adapter.stat(this.path);
    return {
      size: meta.size,
      createdAt: meta.birthtime,
      updatedAt: this.getLastModificationTime(meta),
    };
  }

  async getRawMeta() {
    return await this._adapter.stat(this.path);
  }

  async delete() {
    await this._adapter.deleteFile(this.path);
  }

  async copyTo(target: Directory | LoomFile) {
    if (this.adapter.isCopyable(target.adapter)) {
      if (target instanceof Directory) {
        const targetFile = target.file(this.name);
        await this._adapter.copyFile(this.path, targetFile.path);
        return targetFile;
      } else {
        await this._adapter.copyFile(this.path, target.path);
        return target;
      }
    } else {
      throw new Error(
        "Coping between different adapters is currently not supported"
      );
    }
  }

  async exists() {
    const fullPath = joinPath(this.dir.path, this.name);
    return this._adapter.fileExists(fullPath);
  }

  async reader() {
    return await Editor.from(this._adapter, this);
  }

  async plain() {
    return await this._adapter.readFile(this.path);
  }

  async text(encoding: BufferEncoding = "utf8") {
    return await this._adapter.readFile(this.path, encoding);
  }

  async write(data: string | Buffer) {
    await this._adapter.writeFile(this.path, data);
  }

  async create() {
    await this._dir.create();
    await this._adapter.writeFile(this.path, Buffer.alloc(0));
  }

  [Symbol.toPrimitive](): string {
    return this.path;
  }

  get [Symbol.toStringTag]() {
    return "LoomFile";
  }
}
