import LoomIO from '@loom-io/core';
import jsonConverter from '@loom-io/jsonConverter';
import yamlConverter from '@loom-io/yamlConverter';

LoomIO.register(jsonConverter);
LoomIO.register(yamlConverter);

export default LoomIO;