export const isFileSystemException = (
  error: unknown
): error is FileSystemException => {
  return (
    error != null &&
    typeof error === "object" &&
    !Array.isArray(error) &&
    "code" in error
  );
};

export class FileSystemException extends Error {
  constructor(public code: string, message: string) {
    super(message);
  }
}
