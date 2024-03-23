import { TestAdapter } from '@loom-io/interface-tests';
//import { TestAdapter } from './adapter';
import { Adapter } from '../src/core/adapter';

async function createAdapter(): Promise<Adapter> {
	return new Adapter();
}


TestAdapter(await createAdapter());
