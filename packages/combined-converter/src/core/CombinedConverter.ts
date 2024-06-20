import { LoomFile } from "@loom-io/core";
import { FileConverter } from "./definitions.js";

export interface CombinedConverterOptions {
	failOnNoConverter?: boolean;
}

export class CombinedConverter implements FileConverter {
	protected converters: Array<FileConverter>;
	protected config: CombinedConverterOptions;

	constructor(
		converters: Array<FileConverter> | FileConverter,
		options: CombinedConverterOptions = {}
	) {
		this.config = options;
		this.converters = Array.from(
			new Set(Array.isArray(converters) ? converters : [converters])
		);
	}

	protected converterSetAction(
		action: "add" | "delete",
		...converters: Array<FileConverter>
	) {
		const convertersSet = new Set(this.converters);
		converters.forEach((converter) => {
			convertersSet[action](converter);
		});
		this.converters = Array.from(convertersSet);
	}

	set options(options: CombinedConverterOptions) {
		this.config = options;
	}

	get options(): CombinedConverterOptions {
		return this.config;
	}

	addConverter(converter: FileConverter, ...converters: Array<FileConverter>) {
		this.converterSetAction("add", converter, ...converters);
	}

	removeConverter(
		converter: FileConverter,
		...converters: Array<FileConverter>
	) {
		this.converterSetAction("delete", converter, ...converters);
	}

	protected async getConverter(file: LoomFile): Promise<FileConverter> {
		try {
			return await Promise.any(
				this.converters.map(async (converter) => {
					if (await converter.verify(file)) {
						return Promise.resolve(converter);
					}
					return Promise.reject();
				})
			);
		} catch (error) {
			throw new Error("No converter found for file");
		}
	}

	async verify(file: LoomFile): Promise<boolean> {
		try {
			await this.getConverter(file);
			return true;
		} catch (error) {
			return false;
		}
	}

	async stringify(file: LoomFile, content: unknown): Promise<void> {
		const converter = await this.getConverter(file);
		await converter.stringify(file, content);
	}

	async parse(file: LoomFile): Promise<unknown> {
		const converter = await this.getConverter(file);
		return converter.parse(file);
	}
}