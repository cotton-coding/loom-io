import { FileHandler as FileHandlerInterface, ReadBuffer, FileHandlerReadOptions } from '@loom-io/core';
import { MemoryFile } from '../definitions.js';


export class FileHandler implements FileHandlerInterface{

  constructor(
		protected file: MemoryFile,
		protected mode: 'r' | 'w' = 'r'
  ) {}

  read(options: FileHandlerReadOptions): Promise<ReadBuffer>
  read(buffer: Buffer): Promise<ReadBuffer>
  read(buffer: Buffer, options: FileHandlerReadOptions): Promise<ReadBuffer>
  async read(bufferOrOptions: Buffer | FileHandlerReadOptions, _options: FileHandlerReadOptions = {} ): Promise<ReadBuffer> {
    const [buffer, options] = bufferOrOptions instanceof Buffer ? [bufferOrOptions, _options] : [Buffer.alloc(16384), bufferOrOptions];
    const {offset = 0, length = buffer.length - offset, position = 0} = options;
    const {content} = this.file;
    const slice = content.subarray(position, position + length);
    slice.copy(buffer, offset);
    return {buffer, bytesRead: slice.length};
  }

  close(): void {
  }
}