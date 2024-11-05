import { TestAdapter } from '@loom-io/interface-tests';
//import { TestAdapter } from './adapter.js';
import { Adapter } from '../src/core/adapter.js';
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
  await createDir();
  return new Adapter(ROOT_DIR);
}


TestAdapter(await createAdapter(), {
  afterAll: cleanDir.bind(null),
  basePath: ROOT_DIR,
});
