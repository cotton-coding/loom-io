import LoomIO from '@loom-io/core';
import jsonConverter from '@loom-io/json-converter';
import yamlConverter from '@loom-io/yaml-converter';
import fileSystemAdapter from '@loom-io/node-filesystem-adapter';

LoomIO.register(fileSystemAdapter('file://'));
LoomIO.register(jsonConverter);
LoomIO.register(yamlConverter);

export * from '@loom-io/core';

export default LoomIO;