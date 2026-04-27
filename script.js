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

function _setQuickChips(chips) {
    const row = document.getElementById("quick-row");
    if (!row) return;
    row.innerHTML = "";
    if (!chips || chips.length === 0) {
        row.style.display = "none";
        return;
    }
    row.style.display = "flex";
    for (const c of chips) {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "chip-btn";
        btn.textContent = c.label;
        btn.addEventListener("click", () => c.onClick());
        row.appendChild(btn);
    }
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
        "I’m not a doctor and I can’t diagnose you, but I can help you decide what to do next.",
        "If you have severe symptoms like chest pain, trouble breathing, stroke signs, heavy bleeding, or fainting, please seek emergency care right away.",
        "Tell me what’s going on today."
    ].join(" ");
}

function _introText() {
    return [
        "Medical Assistant is designed to feel like a real triage conversation.",
        "You tell me what’s going on, I ask a few targeted questions, then I summarize what might be happening and what to do next.",
        "In the mobile app, the final assessment includes clickable sources from official medical references."
    ].join("\n");
}

function _howItWorksText() {
    return [
        "How it works:",
        "1) Quick triage: immediate safety guidance and red flags.",
        "2) A few questions: short intake to understand severity and context.",
        "3) Full assessment: likely causes, self-care, when to see a doctor, and sources."
    ].join("\n");
}

function _privacySafetyText() {
    return [
        "Privacy & Safety:",
        "• Use Clear Chat to start a new session.",
        "• You can request data/account deletion from the Support page.",
        "• For emergencies, call local emergency services immediately."
    ].join("\n");
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
        _appendAiMessage("Welcome back to Medical Assistant.\nTell me your main symptom (for example: headache, cough, chest pain).");
        _speak("Welcome back to Medical Assistant. Tell me your main symptom, for example headache, cough, or chest pain.");
        _setQuickChips([
            { label: "Start symptom check", onClick: () => _appendAiMessage("What’s your main symptom today?") },
            { label: "How it works", onClick: () => { _appendAiMessage(_howItWorksText()); _speak(_howItWorksText()); } },
            { label: "Privacy & Safety", onClick: () => { _appendAiMessage(_privacySafetyText()); _speak(_privacySafetyText()); } },
        ]);
        return;
    }

    enableBtn.addEventListener("click", () => {
        localStorage.setItem(VOICE_WELCOME_KEY, "true");
        _closeVoiceOverlay();
        const text = _welcomeScriptText();
        _appendAiMessage(text);
        _speak(text);
        _setQuickChips([
            { label: "What is it?", onClick: () => { _appendAiMessage(_introText()); _speak(_introText()); } },
            { label: "How it works", onClick: () => { _appendAiMessage(_howItWorksText()); _speak(_howItWorksText()); } },
            { label: "Start symptom check", onClick: () => _appendAiMessage("What’s your main symptom today?") },
        ]);
    });

    skipBtn.addEventListener("click", () => {
        localStorage.setItem(VOICE_WELCOME_KEY, "false");
        _closeVoiceOverlay();
        _appendAiMessage("Welcome to Medical Assistant.\nTell me your main symptom (for example: headache, cough, chest pain).");
        _setQuickChips([
            { label: "What is it?", onClick: () => _appendAiMessage(_introText()) },
            { label: "How it works", onClick: () => _appendAiMessage(_howItWorksText()) },
            { label: "Privacy & Safety", onClick: () => _appendAiMessage(_privacySafetyText()) },
        ]);
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
        const lower = userMessage.toLowerCase();
        let response = `Thanks — tell me a bit more.\n\n- How long has this been going on?\n- How severe is it (0–10)?\n- Any red flags (fainting, severe shortness of breath, weakness on one side, severe bleeding)?`;

        if (lower.includes("what") && (lower.includes("medical assistant") || lower.includes("this"))) {
            response = _introText();
        } else if (lower.includes("how") && lower.includes("work")) {
            response = _howItWorksText();
        } else if (lower.includes("privacy") || lower.includes("data") || lower.includes("delete")) {
            response = _privacySafetyText();
        }

        _appendAiMessage(response);
        _speak(response);
    }, 650);
}

// Allow sending messages by pressing Enter
document.getElementById('user-input').addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
        sendMessage();
    }
});

document.addEventListener("DOMContentLoaded", () => {
    _initVoiceWelcome();

    const introBtn = document.getElementById("intro-btn");
    const howBtn = document.getElementById("how-btn");
    const privacyBtn = document.getElementById("privacy-btn");
    if (introBtn) introBtn.addEventListener("click", () => { _appendAiMessage(_introText()); _speak(_introText()); });
    if (howBtn) howBtn.addEventListener("click", () => { _appendAiMessage(_howItWorksText()); _speak(_howItWorksText()); });
    if (privacyBtn) privacyBtn.addEventListener("click", () => { _appendAiMessage(_privacySafetyText()); _speak(_privacySafetyText()); });
});