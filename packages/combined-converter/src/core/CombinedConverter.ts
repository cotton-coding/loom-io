import { LoomFile } from "@loom-io/core";
import { FileConverter } from "./definitions.js";
import { NoValidFileConverterException } from "./exceptions.js";

export interface CombinedConverterOptions {
	failOnNoConverter?: boolean;
}

const defaultOptions: CombinedConverterOptions = {
	failOnNoConverter: true,
};

export class CombinedConverter<T> implements FileConverter {
	protected converters: Array<FileConverter<T>>;
	protected config: CombinedConverterOptions;

	constructor(
		converters: Array<FileConverter<T>> | FileConverter<T>,
		options: CombinedConverterOptions = {}
	) {
		this.config = {
			...defaultOptions,
			...options,
		};
		this.converters = Array.from(
			new Set(Array.isArray(converters) ? converters : [converters])
		);
	}

	protected converterSetAction(
		action: "add" | "delete",
		...converters: Array<FileConverter<T>>
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

	addConverter(converter: FileConverter<T>, ...converters: Array<FileConverter<T>>) {
		this.converterSetAction("add", converter, ...converters);
	}

	removeConverter(
		converter: FileConverter<T>,
		...converters: Array<FileConverter<T>>
	) {
		this.converterSetAction("delete", converter, ...converters);
	}

	protected async getConverter(
		file: LoomFile
	): Promise<FileConverter<T> | undefined> {
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
			if (this.config.failOnNoConverter) {
				throw new NoValidFileConverterException(file.name);
			}
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

	async unify(file: LoomFile, content: T): Promise<void> {
		const converter = await this.getConverter(file);
		if (!converter) return;
		await converter.unify(file, content);
	}

	async parse(file: LoomFile): Promise<T | void> {
		const converter = await this.getConverter(file);
		if (!converter) return;
		return converter.parse(file);
	}
}
