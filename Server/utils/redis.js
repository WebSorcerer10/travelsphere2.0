const redis = require('redis');

const client = redis.createClient({
    password: 'xxA3E2iB28A0S49bPaclw6iQj8jYM2zm',
    socket: {
        host: 'redis-18626.c305.ap-south-1-1.ec2.redns.redis-cloud.com',
        port: 18626
    }
});

(async () => {
    await client.connect();
})();

client.on('connect', () => {
    console.log('Redis client connected');
});

client.on('error', (err) => {
    console.error('Redis connection error:', err);
});

module.exports = client;