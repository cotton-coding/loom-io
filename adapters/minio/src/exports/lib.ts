import { source, type S3Options } from '../core/source';
import { type Directory, PLUGIN_TYPE, type LoomSourceAdapter, LoomFile, MaybePromise } from '@loom-io/core';

export default (key: string = 's3://', bucket: string, s3config: S3Options): LoomSourceAdapter => ({
	$type: PLUGIN_TYPE.SOURCE_ADAPTER,
	source: (link: string, Type?: typeof Directory | typeof LoomFile): MaybePromise<Directory | LoomFile> | void => {
		if(link.startsWith(key)) {
			const path = link.slice(key.length);
			return source(path, bucket, s3config, Type);
		}
	},
	nonce: Symbol('minio-source-adapter')
});