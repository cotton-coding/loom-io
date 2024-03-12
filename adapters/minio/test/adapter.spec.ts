import { TestAdapter } from '@loom-io/interface-tests';
import { Adapter } from '../src/core/adapter';
import { Client } from 'minio';

const DEFAULT_BUCKET: string = `cotton-coding-${Math.random().toString(36).substring(7)}`;

const s3Client = new Client({
	endPoint: 'play.min.io',
	port: 9000,
	useSSL: true,
	accessKey: 'Q3AM3UQ867SPQQA43P2F',
	secretKey: 'zuf+tfteSlswRu7BJ86wekitnifILbZam1KYY3TG',
});

async function createBucketIfNotExists(client: Client, bucket: string) {
	const doesBucketExist = await client.bucketExists(bucket);
	if (!doesBucketExist) {
		await client.makeBucket(bucket);
	}
}

async function cleanAndRemoveBucket(client: Client, bucket: string) {
	const bucketStream = await client.listObjects(bucket);
	return new Promise((resolve, reject) => {
		bucketStream.on('data', (data) => {
			client.removeObject(bucket, data.name || data.prefix || '', { forceDelete: true });
		});
		bucketStream.on('end', () => {
			resolve(false);
		});
		bucketStream.on('error', (err) => {
			reject(err);
		});
	});
}


async function createAdapter(client, bucket): Promise<Adapter> {
	await createBucketIfNotExists(client, bucket);
	return new Adapter(
		client,
		bucket
	);
}


TestAdapter(await createAdapter(s3Client, DEFAULT_BUCKET), {
	beforeEach: createBucketIfNotExists.bind(null, s3Client, DEFAULT_BUCKET),
	afterEach: cleanAndRemoveBucket.bind(null, s3Client, DEFAULT_BUCKET)
});
