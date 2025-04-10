const jwt = require('jsonwebtoken');

const socketAuth = (socket, next) => {
    try {
        // console.log('Socket connection attempt:', {
        //     id: socket.id,
        //     auth: socket.handshake.auth,
        //     headers: socket.handshake.headers
        // });

        // Try to get token from auth first, then from headers
        const token = socket.handshake.auth?.token || 
                     socket.handshake.headers?.authorization?.split(' ')[1];

        if (!token) {
            console.log('No token provided in socket connection');
            return next(new Error('Authentication error: No token provided'));
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
        
        if (!decoded) {
            console.log('Invalid token in socket connection');
            return next(new Error('Authentication error: Invalid token'));
        }

        // Attach the decoded user data to the socket
        socket.user = {
            id: decoded.id,
            username: decoded.username
        };

        console.log('Socket authenticated successfully for user:', socket.user.username);
        next();
    } catch (error) {
        console.error('Socket auth error:', error.message);
        if (error.name === 'JsonWebTokenError') {
            next(new Error('Authentication error: Invalid token'));
        } else if (error.name === 'TokenExpiredError') {
            next(new Error('Authentication error: Token expired'));
        } else {
            next(new Error('Authentication error: ' + error.message));
        }
    }
};

module.exports = socketAuth; 