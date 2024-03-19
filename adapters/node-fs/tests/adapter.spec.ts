import { TestAdapter } from '@loom-io/interface-tests';
//import { TestAdapter } from './adapter';
import { Adapter } from '../src/core/adapter';
import * as fs from 'fs/promises';
import { resolve } from 'node:path';

const ROOT_DIR: string = resolve(`test-tmp-${Math.random().toString(36).substring(7)}`);

async function createDir() {
	await fs.mkdir(ROOT_DIR, { recursive: true });
}

async function cleanDir() {
	await fs.rmdir(ROOT_DIR, { recursive: true });
}


async function createAdapter(): Promise<Adapter> {
	return new Adapter(ROOT_DIR);
}


TestAdapter(await createAdapter(), {
	beforeEach: createDir.bind(null),
	afterEach: cleanDir.bind(null),
	basePath: ROOT_DIR,
});
