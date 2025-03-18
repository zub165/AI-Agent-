# AI Chat Assistant

A modern, responsive web-based AI chat assistant with voice input capabilities and OpenAI integration.

## Project Structure

```
.
├── index.html          # Main HTML file with chat interface
├── styles.css          # CSS styling for the chat interface
├── script.js           # Frontend JavaScript functionality
└── Backend/           
    ├── main.py         # Python backend server
    └── requirements.txt # Python dependencies
```

## Features

- 💬 Modern chat interface with real-time messaging
- 🎨 Beautiful gradient design with smooth animations
- 🔵 Online status indicator with pulse animation
- 📱 Fully responsive design for all devices
- ⌨️ Support for Enter key to send messages
- 📜 Auto-scrolling chat history
- 🔄 Message animations for better UX
- 🎤 Voice input support
- 🤖 OpenAI GPT-3.5 integration
- ⌛ Typing indicators
- 🔒 Secure API communication

## Frontend

The frontend is built with vanilla JavaScript, HTML5, and CSS3, featuring:
- Clean and modern UI with gradient backgrounds
- Responsive design that works on mobile and desktop
- Smooth animations for message transitions
- Real-time chat with typing indicators
- Voice input capabilities
- Status indicators for online presence

## Backend

The backend infrastructure includes:
- Python Flask server
- OpenAI GPT-3.5 integration
- CORS support for cross-origin requests
- Environment variable configuration
- Chat history management
- Error handling and logging

## Getting Started

1. Clone the repository
2. Set up the backend:
   ```bash
   cd Backend
   pip install -r requirements.txt
   ```
3. Create a `.env` file in the Backend directory with your OpenAI API key:
   ```
   OPENAI_API_KEY=your_api_key_here
   ```
4. Start the backend server:
   ```bash
   python main.py
   ```
5. Open `index.html` in a web browser to test the frontend

## Voice Input

The chat assistant supports voice input through the Web Speech API:
- Click the microphone icon to start recording
- Speak your message
- Click the stop icon to end recording
- The transcribed text will appear in the input field
- Press Enter or click Send to send the message

## API Integration

The chat assistant uses OpenAI's GPT-3.5 model for generating responses:
- Messages are sent to the backend server
- The server processes the request using OpenAI's API
- Responses are returned to the frontend
- Chat history is maintained for context

## Future Enhancements

- [x] Implement actual AI integration
- [x] Add voice input support
- [x] Add typing indicators
- [ ] Add message persistence
- [ ] Implement user authentication
- [ ] Enable file sharing capabilities
- [ ] Add voice message support
- [ ] Implement conversation export
- [ ] Add theme customization
- [ ] Implement multi-language support

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is open source and available under the MIT License.