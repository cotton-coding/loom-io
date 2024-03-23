import { Directory, LoomFile } from '@loom-io/core/internal';
import Minio, { ClientOptions as S3Options} from 'minio';
import { Adapter } from './adapter';
import { dirname } from 'path';

export { S3Options };

export async function source (link: string, bucket: string, options: S3Options, Type?: typeof Directory | typeof LoomFile ): Promise<Directory | LoomFile>{
	const minio = new Minio.Client(options);
	const adapter = new Adapter(minio, bucket);
	if(Type === Directory) {
		return new Directory(adapter, link);
	} else if (Type === LoomFile) {
		const dir = new Directory(adapter, dirname(link));
		return new LoomFile(adapter, dir, link);
	} else {
		return new Directory(adapter, link);
	}
}

