import { FileHandler as FileHandlerInterface, ReadBuffer, FileHandlerReadOptions } from '@loom-io/core';
import type { FileHandle } from 'node:fs/promises';


export class FileHandler implements FileHandlerInterface{

  constructor(
		protected openedFile: FileHandle,
  ) {}

  read(options: FileHandlerReadOptions): Promise<ReadBuffer>
  read(buffer: Buffer): Promise<ReadBuffer>
  read(buffer: Buffer, options: FileHandlerReadOptions): Promise<ReadBuffer>
  async read(bufferOrOptions: Buffer | FileHandlerReadOptions, _options: FileHandlerReadOptions = {} ): Promise<ReadBuffer> {
    const [buffer, options] = bufferOrOptions instanceof Buffer ? [bufferOrOptions, _options] : [Buffer.alloc(16384), bufferOrOptions];
    const {offset = 0, length = buffer.length - offset, position = 0} = options;
    return this.openedFile.read(buffer, offset, length, position);
  }

  close(): void {
    this.openedFile.close();
  }
}