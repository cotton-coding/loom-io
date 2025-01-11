import { Content } from "./definitions.js";

export const returnContent =
  (encoding?: BufferEncoding) =>
  ({ content }: Content): string =>
    content.toString(encoding).trim();
