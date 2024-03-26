import { testSource } from '@loom-io/interface-tests';
import S3MinioSourceAdapter from '../src/exports/lib';

const s3config = {
	endPoint: 'play.min.io',
	port: 9000,
	useSSL: true,
	accessKey: 'Q3AM3UQ867SPQQA43P2F',
	secretKey: 'zuf+tfteSlswRu7BJ86wekitnifILbZam1KYY3TG',
};


testSource('s3://', S3MinioSourceAdapter(undefined, {
	bucket: 'test-bucket',
	...s3config
}));