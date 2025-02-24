import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { SocketProvider } from './context/SocketContext'; // Import SocketProvider
import SignIn from './components/SignIn';
import SignUp from './components/SignUp';
import Chat from './components/Chat';
import Chatbot from './components/Chatbot';
import Profile from './components/Profile';
import Navbar from './components/navbar'; // Import Navbar

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(localStorage.getItem('token') !== null);

  return (
    <SocketProvider> {/* Wrap the entire app with SocketProvider */}
      <Router>
        {isAuthenticated && <Navbar />} {/* Show Navbar only when authenticated */}
        <Routes>
          {/* Redirect to /chat if authenticated, otherwise show SignIn */}
          <Route
            path="/"
            element={
              isAuthenticated ? (
                <Navigate to="/chat" />
              ) : (
                <SignIn setIsAuthenticated={setIsAuthenticated} />
              )
            }
          />

          {/* SignUp route */}
          <Route path="/signup" element={<SignUp />} />

          {/* Chat route */}
          <Route
            path="/chat"
            element={
              isAuthenticated ? (
                <Chat />
              ) : (
                <Navigate to="/" />
              )
            }
          />

          {/* Chatbot route */}
          <Route
            path="/chatbot"
            element={
              isAuthenticated ? (
                <Chatbot />
              ) : (
                <Navigate to="/" />
              )
            }
          />

          {/* Profile route */}
          <Route
            path="/profile"
            element={
              isAuthenticated ? (
                <Profile setIsAuthenticated={setIsAuthenticated} />
              ) : (
                <Navigate to="/" />
              )
            }
          />
        </Routes>
      </Router>
    </SocketProvider>
  );
};

export default App;