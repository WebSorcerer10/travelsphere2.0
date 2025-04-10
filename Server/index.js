const express = require("express");
const app = express();
const cors = require("cors");
const mongoose = require("mongoose");
const { config } = require("dotenv");
const UserRoute = require("./routes/user");
const morgan = require("morgan");
const fs = require("fs");
const path = require("path");
const bodyParser = require("body-parser");
const AdminRoute = require("./routes/admin");
const AgencyRoute = require("./routes/agency");
const ChatRoute = require("./routes/chat");
const Message = require('./Models/Message');
const User = mongoose.models.User || require('./Models/User');
const swaggerUi = require('swagger-ui-express');
const specs = require('./swagger');
const http = require('http');
const socketIo = require('socket.io');
const jwt = require('jsonwebtoken');
const { savePrivateMessage } = require('./config/redis');

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

app.use("/images", express.static(path.join(__dirname, "images")));
app.use(
  "/profileImages",
  express.static(path.join(__dirname, "profileImages"))
);

config();
app.use(cors({
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true
}));
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ extended: true }));

const logsDir = path.join(__dirname, "logs");
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir);
}

const accessLogStream = fs.createWriteStream(
  path.join(__dirname, "logs", "access.log"),
  { flags: "a" }
);
app.use(
  morgan(":date[iso] :method :url :status :response-time ms", {
    stream: accessLogStream,
  })
);

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);

const io = socketIo(server, {
    cors: {
        origin: "http://localhost:5173",
        methods: ["GET", "POST"],
        credentials: true,
        allowedHeaders: ["Authorization"]
    },
    connectTimeout: 10000,
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
    pingTimeout: 60000,
    pingInterval: 25000
});

io.use(async (socket, next) => {
    try {
        const token = socket.handshake.auth.token;
        if (!token) {
            return next(new Error('Authentication token is required'));
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
        const user = await User.findById(decoded.userId).select('username profileImage');
        
        if (!user) {
            return next(new Error('User not found'));
        }

        socket.user = {
            id: user._id.toString(),
            username: user.username,
            profileImage: user.profileImage
        };
        next();
    } catch (error) {
        next(new Error('Authentication failed'));
    }
});

const onlineUsers = new Map();

io.on('connection', (socket) => {
    if (socket.user) {
        onlineUsers.set(socket.user.id, {
            id: socket.user.id,
            username: socket.user.username,
            socketId: socket.id
        });

        io.emit('onlineUsers', Array.from(onlineUsers.values()));
    }

    // Handle public messages
    socket.on('chatMessage', async (messageContent) => {
        if (!socket.user) {
            console.log('Unauthorized message attempt from socket:', socket.id);
            return;
        }

        try {
            const message = new Message({
                content: messageContent,
                sender: socket.user.id,
                conversationId: 'public',
                read: true
            });

            const savedMessage = await message.save();
            const populatedMessage = await Message.findById(savedMessage._id)
                .populate('sender', 'username profileImage')
                .lean();

            if (!populatedMessage) {
                throw new Error('Failed to save message');
            }

            io.emit('message', {
                messageId: populatedMessage._id,
                content: populatedMessage.content,
                senderId: populatedMessage.sender._id,
                username: populatedMessage.sender.username,
                timestamp: populatedMessage.createdAt,
                profileImage: populatedMessage.sender.profileImage || null
            });
        } catch (error) {
            console.error('Error saving public message:', error);
            socket.emit('error', { message: 'Error saving message' });
        }
    });

    // Handle private messages
    socket.on('privateMessage', async ({ receiverId, content }) => {
        if (!socket.user) {
            console.log('Unauthorized private message attempt from socket:', socket.id);
            return;
        }

        try {
            const messageData = {
                content,
                username: socket.user.username,
                profileImage: socket.user.profileImage,
                timestamp: Date.now()
            };

            await savePrivateMessage(socket.user.id, receiverId, messageData);

            // Send to receiver if online
            const receiverSocket = Array.from(onlineUsers.values())
                .find(user => user.id === receiverId)?.socketId;

            if (receiverSocket) {
                io.to(receiverSocket).emit('privateMessage', {
                    ...messageData,
                    senderId: socket.user.id
                });
            }

            // Send back to sender
            socket.emit('privateMessage', {
                ...messageData,
                senderId: socket.user.id
            });

        } catch (error) {
            console.error('Error sending private message:', error);
            socket.emit('error', { message: 'Error sending private message' });
        }
    });

    socket.on('disconnect', () => {
        if (socket.user) {
            onlineUsers.delete(socket.user.id);
            io.emit('onlineUsers', Array.from(onlineUsers.values()));
        }
    });

    socket.on('error', (error) => {
        console.error('Socket error:', {
            id: socket.id,
            user: socket.user?.username || 'unknown',
            error: error.message
        });
    });
});

app.use("/", UserRoute);
app.use("/admin", AdminRoute);
app.use("/agency", AgencyRoute);
app.use("/chat", ChatRoute);

app.use("/static/files", express.static("routes/uploads"));

const connect = () => {
  try {
    mongoose.connect(process.env.MONGODB_URL);
    console.log("Connected to MongoDB");
  } catch (err) {
    console.log(err);
  }
};

server.listen(PORT, () => {
  connect();
  console.log("Server is running on port:", PORT);
});

module.exports = app;