import { testSource } from '@loom-io/interface-tests';
import { MinioAdapter } from '../src/exports/lib.js';

const s3config = {
	endPoint: 'play.min.io',
	port: 9000,
	useSSL: true,
	accessKey: 'Q3AM3UQ867SPQQA43P2F',
	secretKey: 'zuf+tfteSlswRu7BJ86wekitnifILbZam1KYY3TG',
};


testSource(new MinioAdapter('test-bucket', s3config));
