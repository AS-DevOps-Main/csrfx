// lib/generateToken.js

const store = require("./store");
const crypto = require("crypto");


async function generate(ip, length, ttl) {
    const token = crypto.randomBytes(length).toString('hex');
    store.__set(ip, token, ttl);
}