import React, { useState } from 'react';

const Chatbot = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSendMessage = async () => {
    if (input.trim() && !isLoading) {
      setIsLoading(true);
      setMessages((prev) => [...prev, { sender: 'You', message: input }]);
      const response = await fetch('http://192.168.65.7:3000/chat/chatbot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input }),
      });
      const data = await response.json();
      setMessages((prev) => [...prev, { sender: 'Chatbot', message: data.response }]);
      setInput('');
      setIsLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.messages}>
        {messages.map((msg, index) => (
          <div key={index} style={msg.sender === 'You' ? styles.senderMessage : styles.receiverMessage}>
            <p>{msg.message}</p>
          </div>
        ))}
      </div>
      <div style={styles.inputContainer}>
        <input
          type="text"
          placeholder="Type a message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          style={styles.input}
        />
        <button onClick={handleSendMessage} style={styles.button} disabled={isLoading}>
          {isLoading ? 'Sending...' : 'Send'}
        </button>
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    backgroundColor: '#ecf0f1',
  },
  messages: {
    flex: 1,
    padding: '10px',
    overflowY: 'auto',
  },
  senderMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#dcf8c6',
    padding: '10px',
    borderRadius: '10px',
    margin: '5px 0',
    maxWidth: '60%',
  },
  receiverMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#a2d5f2',
    padding: '10px',
    borderRadius: '10px',
    margin: '5px 0',
    maxWidth: '60%',
  },
  inputContainer: {
    display: 'flex',
    padding: '10px',
    backgroundColor: '#fff',
  },
  input: {
    flex: 1,
    padding: '10px',
    borderRadius: '5px',
    border: '1px solid #ccc',
  },
  button: {
    padding: '10px',
    borderRadius: '5px',
    border: 'none',
    backgroundColor: '#3498db',
    color: '#fff',
    cursor: 'pointer',
  },
};

export default Chatbot;