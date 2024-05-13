import { testSource } from '@loom-io/interface-tests';
import { FilesystemAdapter } from '../src/exports/lib.js';


testSource(new FilesystemAdapter());
