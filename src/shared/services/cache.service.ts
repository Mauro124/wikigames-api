import NodeCache from 'node-cache';

// Default TTL: 24 hours (86400 seconds)
const cacheService = new NodeCache({ stdTTL: 86400, checkperiod: 600 });

export { cacheService };
