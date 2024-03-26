import { testSource } from '@loom-io/interface-tests';
import InMemorySourceAdapter from '../src/exports/lib';

testSource('memory://', InMemorySourceAdapter());