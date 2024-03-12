import { Directory } from '@loom-io/core';
import Minio, { ClientOptions as S3Options} from 'minio';
import { Adapter } from './adapter';

export { S3Options };

export function source (link: string, bucket: string, options: S3Options ): Promise<Directory> {
	const minio = new Minio.Client(options);
	const adapter = new Adapter(minio, bucket);
	return new Directory(adapter, link);

}

