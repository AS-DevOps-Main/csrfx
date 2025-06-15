// csrfx/index.js

const { generateToken, verifyToken } = require("./lib/tokenManager");
const { attachJWTT, verifyJWTT } = require("./lib/jwttHandler");

/**
 * Initializes the CSRFX middleware with optional configurations
 * @param {Object} config - Configuration options
 * @param {number} config.csrf_nav_ttl - csrf_nav token lifetime in ms (default: 900000)
 * @param {number} config.csrf_sess_ttl - csrf_sess token lifetime in ms (default: 1200000)
 * @param {string} config.authPath - The path for the protected routes
 * @param {boolean} config.attachTokens - Attaching tokens to responses via cookies (default: false)
 * @param {function} config.getUserSession - Callback to extract user session info (for CSRF_UR)
 * @returns {Function} Express middleware function
 */


function csrfx(config = {}) {
    const csrf_nav_ttl = config.csrf_nav_ttl || 15 * 60 * 1000;
    const csrf_sess_ttl = config.csrf_sess_ttl || 20 * 60 * 1000;
    const at = config.attachTokens || false;
    const authPath = config.authPath;

    if (!authPath) {
        throw new Error("authPath must be provided.")
    }

    const getUserSession = config.getUserSession || (() => null);


    return (req, res, next) => {
        const ip = req.ip;
        const session = getUserSession(req);

        try {
            generateToken(req, res, ip, 'RN', tokenTTL_RN);

            if (session) {
                generateToken(req, res, session.userId, 'UR', tokenTTL_UR);
            }

            // Validate both tokens for state-changing requests
            if (['POST', 'PUT', 'DELETE'].includes(req.method.toUppercase())) {
                verifyToken(req, 'RN');
                if (session) verifyToken(req, 'UR');
            }

            // Attach JWTT logic
            attachJWTT(req, res, session);
        } catch (err) {
            return res.status(403).json({ error: 'CSRF verification failed.', details: err.message });
        }

        next();
    };
}

module.exports = csrfx;