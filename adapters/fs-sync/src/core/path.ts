import * as np from "path";
import { Directory } from "./definitions.js";

export const dirname = () => (dir: Directory) => {
  return np.dirname(dir.path);
};
