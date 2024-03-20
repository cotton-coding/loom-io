import { TestAdapter } from '@loom-io/interface-tests';
import { Adapter } from '../src/core/adapter';
import { Client } from 'minio';

const DEFAULT_BUCKET: string = 'cotton-coding';


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


async function cleanBucketForce(client: Client, bucket: string) {
	const objects = await client.listObjectsV2(bucket, '', true);
	for await (const obj of objects) {
		await client.removeObject(bucket, obj.name);
	}
}



async function createAdapter(client, bucket): Promise<Adapter> {
	await createBucketIfNotExists(client, bucket);
	await cleanBucketForce(client, bucket);
	return new Adapter(
		client,
		bucket
	);
}


TestAdapter(await createAdapter(s3Client, DEFAULT_BUCKET));
