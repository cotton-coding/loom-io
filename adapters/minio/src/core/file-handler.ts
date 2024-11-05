import { Adapter } from './adapter.js';
import { FileHandler as FileHandlerInterface, ReadBuffer, FileHandlerReadOptions } from '@loom-io/core';

export class FileHandler implements FileHandlerInterface{

  constructor(
		protected adapter: Adapter,
		protected bucket: string,
		protected filePath: string
  ) {}

  read(options: FileHandlerReadOptions): Promise<ReadBuffer>
  read(buffer: Buffer): Promise<ReadBuffer>
  read(buffer: Buffer, options: FileHandlerReadOptions): Promise<ReadBuffer>
  async read(bufferOrOptions: Buffer | FileHandlerReadOptions, _options: FileHandlerReadOptions = {} ): Promise<ReadBuffer> {
    const [buffer, options] = bufferOrOptions instanceof Buffer ? [bufferOrOptions, _options] : [Buffer.alloc(16384), bufferOrOptions];
    const {offset = 0, length = buffer.length - offset, position = 0} = options;

    const stream = await this.adapter.raw.getPartialObject(this.bucket, this.filePath, position, length);
    return new Promise((resolve, reject) => {
      let bytesRead = 0;
      stream.on('data', (chunk) => {
        chunk.copy(buffer, offset + bytesRead);
        bytesRead += chunk.length;
      });
      stream.on('end', () => {
        resolve({bytesRead, buffer});
      });
      stream.on('error', reject);
    });
  }

  close(): void {
    // nothing to do
  }
}