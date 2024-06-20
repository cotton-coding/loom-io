import { LoomFile } from "@loom-io/core";

export interface FileConverter<T = unknown, U = T> {
	verify: (file: LoomFile) => boolean | Promise<boolean>;
	parse(file: LoomFile): Promise<T>;
	stringify(file: LoomFile, content: U): Promise<void>;
}
