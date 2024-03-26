import { testSource } from '@loom-io/interface-tests';
import FilesystemSourceAdapter from '../src/exports/lib';

testSource('file://', FilesystemSourceAdapter());