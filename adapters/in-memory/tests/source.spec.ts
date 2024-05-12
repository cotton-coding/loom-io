import { testSource } from '@loom-io/interface-tests';
import {MemoryAdapter} from '../src/exports/lib.js';

testSource(new MemoryAdapter());