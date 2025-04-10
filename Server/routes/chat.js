const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Message = require('../Models/Message');
const User = mongoose.models.User || require('../Models/User');
const auth = require('../middleware/auth');
const { savePrivateMessage, getPrivateMessages } = require('../config/redis');

// Get all public messages
router.get('/messages', async (req, res) => {
    try {
        const messages = await Message.find({ conversationId: 'public' })
            .populate({
                path: 'sender',
                select: 'username profileImage'
            })
            .sort({ createdAt: 1 })
            .lean();

        const transformedMessages = messages
            .filter(msg => msg.sender) // Filter out messages with null senders
            .map(msg => ({
                messageId: msg._id,
                content: msg.content,
                senderId: msg.sender._id,
                username: msg.sender.username,
                timestamp: msg.createdAt,
                profileImage: msg.sender.profileImage || null,
                sender: msg.sender
            }));

        res.json(transformedMessages);
    } catch (error) {
        console.error('Error fetching public messages:', error);
        res.status(500).json({ message: 'Error fetching messages' });
    }
});

// Get messages for a specific conversation
router.get('/messages/:conversationId', async (req, res) => {
    try {
        const { conversationId } = req.params;
        const messages = await Message.find({ conversationId })
            .populate({
                path: 'sender',
                select: 'username profileImage',
                options: { lean: true }
            })
            .sort({ createdAt: 1 })
            .lean();

        const transformedMessages = messages
            .filter(msg => msg.sender) // Filter out messages with null senders
            .map(msg => ({
                messageId: msg._id,
                content: msg.content,
                senderId: msg.sender._id,
                username: msg.sender.username,
                timestamp: msg.createdAt,
                profileImage: msg.sender.profileImage || null
            }));

        res.json(transformedMessages);
    } catch (error) {
        console.error('Error fetching messages:', error);
        res.status(500).json({ message: 'Error fetching messages' });
    }
});

// Get conversations for a user
router.get('/conversations/:userId', auth, async (req, res) => {
    try {
        const { userId } = req.params;
        
        // Find all messages where the user is either sender or receiver
        const messages = await Message.find({
            $or: [
                { sender: userId },
                { receiver: userId }
            ],
            conversationId: { $ne: 'public' } // Exclude public messages
        }).populate('sender receiver', 'username profileImage');

        // Group messages by conversation
        const conversations = messages.reduce((acc, message) => {
            const conversationId = message.conversationId;
            if (!acc[conversationId]) {
                const otherUser = message.sender._id.toString() === userId 
                    ? message.receiver 
                    : message.sender;
                
                acc[conversationId] = {
                    _id: conversationId,
                    name: otherUser.username,
                    profileImage: otherUser.profileImage,
                    lastMessage: message.content,
                    timestamp: message.createdAt
                };
            }
            return acc;
        }, {});

        res.json(Object.values(conversations));
    } catch (error) {
        console.error('Error fetching conversations:', error);
        res.status(500).json({ message: 'Error fetching conversations' });
    }
});

// Send a message (handles both public and private messages)
router.post('/messages', auth, async (req, res) => {
    try {
        const { content, receiverId, conversationId, isPublic } = req.body;
        
        if (!content) {
            return res.status(400).json({ message: 'Message content is required' });
        }

        if (!isPublic && !receiverId) {
            return res.status(400).json({ message: 'Receiver is required for private messages' });
        }

        const message = new Message({
            sender: req.user._id,
            receiver: isPublic ? undefined : receiverId,
            content,
            conversationId: isPublic ? 'public' : (conversationId || receiverId),
            read: isPublic // Public messages are always read
        });

        const savedMessage = await message.save();
        
        // Populate sender details
        const populatedMessage = await Message.findById(savedMessage._id)
            .populate({
                path: 'sender',
                select: 'username profileImage'
            })
            .lean();

        if (!populatedMessage || !populatedMessage.sender) {
            throw new Error('Failed to populate sender details');
        }

        if (isPublic) {
            // Emit public message to all clients
            req.app.get('io').emit('message', {
                messageId: populatedMessage._id,
                content: populatedMessage.content,
                senderId: populatedMessage.sender._id,
                username: populatedMessage.sender.username,
                timestamp: populatedMessage.createdAt,
                profileImage: populatedMessage.sender.profileImage || null
            });
        } else {
            // Emit private message to receiver
            const io = req.app.get('io');
            io.to(receiverId).emit('receive_message', {
                messageId: populatedMessage._id,
                content: populatedMessage.content,
                senderId: populatedMessage.sender._id,
                username: populatedMessage.sender.username,
                timestamp: populatedMessage.createdAt,
                profileImage: populatedMessage.sender.profileImage || null
            });
        }
        
        res.status(201).json(populatedMessage);
    } catch (error) {
        console.error('Error sending message:', error);
        res.status(500).json({ message: 'Error sending message' });
    }
});

// Get online users
router.get('/online-users', auth, (req, res) => {
    const io = req.app.get('io');
    const onlineUsers = Array.from(io.sockets.sockets.values())
        .map(socket => ({
            id: socket.user.id,
            username: socket.user.username,
            socketId: socket.id
        }));
    
    res.json(onlineUsers);
});

// Get followed users for private chat
router.get('/followed-users', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user._id)
            .populate('following', 'username profileImage');

        const followedUsers = user.following.map(followedUser => ({
            id: followedUser._id,
            username: followedUser.username,
            profileImage: followedUser.profileImage
        }));

        res.json(followedUsers);
    } catch (error) {
        console.error('Error fetching followed users:', error);
        res.status(500).json({ message: 'Error fetching followed users' });
    }
});

// Get private messages between two users
router.get('/private-messages/:receiverId', auth, async (req, res) => {
    try {
        const messages = await getPrivateMessages(req.user._id, req.params.receiverId);
        res.json(messages);
    } catch (error) {
        console.error('Error fetching private messages:', error);
        res.status(500).json({ message: 'Error fetching private messages' });
    }
});

// Send private message
router.post('/private-message', auth, async (req, res) => {
    try {
        const { receiverId, content } = req.body;
        
        // Get sender details
        const sender = await User.findById(req.user._id).select('username profileImage');
        
        const messageData = {
            content,
            username: sender.username,
            profileImage: sender.profileImage
        };

        await savePrivateMessage(req.user._id, receiverId, messageData);
        
        res.status(201).json({ message: 'Message sent successfully' });
    } catch (error) {
        console.error('Error sending private message:', error);
        res.status(500).json({ message: 'Error sending private message' });
    }
});

module.exports = router; 