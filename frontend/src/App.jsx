import React, { useState } from "react";
import Dashboard from "./components/Dashboard";
import Login from "./components/Login";
import Signup from "./components/Signup";

function App() {
  const [user, setUser] = useState(null);
  const [showSignup, setShowSignup] = useState(false);

  const handleLogin = () => {
    setUser(true);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  const handleSignupSuccess = () => {
    setShowSignup(false);
  };

  if (!user) {
    return showSignup ? (
      <Signup onSignupSuccess={handleSignupSuccess} switchToLogin={() => setShowSignup(false)} />
    ) : (
      <Login onLogin={handleLogin} switchToSignup={() => setShowSignup(true)} />
    );
  }

  return <Dashboard onLogout={handleLogout} />;
}

export default App;
