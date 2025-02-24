import React, { useState, useEffect, useContext } from 'react';
import { SocketContext } from '../context/SocketContext';

const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [receiverUsername, setReceiverUsername] = useState('');
  const [notifications, setNotifications] = useState([]); // For notifications
  const socket = useContext(SocketContext);

  useEffect(() => {
    if (!socket) {
      console.log('Socket is not initialized');
    } else {
      console.log('Socket initialized');
    }
  }, [socket]);

  const handleSendMessage = () => {
    if (!socket) {
      console.error('Socket is not connected');
      return;
    }

    if (newMessage.trim() && receiverUsername) {
      const senderUsername = localStorage.getItem('username'); // Get logged-in user's username
      console.log('Sending message:', { senderUsername, receiverUsername, message: newMessage });

      socket.emit('sendMessage', { senderUsername, receiverUsername, message: newMessage });

      setMessages((prev) => [...prev, { sender: senderUsername, message: newMessage }]);
      setNewMessage('');
    } else {
      console.log('Error: Missing receiver or message');
    }
  };

  useEffect(() => {
    if (!socket) return;

    socket.on('receiveMessage', (data) => {
      console.log('Received message:', data);
      setMessages((prev) => [...prev, { sender: data.senderUsername, message: data.message }]);

      // Add notification for new messages
      if (data.senderUsername !== localStorage.getItem('username')) {
        setNotifications((prev) => [...prev, `New message from ${data.senderUsername}: ${data.message}`]);
      }
    });

    return () => {
      socket.off('receiveMessage');
    };
  }, [socket]);

  return (
    <div style={styles.container}>
      <div style={styles.chatWindow}>
        <div style={styles.userInputContainer}>
          <input
            type="text"
            placeholder="Receiver's username..."
            value={receiverUsername}
            onChange={(e) => setReceiverUsername(e.target.value)}
            style={styles.usernameInput}
          />
        </div>

        {/* Notification Panel */}
        <div style={styles.notificationPanel}>
          <h4>Notifications</h4>
          {notifications.map((notification, index) => (
            <div key={index} style={styles.notification}>
              {notification}
            </div>
          ))}
        </div>

        {/* Chat Messages */}
        <div style={styles.messages}>
          {messages.map((msg, index) => (
            <div key={index} style={msg.sender === localStorage.getItem('username') ? styles.senderMessage : styles.receiverMessage}>
              <p><strong>{msg.sender}:</strong> {msg.message}</p>
            </div>
          ))}
        </div>

        {/* Message Input */}
        <div style={styles.inputContainer}>
          <input
            type="text"
            placeholder="Type a message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            style={styles.messageInput}
          />
          <button onClick={handleSendMessage} style={styles.sendButton}>
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: { display: 'flex', height: '100vh' },
  chatWindow: { flex: 1, display: 'flex', flexDirection: 'column', backgroundColor: '#ecf0f1' },
  userInputContainer: { display: 'flex', padding: '10px', backgroundColor: '#fff', gap: '10px' },
  usernameInput: { flex: 1, padding: '10px', borderRadius: '5px', border: '1px solid #ccc' },
  messages: { flex: 1, padding: '10px', overflowY: 'auto' },
  senderMessage: { alignSelf: 'flex-end', backgroundColor: '#dcf8c6', padding: '10px', borderRadius: '10px', margin: '5px 0', maxWidth: '60%' },
  receiverMessage: { alignSelf: 'flex-start', backgroundColor: '#fff', padding: '10px', borderRadius: '10px', margin: '5px 0', maxWidth: '60%' },
  messageText: { color: '#000', margin: 0 }, // Set font color to black
  inputContainer: { display: 'flex', padding: '10px', backgroundColor: '#fff' },
  messageInput: { flex: 1, padding: '10px', borderRadius: '5px', border: '1px solid #ccc' },
  sendButton: { padding: '10px', borderRadius: '5px', border: 'none', backgroundColor: '#3498db', color: '#fff', cursor: 'pointer' },
};

export default Chat;