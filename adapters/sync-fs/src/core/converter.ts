import { FTYPES } from "./definitions.js";
import { g } from "pipe-and-combine";

export const updateJSON = (update: Record<string, unknown>) =>
  g(({ content }: { content: string; $type: FTYPES.FILE }) => {
    const json = JSON.parse(content);
    const updatedJson = Object.assign(json, update);
    return {
      $type: FTYPES.FILE,
      content: JSON.stringify(updatedJson),
    };
  });

export const getJSON =
  () =>
  ({ content }: { $type: FTYPES.FILE; content: string }) => {
    return JSON.parse(content);
  };
