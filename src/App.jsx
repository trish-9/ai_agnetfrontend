import React, { useState, useRef, useEffect } from 'react';

const HealthAIApp = () => {
  const [authState, setAuthState] = useState('login');
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const messagesEndRef = useRef(null);

  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [signupForm, setSignupForm] = useState({ email: '', password: '', confirmPassword: '' });

  const API_URL = 'https://34s2psw4-5000.inc1.devtunnels.ms/api';

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    if (!loginForm.email || !loginForm.password) {
      setError('Email and password are required');
      return;
    }

    if (!loginForm.email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: loginForm.email,
          password: loginForm.password
        })
      });

      const data = await response.json();

      if (data.success) {
        setCurrentUser({ email: loginForm.email, token: data.token });
        setAuthState('chat');
        setLoginForm({ email: '', password: '' });
        setMessages([]);
      } else {
        setError(data.message || 'Login failed. Please try again.');
      }
    } catch (err) {
      setError('Connection error. Please check your backend.');
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');

    if (!signupForm.email || !signupForm.password || !signupForm.confirmPassword) {
      setError('Please fill in all fields');
      return;
    }

    if (!signupForm.email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }

    if (signupForm.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (signupForm.password !== signupForm.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: signupForm.email,
          password: signupForm.password
        })
      });

      const data = await response.json();

      if (data.success) {
        setError('');
        setSignupForm({ email: '', password: '', confirmPassword: '' });
        setAuthState('login');
        alert('Account created! Please log in.');
      } else {
        setError(data.message || 'Signup failed. Please try again.');
      }
    } catch (err) {
      setError('Connection error. Please check your backend.');
      console.error('Signup error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();

    if (!inputValue.trim()) return;

    const userMessage = {
      id: Date.now(),
      text: inputValue,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages((prev) => [...prev, userMessage]);
    const currentInput = inputValue;
    setInputValue('');
    setError('');
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentUser.token}`
        },
        credentials: 'include',
        body: JSON.stringify({ message: currentInput, email: currentUser.email })
      });

      const data = await response.json();
      console.log(data);
      if (data.success) {
        const assistantMessage = {
          id: Date.now() + 1,
          text: data.message,
          sender: 'assistant',
          timestamp: new Date()
        };
        setMessages((prev) => [...prev, assistantMessage]);
      } else {
        setError(data.error || 'Something went wrong');
      }
    } catch (err) {
      setError('Connection failed. Please try again.');
      console.error('Chat error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setAuthState('login');
    setMessages([]);
    setLoginForm({ email: '', password: '' });
    setError('');
  };

  const styles = `
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    :root {
      --primary-blue: #007AFF;
      --primary-blue-light: #0A84FF;
      --accent-purple: #5856D6;
      --accent-pink: #FF2D55;
      --success-green: #34C759;
      --warning-orange: #FF9500;
      --danger-red: #FF3B30;

      --text-primary: #000000;
      --text-secondary: #666666;
      --text-tertiary: #999999;
      --text-light: #CCCCCC;

      --bg-white: #FFFFFF;
      --bg-light: #F9F9F9;
      --bg-very-light: #F5F5F7;
      --bg-glass: rgba(255, 255, 255, 0.7);

      --border-color: rgba(0, 0, 0, 0.08);
      --border-light: rgba(0, 0, 0, 0.05);
    }

    html { scroll-behavior: smooth; }

    body {
      background: linear-gradient(135deg, var(--bg-white) 0%, #FAFBFC 100%);
      color: var(--text-primary);
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'SF Pro Display', sans-serif;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
      overflow: hidden;
    }

    .auth-container {
      height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, var(--bg-white) 0%, #FAFBFC 100%);
      padding: 20px;
    }

    .auth-card {
      width: 100%;
      max-width: 420px;
      background: var(--bg-glass);
      backdrop-filter: blur(20px);
      border: 1px solid var(--border-color);
      border-radius: 24px;
      padding: 40px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
      animation: slideUp 0.5s ease-out;
    }

    @keyframes slideUp {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .auth-header {
      text-align: center;
      margin-bottom: 32px;
    }

    .auth-logo {
      font-size: 48px;
      margin-bottom: 16px;
      display: block;
      animation: float 3s ease-in-out infinite;
    }

    @keyframes float {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-10px); }
    }

    .auth-title {
      font-size: 24px;
      font-weight: 700;
      color: var(--text-primary);
      margin-bottom: 8px;
      letter-spacing: -0.5px;
    }

    .auth-subtitle {
      font-size: 14px;
      color: var(--text-secondary);
      margin: 0;
    }

    .form-group { margin-bottom: 16px; }

    .form-label {
      display: block;
      font-size: 14px;
      font-weight: 600;
      color: var(--text-primary);
      margin-bottom: 8px;
    }

    .form-input {
      width: 100%;
      padding: 12px 16px;
      border: 1.5px solid var(--border-color);
      border-radius: 12px;
      font-size: 15px;
      background: var(--bg-very-light);
      color: var(--text-primary);
      font-family: inherit;
      transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
      outline: none;
    }

    .form-input:hover {
      border-color: rgba(0, 122, 255, 0.4);
      background: linear-gradient(135deg, rgba(0, 122, 255, 0.05) 0%, rgba(88, 86, 214, 0.05) 100%);
    }

    .form-input:focus {
      border-color: var(--primary-blue);
      background: linear-gradient(135deg, rgba(0, 122, 255, 0.08) 0%, rgba(88, 86, 214, 0.08) 100%);
      box-shadow: 0 8px 24px rgba(0, 122, 255, 0.15);
    }

    .form-input::placeholder { color: var(--text-tertiary); }

    .form-error {
      background: rgba(255, 59, 48, 0.1);
      border: 1.5px solid var(--danger-red);
      color: var(--danger-red);
      padding: 12px 16px;
      border-radius: 12px;
      font-size: 13px;
      text-align: center;
      margin-bottom: 16px;
      animation: shake 0.5s ease-out;
    }

    @keyframes shake {
      0%, 100% { transform: translateX(0); }
      25% { transform: translateX(-5px); }
      75% { transform: translateX(5px); }
    }

    .auth-btn {
      width: 100%;
      padding: 12px 24px;
      background: linear-gradient(135deg, var(--primary-blue) 0%, var(--accent-purple) 100%);
      border: none;
      color: white;
      border-radius: 12px;
      font-size: 15px;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
      box-shadow: 0 6px 20px rgba(0, 122, 255, 0.35);
      margin-top: 16px;
    }

    .auth-btn:hover:not(:disabled) {
      transform: translateY(-3px);
      box-shadow: 0 10px 28px rgba(0, 122, 255, 0.45);
    }

    .auth-btn:active:not(:disabled) { transform: scale(0.98); }
    .auth-btn:disabled { opacity: 0.6; cursor: not-allowed; }

    .auth-toggle {
      text-align: center;
      margin-top: 20px;
      font-size: 14px;
      color: var(--text-secondary);
    }

    .auth-toggle-link {
      color: var(--primary-blue);
      cursor: pointer;
      font-weight: 600;
      text-decoration: none;
      transition: all 0.3s;
    }

    .auth-toggle-link:hover { color: var(--accent-purple); }

    .main-container {
      display: flex;
      height: 100vh;
      overflow: hidden;
      background: linear-gradient(135deg, var(--bg-white) 0%, #FAFBFC 100%);
    }

    .sidebar {
      width: 260px;
      background: var(--bg-glass);
      backdrop-filter: blur(20px);
      border-right: 1px solid var(--border-color);
      display: flex;
      flex-direction: column;
      transition: all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
      padding-top: 8px;
      box-shadow: 2px 0 12px rgba(0, 0, 0, 0.06);
    }

    .sidebar.closed {
      width: 0;
      border-right: none;
      overflow: hidden;
      padding-top: 0;
    }

    .sidebar-header {
      padding: 24px 20px 20px 20px;
      border-bottom: 1px solid var(--border-light);
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
    }

    .sidebar-logo {
      display: flex;
      align-items: center;
      gap: 12px;
      font-size: 16px;
      font-weight: 700;
      background: linear-gradient(135deg, var(--primary-blue) 0%, var(--accent-purple) 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      text-decoration: none;
      letter-spacing: -0.5px;
    }

    .sidebar-logo span {
      font-size: 28px;
      display: flex;
      align-items: center;
      -webkit-text-fill-color: unset;
      background: none;
    }

    .sidebar-toggle {
      background: transparent;
      border: none;
      color: var(--text-secondary);
      cursor: pointer;
      font-size: 18px;
      padding: 8px;
      border-radius: 10px;
      transition: all 0.3s;
    }

    .sidebar-toggle:hover {
      background: var(--bg-very-light);
      color: var(--text-primary);
      transform: rotate(90deg) scale(1.1);
    }

    .sidebar-content {
      flex: 1;
      overflow-y: auto;
      padding: 12px 8px;
    }

    .sidebar-footer {
      padding: 14px 8px 20px 8px;
      border-top: 1px solid var(--border-light);
    }

    .sidebar-btn {
      width: 100%;
      padding: 12px 16px;
      background: transparent;
      border: 1px solid var(--border-color);
      border-radius: 12px;
      cursor: pointer;
      font-size: 13px;
      font-weight: 600;
      transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
      text-align: left;
    }

    .sidebar-btn.logout {
      color: var(--danger-red);
      background: rgba(255, 59, 48, 0.08);
      border-color: rgba(255, 59, 48, 0.2);
    }

    .sidebar-btn.logout:hover {
      background: var(--danger-red);
      color: white;
      transform: translateY(-2px);
    }

    .chat-wrapper {
      flex: 1;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      background: var(--bg-white);
    }

    .chat-header {
      padding: 16px 24px;
      border-bottom: 1px solid var(--border-light);
      display: flex;
      align-items: center;
      justify-content: space-between;
      background: var(--bg-white);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
      position: sticky;
      top: 0;
      z-index: 100;
    }

    .header-left {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .toggle-sidebar {
      background: transparent;
      border: none;
      color: var(--primary-blue);
      cursor: pointer;
      font-size: 18px;
      padding: 8px;
      border-radius: 10px;
      transition: all 0.3s;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .toggle-sidebar:hover {
      background: var(--bg-very-light);
      transform: scale(1.1);
    }

    .header-title { display: flex; flex-direction: column; gap: 2px; }

    .header-title h1 {
      font-size: 18px;
      font-weight: 700;
      margin: 0;
      color: var(--text-primary);
      letter-spacing: -0.5px;
    }

    .header-subtitle {
      font-size: 12px;
      color: var(--text-secondary);
      font-weight: 500;
    }

    .header-icons {
      display: flex;
      gap: 8px;
      align-items: center;
    }

    .header-icon-btn {
      background: transparent;
      border: none;
      color: var(--primary-blue);
      cursor: pointer;
      font-size: 18px;
      padding: 8px;
      border-radius: 10px;
      transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .header-icon-btn:hover {
      background: var(--bg-very-light);
      transform: scale(1.15) rotate(20deg);
    }

    .header-user-info {
      font-size: 12px;
      color: var(--text-secondary);
      padding: 0 8px;
      border-right: 1px solid var(--border-light);
    }

    .messages-container {
      flex: 1;
      overflow-y: auto;
      padding: 20px 24px;
      display: flex;
      flex-direction: column;
      gap: 14px;
      background: var(--bg-white);
    }

    .messages-container::-webkit-scrollbar { width: 8px; }
    .messages-container::-webkit-scrollbar-track { background: transparent; }
    .messages-container::-webkit-scrollbar-thumb {
      background: rgba(0, 0, 0, 0.1);
      border-radius: 4px;
    }

    .empty-state {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      height: 100%;
      text-align: center;
      gap: 20px;
      padding: 40px 20px;
      animation: fadeIn 0.6s ease-out;
    }

    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

    .empty-state-icon {
      font-size: 80px;
      opacity: 0.9;
      animation: float 4s ease-in-out infinite;
    }

    .empty-state h2 {
      font-size: 24px;
      font-weight: 700;
      color: var(--text-primary);
      margin: 0;
      letter-spacing: -0.5px;
    }

    .empty-state p {
      font-size: 14px;
      color: var(--text-secondary);
      max-width: 320px;
      line-height: 1.6;
    }

    .suggestion-chips {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      justify-content: center;
      margin-top: 12px;
    }

    .chip {
      padding: 10px 16px;
      background: linear-gradient(135deg, rgba(0, 122, 255, 0.1) 0%, rgba(88, 86, 214, 0.1) 100%);
      border: 1.5px solid var(--primary-blue);
      border-radius: 20px;
      color: var(--primary-blue);
      font-size: 12px;
      cursor: pointer;
      transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
      font-weight: 600;
    }

    .chip:hover {
      background: linear-gradient(135deg, var(--primary-blue) 0%, var(--accent-purple) 100%);
      color: white;
      transform: translateY(-4px);
      box-shadow: 0 8px 20px rgba(0, 122, 255, 0.25);
    }

    .message-wrapper {
      display: flex;
      animation: slideIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
    }

    @keyframes slideIn {
      from { opacity: 0; transform: translateY(12px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .user-message { justify-content: flex-end; padding-right: 4px; }
    .assistant-message { justify-content: flex-start; padding-left: 4px; }

    .message-bubble {
      max-width: 65%;
      padding: 12px 16px;
      border-radius: 20px;
      word-wrap: break-word;
      line-height: 1.5;
      font-size: 15px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    }

    .user-message .message-bubble {
      background: linear-gradient(135deg, var(--primary-blue) 0%, #0A84FF 100%);
      color: white;
      border-bottom-right-radius: 4px;
    }

    .assistant-message .message-bubble {
      background: var(--bg-very-light);
      color: var(--text-primary);
      border-bottom-left-radius: 4px;
      border: 1px solid var(--border-light);
    }

    .message-content { word-break: break-word; white-space: pre-wrap; }

    .message-time {
      font-size: 11px;
      color: var(--text-tertiary);
      margin-top: 6px;
      display: block;
    }

    .user-message .message-time {
      text-align: right;
      color: rgba(255, 255, 255, 0.7);
    }

    .typing-indicator { display: flex; gap: 5px; padding: 12px 16px; }

    .typing-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: var(--primary-blue);
      animation: typing 1.4s infinite;
    }

    .typing-dot:nth-child(2) { animation-delay: 0.2s; }
    .typing-dot:nth-child(3) { animation-delay: 0.4s; }

    @keyframes typing {
      0%, 60%, 100% { opacity: 0.4; transform: translateY(0); }
      30% { opacity: 1; transform: translateY(-8px); }
    }

    .error-message {
      background: rgba(255, 59, 48, 0.1);
      border: 1.5px solid var(--danger-red);
      color: var(--danger-red);
      padding: 12px 16px;
      border-radius: 12px;
      font-size: 13px;
      text-align: center;
      animation: shake 0.5s ease-out;
      margin: 0 4px;
    }

    .input-container {
      padding: 16px 24px 24px 24px;
      background: var(--bg-white);
      border-top: 1px solid var(--border-light);
      display: flex;
      gap: 12px;
      align-items: flex-end;
    }

    .input-wrapper {
      flex: 1;
      display: flex;
      gap: 8px;
      background: var(--bg-very-light);
      border: 1.5px solid var(--border-color);
      border-radius: 24px;
      padding: 10px 16px;
      transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
      align-items: center;
    }

    .input-wrapper:hover {
      border-color: rgba(0, 122, 255, 0.4);
      background: linear-gradient(135deg, rgba(0, 122, 255, 0.05) 0%, rgba(88, 86, 214, 0.05) 100%);
    }

    .input-wrapper:focus-within {
      border-color: var(--primary-blue);
      background: linear-gradient(135deg, rgba(0, 122, 255, 0.08) 0%, rgba(88, 86, 214, 0.08) 100%);
      box-shadow: 0 8px 24px rgba(0, 122, 255, 0.15);
      transform: translateY(-2px);
    }

    .message-input {
      flex: 1;
      background: none;
      border: none;
      color: var(--text-primary);
      font-size: 15px;
      outline: none;
      font-family: inherit;
      resize: none;
      max-height: 100px;
      padding: 4px 0;
    }

    .message-input::placeholder { color: var(--text-tertiary); }
    .message-input:disabled { opacity: 0.6; }

    .input-icon {
      background: transparent;
      border: none;
      color: var(--primary-blue);
      cursor: pointer;
      font-size: 18px;
      padding: 6px;
      border-radius: 8px;
      transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
      display: flex;
      align-items: center;
    }

    .input-icon:hover:not(:disabled) {
      transform: scale(1.2) rotate(15deg);
      background: rgba(0, 122, 255, 0.1);
    }

    .send-btn {
      background: linear-gradient(135deg, var(--primary-blue) 0%, var(--accent-purple) 100%);
      border: none;
      color: white;
      border-radius: 16px;
      padding: 10px 24px;
      cursor: pointer;
      font-size: 15px;
      font-weight: 700;
      transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
      display: flex;
      align-items: center;
      gap: 6px;
      box-shadow: 0 6px 20px rgba(0, 122, 255, 0.35);
      min-width: 44px;
      justify-content: center;
    }

    .send-btn:hover:not(:disabled) {
      transform: translateY(-3px);
      box-shadow: 0 10px 28px rgba(0, 122, 255, 0.45);
    }

    .send-btn:active:not(:disabled) { transform: scale(0.92); }
    .send-btn:disabled { opacity: 0.5; }

    @media (max-width: 768px) {
      .sidebar {
        position: fixed;
        height: 100vh;
        z-index: 1000;
        left: 0;
        top: 0;
        width: 260px;
      }
      .sidebar.closed { transform: translateX(-100%); }
      .message-bubble { max-width: 80%; }
      .messages-container { padding: 12px; }
      .input-container { padding: 12px 12px 16px 12px; }
      .auth-card { border-radius: 16px; padding: 30px; }
    }

    @media (max-width: 480px) {
      .message-bubble { max-width: 90%; padding: 10px 14px; font-size: 14px; }
      .empty-state-icon { font-size: 60px; }
      .header-title h1 { font-size: 16px; }
      .empty-state h2 { font-size: 20px; }
      .auth-card { padding: 24px; }
      .auth-title { font-size: 20px; }
    }
  `;

  if (authState === 'login') {
    return (
      <>
        <style>{styles}</style>
        <div className="auth-container">
          <div className="auth-card">
            <div className="auth-header">
              <span className="auth-logo">💬</span>
              <h1 className="auth-title">HealthAI</h1>
              <p className="auth-subtitle">Your personal health assistant</p>
            </div>

            {error && <div className="form-error">{error}</div>}

            <form onSubmit={handleLogin}>
              <div className="form-group">
                <label className="form-label">Email</label>
                <input
                  type="email"
                  className="form-input"
                  placeholder="you@example.com"
                  value={loginForm.email}
                  onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Password</label>
                <input
                  type="password"
                  className="form-input"
                  placeholder="••••••"
                  value={loginForm.password}
                  onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                  disabled={loading}
                />
              </div>

              <button type="submit" className="auth-btn" disabled={loading}>
                {loading ? '⏳ Loading...' : '✨ Login'}
              </button>
            </form>

            <div className="auth-toggle">
              Don't have an account?{' '}
              <span
                className="auth-toggle-link"
                onClick={() => { setAuthState('signup'); setError(''); }}
              >
                Sign up
              </span>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (authState === 'signup') {
    return (
      <>
        <style>{styles}</style>
        <div className="auth-container">
          <div className="auth-card">
            <div className="auth-header">
              <span className="auth-logo">💬</span>
              <h1 className="auth-title">HealthAI</h1>
              <p className="auth-subtitle">Create a new account</p>
            </div>

            {error && <div className="form-error">{error}</div>}

            <form onSubmit={handleSignup}>
              <div className="form-group">
                <label className="form-label">Email</label>
                <input
                  type="email"
                  className="form-input"
                  placeholder="you@example.com"
                  value={signupForm.email}
                  onChange={(e) => setSignupForm({ ...signupForm, email: e.target.value })}
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Password</label>
                <input
                  type="password"
                  className="form-input"
                  placeholder="••••••"
                  value={signupForm.password}
                  onChange={(e) => setSignupForm({ ...signupForm, password: e.target.value })}
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Confirm Password</label>
                <input
                  type="password"
                  className="form-input"
                  placeholder="••••••"
                  value={signupForm.confirmPassword}
                  onChange={(e) => setSignupForm({ ...signupForm, confirmPassword: e.target.value })}
                  disabled={loading}
                />
              </div>

              <button type="submit" className="auth-btn" disabled={loading}>
                {loading ? '⏳ Loading...' : '🎉 Sign up'}
              </button>
            </form>

            <div className="auth-toggle">
              Already have an account?{' '}
              <span
                className="auth-toggle-link"
                onClick={() => { setAuthState('login'); setError(''); }}
              >
                Log in
              </span>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <style>{styles}</style>
      <div className="main-container">

        {/* SIDEBAR */}
        <div className={`sidebar ${!sidebarOpen ? 'closed' : ''}`}>
          <div className="sidebar-header">
            <div className="sidebar-logo">
              <span>💬</span>
              <span>HealthAI</span>
            </div>
            <button className="sidebar-toggle" onClick={() => setSidebarOpen(false)}>
              ✕
            </button>
          </div>

          <div className="sidebar-content" />

          <div className="sidebar-footer">
            <button className="sidebar-btn logout" onClick={handleLogout}>
              🚪 Logout
            </button>
          </div>
        </div>

        {/* CHAT WRAPPER */}
        <div className="chat-wrapper">

          {/* HEADER */}
          <div className="chat-header">
            <div className="header-left">
              <button className="toggle-sidebar" onClick={() => setSidebarOpen(!sidebarOpen)}>
                ☰
              </button>
              <div className="header-title">
                <h1>HealthAI</h1>
                <div className="header-subtitle">Your health assistant</div>
              </div>
            </div>
            <div className="header-icons">
              <div className="header-user-info">
                👤 {currentUser?.email}
              </div>
              <button className="header-icon-btn" title="Settings">⚙️</button>
              <button className="header-icon-btn" title="Notifications">🔔</button>
            </div>
          </div>

          {/* MESSAGES */}
          <div className="messages-container">
            {messages.length === 0 && (
              <div className="empty-state">
                <div className="empty-state-icon">🏥</div>
                <h2>Welcome to HealthAI</h2>
                <p>Get instant answers to all your health questions. Available 24/7 for your wellbeing.</p>
                <div className="suggestion-chips">
                  <div className="chip" onClick={() => setInputValue('What are the symptoms of flu?')}>Symptom Check</div>
                  <div className="chip" onClick={() => setInputValue('Tell me about a healthy lifestyle')}>Health Tips</div>
                  <div className="chip" onClick={() => setInputValue('Find nearby clinics')}>Find Clinics</div>
                </div>
              </div>
            )}

            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`message-wrapper ${msg.sender === 'user' ? 'user-message' : 'assistant-message'}`}
              >
                <div className="message-bubble">
                  <div className="message-content">{msg.text}</div>
                  <span className="message-time">
                    {msg.timestamp.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            ))}

            {loading && (
              <div className="message-wrapper assistant-message">
                <div className="message-bubble">
                  <div className="typing-indicator">
                    <div className="typing-dot"></div>
                    <div className="typing-dot"></div>
                    <div className="typing-dot"></div>
                  </div>
                </div>
              </div>
            )}

            {error && <div className="error-message">⚠️ {error}</div>}

            <div ref={messagesEndRef} />
          </div>

          {/* INPUT */}
          <div className="input-container">
            <div className="input-wrapper">
              <button className="input-icon" title="Attach">📎</button>
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage(e);
                  }
                }}
                placeholder="Ask something..."
                disabled={loading}
                className="message-input"
              />
              <button className="input-icon" title="Emoji">😊</button>
            </div>
            <button
              onClick={handleSendMessage}
              disabled={loading || !inputValue.trim()}
              className="send-btn"
            >
              {loading ? '⏳' : '➤'}
            </button>
          </div>

        </div>
      </div>
    </>
  );
};

export default HealthAIApp;
