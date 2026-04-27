const VOICE_WELCOME_KEY = "ma_voice_welcome_enabled_v1";

function _appendAiMessage(text) {
    const chatBox = document.getElementById('chat-box');
    const aiMessageElement = document.createElement('div');
    aiMessageElement.classList.add('message', 'ai-message');
    aiMessageElement.textContent = text;
    chatBox.appendChild(aiMessageElement);
    chatBox.scrollTop = chatBox.scrollHeight;
}

function _appendUserMessage(text) {
    const chatBox = document.getElementById('chat-box');
    const userMessageElement = document.createElement('div');
    userMessageElement.classList.add('message', 'user-message');
    userMessageElement.textContent = text;
    chatBox.appendChild(userMessageElement);
    chatBox.scrollTop = chatBox.scrollHeight;
}

function _speechSupported() {
    return typeof window !== "undefined" && "speechSynthesis" in window && typeof SpeechSynthesisUtterance !== "undefined";
}

function _speak(text) {
    if (!_speechSupported()) return false;
    const enabled = localStorage.getItem(VOICE_WELCOME_KEY) === "true";
    if (!enabled) return false;

    try {
        window.speechSynthesis.cancel();
        const u = new SpeechSynthesisUtterance(text);
        u.rate = 1.02;
        u.pitch = 1.0;
        u.lang = "en-US";
        window.speechSynthesis.speak(u);
        return true;
    } catch (e) {
        return false;
    }
}

function _closeVoiceOverlay() {
    const overlay = document.getElementById("voice-welcome");
    if (overlay) overlay.classList.add("hidden");
}

function _welcomeScriptText() {
    return [
        "Welcome to Medical Assistant.",
        "I can help you understand symptoms, ask a few follow-up questions, and provide a safety-first assessment with trusted medical sources.",
        "If you have severe symptoms like chest pain, trouble breathing, stroke signs, heavy bleeding, or fainting, please seek emergency care right away.",
        "Tell me what’s going on today."
    ].join(" ");
}

function _initVoiceWelcome() {
    const overlay = document.getElementById("voice-welcome");
    const enableBtn = document.getElementById("enable-voice-btn");
    const skipBtn = document.getElementById("skip-voice-btn");

    if (!overlay || !enableBtn || !skipBtn) return;

    const alreadyEnabled = localStorage.getItem(VOICE_WELCOME_KEY) === "true";
    if (!_speechSupported()) {
        overlay.classList.add("hidden");
        _appendAiMessage("Welcome to Medical Assistant. (Voice welcome isn't supported in this browser.)");
        return;
    }

    if (alreadyEnabled) {
        overlay.classList.add("hidden");
        _appendAiMessage("Welcome back. How can I help today?");
        _speak("Welcome back to Medical Assistant. How can I help today?");
        return;
    }

    enableBtn.addEventListener("click", () => {
        localStorage.setItem(VOICE_WELCOME_KEY, "true");
        _closeVoiceOverlay();
        const text = _welcomeScriptText();
        _appendAiMessage(text);
        _speak(text);
    });

    skipBtn.addEventListener("click", () => {
        localStorage.setItem(VOICE_WELCOME_KEY, "false");
        _closeVoiceOverlay();
        _appendAiMessage("Welcome to Medical Assistant. How can I help today?");
    });
}

function sendMessage() {
    const userInput = document.getElementById('user-input');
    const userMessage = userInput.value.trim();
    if (!userMessage) return; // Don't send empty messages

    // Add user's message to the chat box
    _appendUserMessage(userMessage);

    // Clear the input field
    userInput.value = '';

    // Simulate AI response (replace with actual API call)
    setTimeout(() => {
        const response = `You said: "${userMessage}"`;
        _appendAiMessage(response);
        _speak(response);
    }, 1000);
}

// Allow sending messages by pressing Enter
document.getElementById('user-input').addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
        sendMessage();
    }
});

document.addEventListener("DOMContentLoaded", () => {
    _initVoiceWelcome();
});