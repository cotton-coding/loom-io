import { source, type S3Options } from '../core/source';
import { type Directory, PLUGIN_TYPE, type LoomSourceAdapter } from '@loom-io/core';

export type S3MinioAdapterOptions = S3Options & {
	bucket: string;
};

export default (key: string = 's3:', options: S3MinioAdapterOptions): LoomSourceAdapter => ({
	$type: PLUGIN_TYPE.SOURCE_ADAPTER,
	source: (link: string): Directory | void => {
		if(link.startsWith(key)) {
			const { bucket, ...s3options } = options;
			return source(link, bucket, s3options);
		}
	}
});