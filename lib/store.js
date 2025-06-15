// lib/store.js

const Redis = require("ioredis");
const redis = new Redis();

async function __set(key, value, ttl) {
    await redis.set(key, JSON.stringify(value), 'PX', ttl)
}

async function __get(key) {
    const data = await redis.get(key);
    return data ? JSON.parse(data) : null;
}

async function __delete(key) {
    await redis.del(key);
}


module.exports = {
    __set,
    __get,
    __delete
}