export class FileConverterException extends Error {}

export class NoValidFileConverterException extends FileConverterException {
  constructor(filename: string) {
    super(`No converter found for file: ${filename}`);
  }
}
