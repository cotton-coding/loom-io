import { FTYPES } from "./definitions.js";
import { AnyObject, g } from "pipe-and-combine";

/**
 * Update the content of a file by a function
 *
 * @param update - a function that takes the current json object and returns the updated json object
 * @returns a new file object with the updated content
 */
export const update = (update: (json: AnyObject) => AnyObject) =>
  g(({ content }: { content: string; $type: FTYPES.FILE }) => {
    const json = JSON.parse(content);
    const updatedJson = update(json);
    return {
      $type: FTYPES.FILE,
      content: JSON.stringify(updatedJson),
    };
  });

/**
 * Get the content of a file as json
 * @returns a json object
 */
export const getContent =
  () =>
  ({ content }: { $type: FTYPES.FILE; content: string }) => {
    return JSON.parse(content);
  };
