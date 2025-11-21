import React, { useState, useEffect } from 'react';
import { authAxios, getCurrentUser } from '../services/authService';
import { FaPaperPlane } from 'react-icons/fa';
import '../assets/css/chatbot.css';

const Chatbot = () => {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false)
    const [authUser, setAuthUser] = useState(null);

    // Load logged-in user on component mount
    useEffect(() => {
        const user = getCurrentUser();
        if (user) {
        setAuthUser(user);
        }
    }, []);

    const handleSend = async () => {
        // empty input => send nothing
        if (input.trim() === "") return;

        const newMessage = { id: Date.now(), text: input, sender: 'user' };
        setMessages([...messages, newMessage]);
        setInput(''); // clear input field
        setLoading(true);

        try {
            const response = await authAxios.post(
                "http://localhost:8080/api/chat/response",
                {
                    userId: authUser.userId,   
                    message: input
                }
            );

            const aiMessage = { id: Date.now() + 1, text: response.data, sender: 'ai' };
            setMessages(prev => [...prev, aiMessage]);
        } catch (error) {
            console.error('Error fetching AI response:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        setInput(e.target.value);
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleSend();
        }
    };
    
    return (
        <div className="chatbot-container">
            <div className="chat-header">
                <img src="/images/logo.png" alt="Chatbot Logo" className="chat-logo" />
                <div className="breadcrumb">CHATBOT</div>
            </div>

            <div className="chatbox">
                    {messages.map((message) => (
                        <div key={message.id} className={`message-container ${message.sender}`}>
                            <img
                                src={message.sender === 'user' ? '/images/user.jpg' : '/images/chatbot.jpg'}
                                alt={`${message.sender} avatar`}
                                className="avatar"
                            />
                            <div className={`message ${message.sender}`}>
                                {message.text}
                            </div>
                        </div>
                    ))}
                    {loading && (
                        <div className="message-container ai">
                            <img src="/images/chatbot.jpg" alt="AI avatar" className="avatar" />
                            <div className="message ai">...</div>
                        </div>
                    )}
                </div>
                <div className="input-container">
                    <input
                        type="text"
                        value={input}
                        onChange={handleInputChange}
                        onKeyDown={handleKeyPress}
                        placeholder="Type your message..."
                    />
                    <button onClick={handleSend}>
                        <FaPaperPlane />
                    </button>
                </div>
            </div>
    );
};

export default Chatbot;