import React, { useState, useEffect, useRef } from 'react';
import './App.css';

function App() {
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [isListening, setIsListening] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const chatBoxRef = useRef(null);

  // Fetch tasks on component mount
  useEffect(() => {
    fetchTasks();
  }, []);

  // Auto-scroll to the latest message
  useEffect(() => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }
  }, [chatHistory]);

  const fetchTasks = async () => {
    const response = await fetch('http://localhost:8000/tasks/1'); // Replace 1 with dynamic user ID
    const data = await response.json();
    setTasks(data);
  };

  const sendMessage = async () => {
    if (!message.trim()) return;

    setIsLoading(true);
    setChatHistory([...chatHistory, { role: 'user', content: message }]);

    const response = await fetch('http://localhost:8000/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message }),
    });

    const data = await response.json();
    setChatHistory((prev) => [...prev, { role: 'assistant', content: data.response }]);
    setMessage('');
    setIsLoading(false);
  };

  const addTask = async () => {
    const description = prompt('Enter task description:');
    if (!description) return;

    const response = await fetch('http://localhost:8000/tasks/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: 1, description }), // Replace 1 with dynamic user ID
    });

    const data = await response.json();
    setTasks([...tasks, data]);
  };

  const toggleTaskCompletion = async (taskId) => {
    const task = tasks.find((task) => task.id === taskId);
    const updatedTask = { ...task, completed: !task.completed };

    const response = await fetch(`http://localhost:8000/tasks/${taskId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ completed: updatedTask.completed }),
    });

    const data = await response.json();
    setTasks(tasks.map((task) => (task.id === taskId ? data : task)));
  };

  const startListening = () => {
    const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.start();
    setIsListening(true);

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setMessage(transcript);
      setIsListening(false);
    };

    recognition.onerror = () => {
      setIsListening(false);
    };
  };

  return (
    <div className="App">
      <div className="sidebar">
        <h2>Tasks</h2>
        <button onClick={addTask}>Add Task</button>
        <ul>
          {tasks.map((task) => (
            <li key={task.id} className={task.completed ? 'completed' : ''}>
              <span onClick={() => toggleTaskCompletion(task.id)}>{task.description}</span>
            </li>
          ))}
        </ul>
      </div>
      <div className="chat-container">
        <div className="chat-box" ref={chatBoxRef}>
          {chatHistory.map((msg, index) => (
            <div key={index} className={`message ${msg.role}`}>
              {msg.content}
            </div>
          ))}
          {isLoading && (
            <div className="message assistant">
              <div className="loading-spinner"></div>
            </div>
          )}
        </div>
        <div className="chat-input">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Type your message..."
          />
          <button onClick={startListening} disabled={isListening}>
            {isListening ? 'Listening...' : '🎤'}
          </button>
          <button onClick={sendMessage}>Send</button>
        </div>
      </div>
    </div>
  );
}

export default App;