import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { extractUserIdFromToken } from '../../utils/extractUserIdFromToken';
import './Chat.css';

const Chat = ({ isOpen, onClose }) => {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [conversations, setConversations] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [socket, setSocket] = useState(null);
    const [connectionError, setConnectionError] = useState(false);
    const [onlineUsers, setOnlineUsers] = useState([]);
    const [isPublicChat, setIsPublicChat] = useState(true);
    const [currentUser, setCurrentUser] = useState(null);
    const messagesEndRef = useRef(null);
    const token = localStorage.getItem('token');
    const userId = extractUserIdFromToken(token);

    useEffect(() => {
        const fetchCurrentUser = async () => {
            try {
                const response = await fetch('http://localhost:5000/user', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                const data = await response.json();
                setCurrentUser(data);
            } catch (error) {
                console.error('Error fetching user:', error);
            }
        };

        if (token) {
            fetchCurrentUser();
        }
    }, [token]);

    useEffect(() => {
        let newSocket;
        try {
            newSocket = io('http://localhost:5000', {
                transports: ['websocket', 'polling'],
                reconnectionAttempts: 5,
                reconnectionDelay: 1000,
                timeout: 10000,
                auth: {
                    token: token
                }
            });

            newSocket.on('connect', () => {
                setConnectionError(false);
                fetchPublicMessages();
            });

            newSocket.on('connect_error', (error) => {
                setConnectionError(true);
            });

            newSocket.on('onlineUsers', (users) => {
                setOnlineUsers(users.filter(user => user.id !== userId));
            });

            newSocket.on('message', (message) => {
                if (isPublicChat) {
                    setMessages(prev => [...prev, {
                        ...message,
                        senderId: message.userId,
                        content: message.message,
                        timestamp: new Date(message.timestamp)
                    }]);
                }
            });

            newSocket.on('receive_message', (message) => {
                if (!isPublicChat && message.conversationId === selectedUser?._id) {
                    setMessages(prev => [...prev, message]);
                }
            });

            setSocket(newSocket);
            fetchConversations();

            return () => {
                if (newSocket) {
                    newSocket.disconnect();
                }
            };
        } catch (error) {
            setConnectionError(true);
        }
    }, [userId, token, isPublicChat, selectedUser]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const fetchPublicMessages = async () => {
        try {
            const response = await fetch('http://localhost:5000/chat/messages', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await response.json();
            setMessages(data);
        } catch (error) {
            setConnectionError(true);
        }
    };

    const fetchConversations = async () => {
        try {
            const response = await fetch(`http://localhost:5000/chat/conversations/${userId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await response.json();
            setConversations(data);
        } catch (error) {
            setConnectionError(true);
        }
    };

    const fetchMessages = async (conversationId) => {
        try {
            const response = await fetch(`http://localhost:5000/chat/messages/${conversationId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await response.json();
            setMessages(data);
        } catch (error) {
            setConnectionError(true);
        }
    };

    const handleUserSelect = (user) => {
        setSelectedUser(user);
        setIsPublicChat(false);
        fetchMessages(user._id);
    };

    const switchToPublicChat = () => {
        setSelectedUser(null);
        setIsPublicChat(true);
        fetchPublicMessages();
    };

    const sendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        if (isPublicChat) {
            socket.emit('chatMessage', newMessage);
            setMessages(prev => [...prev, {
                senderId: userId,
                username: currentUser?.username || 'Me',
                content: newMessage,
                message: newMessage,
                timestamp: new Date()
            }]);
            setNewMessage('');
            return;
        }

        if (!selectedUser) return;

        const messageData = {
            senderId: userId,
            receiverId: selectedUser._id,
            content: newMessage,
            conversationId: selectedUser._id,
        };

        try {
            const response = await fetch('http://localhost:5000/chat/messages', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(messageData)
            });

            if (response.ok) {
                socket.emit('send_message', messageData);
                setMessages(prev => [...prev, messageData]);
                setNewMessage('');
            }
        } catch (error) {
            setConnectionError(true);
        }
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    if (!isOpen) return null;

    return (
        <div className="chat-container">
            <div className="chat-header">
                <h2>{isPublicChat ? 'Public Chat' : 'Messages'}</h2>
                <button className="close-button" onClick={onClose}>&times;</button>
            </div>
            <div className="chat-content">
                <div className="sidebar">
                    <div className="chat-tabs">
                        <button 
                            className={`tab-button ${isPublicChat ? 'active' : ''}`}
                            onClick={switchToPublicChat}
                        >
                            Public Chat
                        </button>
                        <button 
                            className={`tab-button ${!isPublicChat ? 'active' : ''}`}
                            onClick={() => setIsPublicChat(false)}
                        >
                            Private Chats
                        </button>
                    </div>
                    
                    {isPublicChat ? (
                        <div className="online-users">
                            <h3>Online Users ({onlineUsers.length})</h3>
                            {onlineUsers.map(user => (
                                <div 
                                    key={user.id} 
                                    className="online-user"
                                    onClick={() => handleUserSelect({
                                        _id: user.id,
                                        name: user.username,
                                        profileImage: user.profileImage
                                    })}
                                >
                                    <div className="online-indicator"></div>
                                    <span>{user.username}</span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="conversations-list">
                            {conversations.map(conv => (
                                <div
                                    key={conv._id}
                                    className={`conversation-item ${selectedUser?._id === conv._id ? 'selected' : ''}`}
                                    onClick={() => handleUserSelect(conv)}
                                >
                                    <img 
                                        src={conv.profileImage 
                                            ? `http://localhost:5000/profileImages/${conv.profileImage}`
                                            : 'default-avatar.png'
                                        } 
                                        alt="Profile" 
                                        className="conversation-avatar"
                                    />
                                    <div className="conversation-info">
                                        <h4>{conv.name}</h4>
                                        <p>{conv.lastMessage}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
                
                <div className="messages-container">
                    <div className="messages-list">
                        {messages.map((message, index) => (
                            <div
                                key={index}
                                className={`message ${message.senderId === userId ? 'sent' : 'received'}`}
                            >
                                {isPublicChat && (
                                    <small className="message-username">
                                        {message.senderId === userId ? 'Me' : message.username}
                                    </small>
                                )}
                                <p>{message.content || message.message}</p>
                                <small>
                                    {new Date(message.timestamp || message.createdAt).toLocaleTimeString()}
                                </small>
                            </div>
                        ))}
                        <div ref={messagesEndRef} />
                    </div>
                    <form onSubmit={sendMessage} className="message-input-container">
                        <input
                            type="text"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder="Type a message..."
                        />
                        <button type="submit">Send</button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Chat; 