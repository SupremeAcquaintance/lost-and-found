import React, { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCommentDots, faPlusCircle, faHistory, faHome, faPaperPlane, faUserAstronaut, faRobot } from '@fortawesome/free-solid-svg-icons';
import { useAuth } from './auth/AuthContext';
import { ToastContainer, toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import './styles/ChatTabs.css';

const ChatTabs = () => {
  const { userEmail } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('chats');
  const [conversations, setConversations] = useState([]);
  const [recipientEmail, setRecipientEmail] = useState('');
  const [conversationId, setConversationId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');

  // add scroll ref to scroll to the bottom of the chat messages
  const messagesEndRef = useRef(null);  

  const fetchConversations = useCallback(async () => {
    try { // fetch conversations from the server
      const res = await axios.get(`http://localhost:3000/api/chat/user-conversations/${userEmail}`);
      setConversations(res.data);
    } catch (err) {
      toast.error("Failed to load chats");
    }
  }, [userEmail]);

  const fetchMessages = useCallback(async (convId) => { // fetch messages for a specific conversation
    if (!convId) return;
    try {
      const res = await axios.get(`http://localhost:3000/api/chat/messages/${convId}`);
      setMessages(res.data);
    } catch (err) {
      toast.error("Failed to load messages");
    }
  }, []);

  useEffect(() => {
    if (activeTab === 'chats') { // fetch conversations when the active tab is 'chats'
      fetchConversations();
    }
  }, [activeTab, fetchConversations]);

  useEffect(() => { // fetch messages when the conversationId changes
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);  // Scroll to the bottom when messages update

  const initiateConversation = async () => { // start a new conversation
    if (!recipientEmail.trim()) {
      toast.warn('Enter a valid recipient email');
      return;
    }
    try {
      const res = await axios.post(`http://localhost:3000/api/chat/start`, { 
        user1: userEmail,
        user2: recipientEmail,
      });
      setConversationId(res.data.ConversationID);
      setMessages([]); // clear messages for the new conversation
      setActiveTab('chatroom'); // switch to chatroom tab
      toast.success('Conversation started!'); // show success message
    } catch (err) {
      if (err.response?.status === 404) {
        toast.error('Recipient not found');
      } else {
        toast.error('Failed to start conversation');
      }
    }
  };

  const sendMessage = async () => { // send a message in the chatroom
    if (!newMessage.trim()) return;
    try { // send message to the server
      await axios.post('http://localhost:3000/api/chat/message', {
        conversationId,
        senderEmail: userEmail,
        messageText: newMessage,
      });
      setNewMessage('');
      fetchMessages(conversationId);
    } catch (err) {
      toast.error('Message send failed');
    }
  };

  // Function to open a conversation and fetch messages
  const openConversation = (convId) => {
    setConversationId(convId);
    setMessages([]);
    setActiveTab('chatroom');
    fetchMessages(convId);
  };

  // Function to render the content of the active tab
  const renderTabContent = () => {
    if (activeTab === 'chats') { // render recent chats
      return (
        <div className="chats-container">
          {conversations.length === 0 ? (
            <p>No recent chats</p>
          ) : (
            conversations.map((conv) => (
              <div
                key={conv.ConversationID}
                className="chat-card"
                onClick={() => openConversation(conv.ConversationID)}
              >
                <FontAwesomeIcon icon={faCommentDots} /> {conv.ParticipantEmail}
              </div>
            ))
          )}
        </div>
      );
    }

    if (activeTab === 'new') { // render new chat tab
      return (
        <div className="new-chat-container">
          <input
            type="email"
            value={recipientEmail}
            onChange={(e) => setRecipientEmail(e.target.value)}
            placeholder="Recipient Email"
          />
          <button onClick={initiateConversation}>Start Chat</button>
        </div>
      );
    }

    if (activeTab === 'chatroom') { // render chatroom tab
      return (
        <div className="chat-container">
          <ToastContainer />
          <div className="chat-header">
            <FontAwesomeIcon icon={faCommentDots} className="header-icon" />
            {conversationId ? (
              <span>Chat with:    {recipientEmail}</span> 
            ) : (
              'Chat Room'
            )}
          </div>
    
          {!conversationId && (
            <div className="chat-input">
              <input
                type="email"
                value={recipientEmail}
                onChange={(e) => setRecipientEmail(e.target.value)}
                placeholder="Enter recipient's email"
              />
              <button onClick={initiateConversation}>
                <FontAwesomeIcon icon={faPaperPlane} /> Start
              </button>
            </div>
          )}
    
          {conversationId && (
            <>
              <div className="chat-messages">
                {messages.length === 0 ? (
                  <div className="empty-chat">No messages yet. Say hi 👋</div>
                ) : (
                  messages.map((msg, idx) => (
                    <div
                      key={idx}
                      className={`chat-bubble ${msg.SenderEmail === userEmail ? 'user' : 'other'}`}
                    >
                      <FontAwesomeIcon
                        icon={msg.SenderEmail === userEmail ? faUserAstronaut : faRobot}
                        className="sender-icon"
                      />
                      <div className="bubble-text">{msg.MessageText}</div>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>
    
              <div className="chat-input">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type your message..."
                />
                <button type="submit" onClick={sendMessage}>
                  <FontAwesomeIcon icon={faPaperPlane} />
                </button>
              </div>
            </>
          )}
        </div>
      );
    }
  };

  return ( // render the main component
    <div className="chat-tabs">
      <ToastContainer />
      <div className="tabs-header">
        <button onClick={() => setActiveTab('chats')}>
          <FontAwesomeIcon icon={faHistory} /> Recent Chats
        </button>
        <button onClick={() => setActiveTab('new')}>
          <FontAwesomeIcon icon={faPlusCircle} /> Start New Chat
        </button>
        <button onClick={() => navigate('/home')}>
          <FontAwesomeIcon icon={faHome} /> Home
        </button>
      </div>

      {renderTabContent()}
    </div>
  );
};

export default ChatTabs; 
// Export the ChatTabs component for use in the chatroom of the application for communication between users
