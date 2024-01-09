import { parse, stringify } from 'yaml';
import type { LoomFSPlugin } from '../../types';

export default {
    type: 'jsonConverter',
    extentions: ['yml', 'yaml'],
    parse,
    stringify
} satisfies LoomFSPlugin;