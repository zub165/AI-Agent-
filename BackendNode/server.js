const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Store chat history (in memory for now)
let chatHistory = [];

// Routes
app.get('/', (req, res) => {
  res.send('AI Chat Assistant API is running');
});

// Get chat history
app.get('/api/chat', (req, res) => {
  res.json(chatHistory);
});

// Post a new message
app.post('/api/chat', (req, res) => {
  const { message, sender, language } = req.body;
  
  if (!message) {
    return res.status(400).json({ error: 'Message is required' });
  }
  
  // Add user message to chat history
  const userMessage = {
    id: Date.now(),
    text: message,
    sender: sender || 'user',
    timestamp: new Date().toISOString(),
    language: language || 'en'
  };
  
  chatHistory.push(userMessage);
  
  // Generate bot response
  const botResponse = generateBotResponse(message, language || 'en');
  
  // Add bot response to chat history
  const botMessage = {
    id: Date.now() + 1,
    text: botResponse,
    sender: 'bot',
    timestamp: new Date().toISOString(),
    language: language || 'en'
  };
  
  chatHistory.push(botMessage);
  
  res.json({ message: botMessage });
});

// Generate a bot response based on the user message and language
function generateBotResponse(message, language) {
  // For simplicity, we'll use English responses for now
  // In a real app, you'd implement proper translations or use a translation API
  
  // For a simple version, we'll just respond to a few key phrases
  message = message.toLowerCase();
  
  if (message.includes('hello') || message.includes('hi') || message.includes('hey')) {
    return "Hello! How can I help you today?";
  }
  
  if (message.includes('how are you')) {
    return "I'm doing well, thank you for asking! How can I assist you?";
  }
  
  if (message.includes('help')) {
    return "I'd be happy to help! You can ask me about this AI assistant, its features, or how to use it.";
  }
  
  if (message.includes('feature') || message.includes('can you do')) {
    return "This AI assistant supports multiple languages, voice input, text-to-speech, and various themes. What would you like to know more about?";
  }
  
  if (message.includes('language') || message.includes('translate')) {
    return "I support 13 languages including English, Spanish, French, German, Chinese, Japanese, Hindi, Russian, Portuguese, Turkish, Italian, Arabic, and Urdu. You can change the language using the language dropdown.";
  }
  
  if (message.includes('theme') || message.includes('color') || message.includes('dark mode')) {
    return "You can choose from 7 different themes: Light, Night, Desert, Emerald, Azure, Ramadan, and Calligraphy. Just click the theme button in the toolbar to change it.";
  }
  
  if (message.includes('voice') || message.includes('speak') || message.includes('talk')) {
    return "You can use voice input by clicking the microphone button. I can also read messages aloud if you enable the text-to-speech feature by clicking the speaker button.";
  }
  
  // Default response
  return "I understand your message. Is there anything specific you'd like to know about this AI assistant?";
}

// Clear chat history
app.delete('/api/chat', (req, res) => {
  chatHistory = [];
  res.json({ message: 'Chat history cleared' });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 