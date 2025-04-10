import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import '../styles/ChatPage.css';

const ChatPage = () => {
    const navigate = useNavigate();
    const [socket, setSocket] = useState(null);
    const [messages, setMessages] = useState([]);
    const [onlineUsers, setOnlineUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [newMessage, setNewMessage] = useState('');
    const messagesEndRef = useRef(null);
    const [currentUser, setCurrentUser] = useState(null);

    useEffect(() => {
        const initializeChat = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    navigate('/signin');
                    return;
                }

                // Get user info from token
                const tokenData = JSON.parse(atob(token.split('.')[1]));
                setCurrentUser({
                    _id: tokenData.userId,
                    username: tokenData.username || tokenData.name || 'User'
                });

                // Initialize socket connection
                const newSocket = io('http://localhost:5000', {
                    auth: { token },
                    transports: ['websocket', 'polling']
                });

                newSocket.on('connect', () => {
                    console.log('Connected to chat server');
                    setError(null);
                });

                newSocket.on('connect_error', (error) => {
                    console.error('Socket connection error:', error);
                    setError('Failed to connect to chat server');
                });

                newSocket.on('message', (message) => {
                    console.log('Received message:', message);
                    setMessages(prev => [...prev, {
                        ...message,
                        timestamp: new Date(),
                        senderName: message.senderName || message.username || 'Unknown'
                    }]);
                    scrollToBottom();
                });

                newSocket.on('onlineUsers', (users) => {
                    console.log('Online users:', users);
                    setOnlineUsers(users);
                });

                setSocket(newSocket);
                fetchMessages();
                setLoading(false);

            } catch (err) {
                console.error('Chat initialization error:', err);
                setError('Failed to initialize chat');
                setLoading(false);
            }
        };

        initializeChat();

        return () => {
            if (socket) {
                socket.disconnect();
            }
        };
    }, [navigate]);

    const fetchMessages = async () => {
        try {
            const response = await fetch('http://localhost:5000/chat/messages', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            if (!response.ok) throw new Error('Failed to fetch messages');
            const data = await response.json();
            console.log('Fetched messages:', data);
            setMessages(data.map(msg => ({
                ...msg,
                senderName: msg.senderName || msg.username || 'Unknown'
            })));
            scrollToBottom();
        } catch (error) {
            console.error('Error fetching messages:', error);
            setError('Failed to load messages');
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (newMessage.trim() && socket && currentUser) {
            console.log('Sending message:', newMessage);
            const messageData = {
                content: newMessage,
                senderName: currentUser.username,
                senderId: currentUser._id,
                timestamp: new Date()
            };
            
            // Add message to local state immediately
            setMessages(prev => [...prev, messageData]);
            
            // Emit message to server
            socket.emit('chatMessage', messageData);
            setNewMessage('');
            scrollToBottom();
        }
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    if (loading) return <div className="loading">Loading chat...</div>;

    return (
        <div className="chat-page">
            <div className="chat-container">
                <div className="sidebar">
                    <div className="sidebar-header">
                        Online Users ({onlineUsers.length})
                    </div>
                    <div className="users-list">
                        {onlineUsers.map(user => (
                            <div key={user._id || user.id} className="user-item">
                                {user.profileImage && (
                                    <img 
                                        src={user.profileImage} 
                                        alt={user.username} 
                                        className="user-avatar"
                                    />
                                )}
                                <span className="username">{user.username}</span>
                                <span className="online-indicator" />
                            </div>
                        ))}
                    </div>
                </div>
                <div className="chat-main">
                    <div className="chat-header">
                        Public Chat Room
                    </div>
                    <div className="messages-container">
                        {messages.map((message, index) => (
                            <div 
                                key={message._id || index}
                                className={`message ${message.senderId === currentUser?._id ? 'sent' : 'received'}`}
                            >
                                <div className="message-content">
                                    <div className="message-sender">{message.senderName}</div>
                                    <div className="message-text">{message.content}</div>
                                    <div className="message-time">
                                        {new Date(message.timestamp).toLocaleTimeString()}
                                    </div>
                                </div>
                            </div>
                        ))}
                        <div ref={messagesEndRef} />
                    </div>
                    <form onSubmit={handleSubmit} className="message-input-container">
                        <input
                            type="text"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder="Type a message..."
                            className="message-input"
                        />
                        <button type="submit" className="send-button">Send</button>
                    </form>
                </div>
            </div>
            {error && <div className="error-message">{error}</div>}
        </div>
    );
};

export default ChatPage; 