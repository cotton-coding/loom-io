import { TestAdapter } from '@loom-io/interface-tests';
//import { TestAdapter } from './adapter.js';
import { Adapter } from '../src/core/adapter.js';

async function createAdapter(): Promise<Adapter> {
	return new Adapter();
}


TestAdapter(await createAdapter());
