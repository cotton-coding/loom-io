import { Directory, LoomFile } from '@loom-io/core/internal';
import { Client as MinioClient, ClientOptions as S3Options} from 'minio';
import { Adapter } from '../core/adapter.js';
import { dirname, basename } from 'path';
import { LoomSourceAdapter } from '@loom-io/core';


export class MinioAdapter implements LoomSourceAdapter {

  protected adapter: Adapter;
  protected minioClient: MinioClient;

  constructor(bucket: string, s3config: S3Options) {
    this.minioClient = new MinioClient(s3config);
    this.adapter = new Adapter(this.minioClient, bucket);
  }

  async file(path: string): Promise<LoomFile> {
    const dir = new Directory(this.adapter, dirname(path));
    return new LoomFile(this.adapter, dir, basename(path));
  }

  async dir(path: string): Promise<Directory> {
    return new Directory(this.adapter, path);
  }
}

export default MinioAdapter;