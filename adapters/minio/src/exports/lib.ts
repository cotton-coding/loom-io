import { source, type S3Options } from "../core/source";
import { Directory, PLUGIN_TYPE, LoomSourceAdapter } from '@loom-io/core'


export default (key: string = 's3', options: S3Options): LoomSourceAdapter => ({
	$type: PLUGIN_TYPE.SOURCE_ADAPTER,
	source: (link: string): Promise<Directory> | void => {
		if(link.startsWith(key)) {
			return source(link, options);
		}
	}
});