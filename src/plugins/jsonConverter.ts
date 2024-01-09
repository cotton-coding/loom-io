import type { LoomFSPlugin } from "../../types";

export default {
    type: 'jsonConverter',
    extentions: ['json'],
    parse: JSON.parse,
    stringify: JSON.stringify
} satisfies LoomFSPlugin;