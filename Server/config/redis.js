const { createClient } = require('redis');

const redisClient = createClient({
    url: process.env.REDIS_URL, // Your Redis Cloud URL
    socket: {
        connectTimeout: 10000,
        keepAlive: 5000,
        reconnectStrategy: (retries) => Math.min(retries * 50, 1000)
    }
});

redisClient.on('error', (err) => console.log('Redis Client Error', err));
redisClient.on('connect', () => console.log('Connected to Redis Cloud'));

const connectRedis = async () => {
    try {
        await redisClient.connect();
    } catch (error) {
        console.error('Redis connection error:', error);
    }
};

// Helper functions for private chat messages
const savePrivateMessage = async (senderId, receiverId, message) => {
    try {
        const chatKey = `chat:${[senderId, receiverId].sort().join(':')}`;
        const messageData = JSON.stringify({
            senderId,
            content: message.content,
            timestamp: Date.now(),
            username: message.username,
            profileImage: message.profileImage
        });
        
        await redisClient.lPush(chatKey, messageData);
        // Set expiration for 24 hours
        await redisClient.expire(chatKey, 24 * 60 * 60);
        
        return true;
    } catch (error) {
        console.error('Error saving private message:', error);
        return false;
    }
};

const getPrivateMessages = async (senderId, receiverId) => {
    try {
        const chatKey = `chat:${[senderId, receiverId].sort().join(':')}`;
        const messages = await redisClient.lRange(chatKey, 0, -1);
        return messages.map(msg => JSON.parse(msg)).reverse();
    } catch (error) {
        console.error('Error getting private messages:', error);
        return [];
    }
};

module.exports = {
    redisClient,
    connectRedis,
    savePrivateMessage,
    getPrivateMessages
}; 