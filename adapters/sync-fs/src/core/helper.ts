import { Base } from "./definitions.js";

export const getPath = (pathOrBase: string | Base) =>
  typeof pathOrBase === "string" ? pathOrBase : pathOrBase.path;
