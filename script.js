// Global variables
let lang = localStorage.getItem('lang') || 'en';
let theme = localStorage.getItem('theme') || 'light';
let recognition;
let isRecognizing = false;
let transcript = '';
let timer;
let isAutoTranslateEnabled = localStorage.getItem('autoTranslate') === 'true' || false;
let isSpeakEnabled = localStorage.getItem('speakEnabled') === 'true' || false;

// DOM elements
const themeSelect = document.getElementById('theme-toggle');
const languageSelect = document.getElementById('lang-toggle');
const micBtn = document.getElementById('voice-btn');
const sendBtn = document.getElementById('send-btn');
const messageInput = document.getElementById('user-input');
const chatContainer = document.getElementById('chat-box');
const voiceStatus = document.getElementById('voice-status') || document.createElement('div');
if (!document.getElementById('voice-status')) {
    voiceStatus.id = 'voice-status';
    voiceStatus.style.display = 'none';
    document.body.appendChild(voiceStatus);
}

const voiceDetected = document.createElement('div');
voiceDetected.className = 'voice-detected';
document.body.appendChild(voiceDetected);

// Initialize the app
function initApp() {
    // Set initial language and theme
    updateLanguage(lang);
    updateTheme(theme);
    
    // Create welcome message
    createMessage(languages[lang].welcome, 'bot');
    
    // Set up event listeners
    setupEventListeners();
    
    // Initialize speech recognition
    setupSpeechRecognition();
    
    // Initialize speech synthesis
    setupSpeechSynthesis();
    
    // Initialize toolbar buttons
    setupToolbarButtons();
    
    // Update feature indicators
    updateFeatureIndicators();
    
    // Fix any initial night theme issues
    if (theme === 'night') {
        document.body.setAttribute('data-theme', 'night');
        document.querySelectorAll('#theme-menu .dropdown-item').forEach(item => {
            if (item.getAttribute('data-theme') === 'night') {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });
    }
}

// Set up event listeners
function setupEventListeners() {
    // Theme selection
    document.querySelectorAll('#theme-menu .dropdown-item').forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            theme = e.currentTarget.getAttribute('data-theme');
            localStorage.setItem('theme', theme);
            updateTheme(theme);
            document.querySelector('.theme-dropdown').classList.remove('active');
        });
    });
    
    // Theme dropdown toggle
    themeSelect.addEventListener('click', (e) => {
        e.stopPropagation();
        const themeDropdown = document.querySelector('.theme-dropdown');
        const langDropdown = document.querySelector('.lang-dropdown');
        
        // Close language dropdown if open
        langDropdown.classList.remove('active');
        
        // Toggle theme dropdown
        themeDropdown.classList.toggle('active');
    });
    
    // Language selection
    document.querySelectorAll('#lang-menu .dropdown-item').forEach(item => {
        item.addEventListener('click', (e) => {
            const previousLang = lang;
            lang = e.currentTarget.getAttribute('data-lang');
            localStorage.setItem('lang', lang);
            updateLanguage(lang);
            document.querySelector('.lang-dropdown').classList.remove('active');
            
            if (previousLang !== lang) {
                translateChatHistory(previousLang, lang);
            }
        });
    });
    
    languageSelect.addEventListener('click', (e) => {
        e.stopPropagation();
        document.querySelector('.lang-dropdown').classList.toggle('active');
        document.querySelector('.theme-dropdown').classList.remove('active');
    });
    
    // Close dropdowns when clicking outside
    document.addEventListener('click', () => {
        document.querySelector('.theme-dropdown').classList.remove('active');
        document.querySelector('.lang-dropdown').classList.remove('active');
    });
    
    // Microphone button
    micBtn.addEventListener('click', toggleVoiceInput);
    
    // Send button
    sendBtn.addEventListener('click', sendMessage);
    
    // Enter key to send message
    messageInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });
    
    // Modal event listeners
    document.getElementById('about-link')?.addEventListener('click', (e) => {
        e.preventDefault();
        showModal('About AI Assistant', getAboutContent());
    });
    
    document.getElementById('help-link')?.addEventListener('click', (e) => {
        e.preventDefault();
        showModal('Help & Tips', getHelpContent());
    });
    
    document.getElementById('close-modal')?.addEventListener('click', () => {
        document.getElementById('info-modal').classList.remove('active');
    });
}

// Update the language
function updateLanguage(language) {
    document.documentElement.lang = language;
    document.documentElement.dir = (language === 'ar' || language === 'ur') ? 'rtl' : 'ltr';
    document.title = languages[language].title;
    document.querySelector('.chat-header h2').textContent = languages[language].title;
    document.querySelector('.status-text').textContent = languages[language].online;
    messageInput.placeholder = languages[language].placeholder;
    
    // Update language toggle button
    document.querySelector('.current-lang').textContent = language.toUpperCase();
    
    // Update toolbar button tooltips
    if (document.getElementById('clear-chat-btn')) {
        document.getElementById('clear-chat-btn').querySelector('.tooltip').textContent = 
            language === 'en' ? 'Clear chat' : 
            language === 'ar' ? 'مسح المحادثة' : 
            language === 'ur' ? 'چیٹ صاف کریں' : 'Clear chat';
    }
    
    if (document.getElementById('export-chat-btn')) {
        document.getElementById('export-chat-btn').querySelector('.tooltip').textContent = 
            language === 'en' ? 'Export chat' : 
            language === 'ar' ? 'تصدير المحادثة' : 
            language === 'ur' ? 'چیٹ ایکسپورٹ کریں' : 'Export chat';
    }
    
    if (document.getElementById('auto-translate-btn')) {
        document.getElementById('auto-translate-btn').querySelector('.tooltip').textContent = 
            language === 'en' ? 'Auto translate' : 
            language === 'ar' ? 'ترجمة تلقائية' : 
            language === 'ur' ? 'آٹو ٹرانسلیٹ' : 'Auto translate';
    }
    
    // Update speak button tooltip if it exists
    if (document.getElementById('speak-btn')) {
        document.getElementById('speak-btn').querySelector('.tooltip').textContent = 
            languages[language].speakMessages || 'Speak messages';
    }
    
    // Update feature indicators
    updateFeatureIndicators();
}

// Update the theme
function updateTheme(selectedTheme) {
    console.log('Updating theme to:', selectedTheme);
    
    // First, apply the correct theme class to both body and html elements
    document.body.classList.remove('light', 'night', 'desert', 'emerald', 'azure', 'ramadan', 'calligraphy');
    document.body.classList.add(selectedTheme);
    
    // Set data-theme attribute on both body and html
    document.body.setAttribute('data-theme', selectedTheme);
    document.documentElement.setAttribute('data-theme', selectedTheme);
    
    // Update the theme toggle display
    document.querySelector('.current-theme').textContent = 
        selectedTheme.charAt(0).toUpperCase() + selectedTheme.slice(1);
    
    // Update active state in dropdown
    document.querySelectorAll('#theme-menu .dropdown-item').forEach(item => {
        if (item.getAttribute('data-theme') === selectedTheme) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });
    
    // Force repaint by getting and setting CSS variables
    const computedStyle = getComputedStyle(document.documentElement);
    const bgColor = computedStyle.getPropertyValue(`--bg-color`).trim();
    const secondaryGradient = computedStyle.getPropertyValue(`--secondary-gradient`).trim();
    
    document.body.style.backgroundColor = bgColor;
    document.body.style.background = secondaryGradient;
    
    // Log for debugging
    console.log('Theme updated:', selectedTheme, 'Background:', secondaryGradient);
}

// Initialize speech recognition
function setupSpeechRecognition() {
    // Check if browser supports speech recognition
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        
        recognition.onstart = () => {
            isRecognizing = true;
            micBtn.classList.add('recording');
            voiceStatus.textContent = '🎙️ ' + languages[lang].translating;
            voiceStatus.style.display = 'block';
            
            // Show voice detection active indicator
            const voiceDetectionIndicator = document.getElementById('voice-detection-active');
            if (voiceDetectionIndicator) {
                voiceDetectionIndicator.style.display = 'flex';
            }
        };
        
        recognition.onend = () => {
            isRecognizing = false;
            micBtn.classList.remove('recording');
            voiceStatus.style.display = 'none';
            
            if (transcript.trim()) {
                messageInput.value = transcript;
                transcript = '';
            }
            
            // Hide voice detection active indicator
            const voiceDetectionIndicator = document.getElementById('voice-detection-active');
            if (voiceDetectionIndicator) {
                voiceDetectionIndicator.style.display = 'none';
            }
        };
        
        recognition.onresult = (event) => {
            transcript = '';
            for (let i = event.resultIndex; i < event.results.length; i++) {
                if (event.results[i].isFinal) {
                    transcript = event.results[i][0].transcript;
                    
                    // Check the language of the speech
                    const detectedLang = event.results[i][0].lang.split('-')[0];
                    showDetectedLanguage(detectedLang);
                    
                    // If detected language is different from interface language
                    if (detectedLang !== lang && isAutoTranslateEnabled) {
                        voiceStatus.textContent = '🔄 ' + languages[lang].translating;
                        // Simulate translation (in real app, use translation API)
                        setTimeout(() => {
                            messageInput.value = translateMessage(transcript, detectedLang, lang);
                            transcript = '';
                            sendMessage();
                        }, 1000);
                    } else {
                        messageInput.value = transcript;
                        transcript = '';
                        sendMessage();
                    }
                    
                    recognition.stop();
                    break;
                } else {
                    transcript = event.results[i][0].transcript;
                }
            }
        };
        
        recognition.onerror = (event) => {
            console.error('Speech recognition error', event.error);
            voiceStatus.textContent = languages[lang].error + ': ' + event.error;
            isRecognizing = false;
            micBtn.classList.remove('recording');
            
            setTimeout(() => {
                voiceStatus.style.display = 'none';
            }, 3000);
            
            // Hide voice detection active indicator
            const voiceDetectionIndicator = document.getElementById('voice-detection-active');
            if (voiceDetectionIndicator) {
                voiceDetectionIndicator.style.display = 'none';
            }
        };
    } else {
        micBtn.disabled = true;
        micBtn.title = languages[lang].voiceNotSupported;
    }
}

// Initialize speech synthesis
function setupSpeechSynthesis() {
    // Check if browser supports speech synthesis
    if ('speechSynthesis' in window) {
        // Ready to go
        console.log('Speech synthesis supported');
        
        // Add speak button to toolbar if it doesn't exist
        if (!document.getElementById('speak-btn')) {
            const chatToolbar = document.querySelector('.chat-toolbar');
            if (chatToolbar) {
                const speakBtn = document.createElement('button');
                speakBtn.id = 'speak-btn';
                speakBtn.className = 'toolbar-btn';
                speakBtn.innerHTML = `
                    <i class="fas fa-volume-up"></i>
                    <span class="tooltip">${languages[lang].speakMessages || 'Speak messages'}</span>
                `;
                if (isSpeakEnabled) {
                    speakBtn.classList.add('active');
                }
                speakBtn.addEventListener('click', toggleSpeakMessages);
                chatToolbar.appendChild(speakBtn);
            }
        } else {
            // Update tooltip if button already exists
            const tooltip = document.querySelector('#speak-btn .tooltip');
            if (tooltip) {
                tooltip.textContent = languages[lang].speakMessages || 'Speak messages';
            }
        }
    } else {
        console.warn('Speech synthesis not supported');
    }
}

// Toggle text-to-speech functionality
function toggleSpeakMessages() {
    if (!('speechSynthesis' in window)) return;
    
    const speakBtn = document.getElementById('speak-btn');
    isSpeakEnabled = !isSpeakEnabled;
    localStorage.setItem('speakEnabled', isSpeakEnabled);
    
    if (isSpeakEnabled) {
        speakBtn.classList.add('active');
    } else {
        speakBtn.classList.remove('active');
        window.speechSynthesis.cancel(); // Stop any ongoing speech
    }
    
    // Update feature indicators
    updateFeatureIndicators();
}

// Speak text using the appropriate language
function speakText(text, langCode) {
    if (!('speechSynthesis' in window) || !isSpeakEnabled) return;
    
    // Cancel any ongoing speech
    window.speechSynthesis.cancel();
    
    // Create speech utterance
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Map our language codes to BCP 47 language tags for speech synthesis
    const langMap = {
        'en': 'en-US',
        'es': 'es-ES',
        'fr': 'fr-FR',
        'de': 'de-DE',
        'zh': 'zh-CN',
        'ja': 'ja-JP',
        'hi': 'hi-IN',
        'ru': 'ru-RU',
        'pt': 'pt-BR',
        'tr': 'tr-TR',
        'it': 'it-IT',
        'ar': 'ar-SA',
        'ur': 'ur-PK'
    };
    
    // Set language
    utterance.lang = langMap[langCode] || langCode;
    
    // Adjust speech parameters
    utterance.rate = 1.0; // Normal speed
    utterance.pitch = 1.0; // Normal pitch
    utterance.volume = 1.0; // Full volume
    
    // Speak the text
    window.speechSynthesis.speak(utterance);
}

// Initialize toolbar buttons
function setupToolbarButtons() {
    // Clear chat button
    const clearChatBtn = document.getElementById('clear-chat-btn');
    if (clearChatBtn) {
        clearChatBtn.addEventListener('click', () => {
            // Clear all messages except the welcome message
            while (chatContainer.children.length > 1) {
                chatContainer.removeChild(chatContainer.lastChild);
            }
        });
    }
    
    // Export chat button
    const exportChatBtn = document.getElementById('export-chat-btn');
    if (exportChatBtn) {
        exportChatBtn.addEventListener('click', () => {
            const messages = document.querySelectorAll('.message');
            let chatText = '';
            
            messages.forEach(message => {
                const sender = message.classList.contains('user-message') ? 'User' : 'AI';
                chatText += `${sender}: ${message.textContent}\n\n`;
            });
            
            const blob = new Blob([chatText], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `chat_export_${new Date().toISOString().slice(0, 10)}.txt`;
            a.click();
            URL.revokeObjectURL(url);
        });
    }
    
    // Auto translate button
    const autoTranslateBtn = document.getElementById('auto-translate-btn');
    if (autoTranslateBtn) {
        // Set initial state
        if (isAutoTranslateEnabled) {
            autoTranslateBtn.classList.add('active');
        }
        
        autoTranslateBtn.addEventListener('click', () => {
            isAutoTranslateEnabled = !isAutoTranslateEnabled;
            localStorage.setItem('autoTranslate', isAutoTranslateEnabled);
            
            if (isAutoTranslateEnabled) {
                autoTranslateBtn.classList.add('active');
            } else {
                autoTranslateBtn.classList.remove('active');
            }
            
            // Update feature indicators
            updateFeatureIndicators();
        });
    }
    
    // Update feature indicators based on speak status
    updateFeatureIndicators();
}

// Update feature indicators
function updateFeatureIndicators() {
    const translationActiveIndicator = document.getElementById('translation-active');
    if (translationActiveIndicator) {
        if (isAutoTranslateEnabled) {
            translationActiveIndicator.style.display = 'flex';
            translationActiveIndicator.querySelector('span').textContent = 
                lang === 'en' ? 'Auto-translation active' : 
                lang === 'ar' ? 'الترجمة التلقائية نشطة' : 
                lang === 'ur' ? 'آٹو ٹرانسلیشن فعال ہے' : 'Auto-translation active';
        } else {
            translationActiveIndicator.style.display = 'none';
        }
    }
    
    // Update speak indicator
    const speakActiveIndicator = document.getElementById('speak-active');
    if (speakActiveIndicator) {
        if (isSpeakEnabled) {
            speakActiveIndicator.style.display = 'flex';
            speakActiveIndicator.querySelector('span').textContent = languages[lang].textToSpeechActive || 'Text-to-speech active';
        } else {
            speakActiveIndicator.style.display = 'none';
        }
    } else if (isSpeakEnabled) {
        // Create indicator if it doesn't exist
        const featureIndicators = document.querySelector('.feature-indicators');
        if (featureIndicators) {
            const indicator = document.createElement('div');
            indicator.id = 'speak-active';
            indicator.className = 'feature-indicator';
            indicator.innerHTML = `
                <i class="fas fa-volume-up"></i>
                <span>${languages[lang].textToSpeechActive || 'Text-to-speech active'}</span>
            `;
            featureIndicators.appendChild(indicator);
        }
    }
}

// Toggle voice input
function toggleVoiceInput() {
    if (!recognition) return;
    
    if (isRecognizing) {
        recognition.stop();
    } else {
        messageInput.value = '';
        transcript = '';
        recognition.lang = lang;
        recognition.start();
    }
}

// Show detected language notification
function showDetectedLanguage(detectedLang) {
    // Get the language name for display
    const langNames = {
        en: 'English',
        ur: 'Urdu',
        ar: 'Arabic',
        zh: 'Chinese',
        ja: 'Japanese',
        hi: 'Hindi',
        ru: 'Russian',
        pt: 'Portuguese',
        tr: 'Turkish',
        it: 'Italian',
        es: 'Spanish',
        fr: 'French',
        de: 'German'
    };
    
    const langName = langNames[detectedLang] || detectedLang;
    
    // Create and show the notification
    voiceDetected.textContent = `${languages[lang].detected}: ${langName}`;
    voiceDetected.classList.add('show');
    
    // Clear any existing timers
    clearTimeout(timer);
    
    // Set a timer to hide the notification
    timer = setTimeout(() => {
        voiceDetected.classList.remove('show');
    }, 3000);
}

// Send message
function sendMessage() {
    const message = messageInput.value.trim();
    
    if (message) {
        // Create user message
        createMessage(message, 'user');
        
        // Clear input
        messageInput.value = '';
        
        // Simulate bot response (In a real app, this would call an API)
        setTimeout(() => {
            const botResponse = `${languages[lang].welcome}`;
            createMessage(botResponse, 'bot');
        }, 1000);
    }
}

// Create message element
function createMessage(text, sender) {
    const messageElement = document.createElement('div');
    messageElement.className = `message ${sender}-message`;
    messageElement.textContent = text;
    
    // Add translation prefix if it's a translated message
    if (text.startsWith(languages[lang].translatedPrefix)) {
        messageElement.classList.add('translated-message');
    }
    
    // Add speak button to messages if speech synthesis is enabled
    if ('speechSynthesis' in window) {
        const speakMessageBtn = document.createElement('button');
        speakMessageBtn.className = 'speak-message-btn';
        speakMessageBtn.innerHTML = '<i class="fas fa-volume-up"></i>';
        speakMessageBtn.title = languages[lang].speakText || 'Speak this text';
        speakMessageBtn.addEventListener('click', function() {
            // Add speaking visual feedback
            this.classList.add('speaking');
            messageElement.classList.add('speaking');
            
            // Speak the text
            speakText(text, lang);
            
            // Remove speaking classes after speech completes
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.onend = () => {
                speakMessageBtn.classList.remove('speaking');
                messageElement.classList.remove('speaking');
            };
            
            // Fallback in case the end event doesn't fire
            setTimeout(() => {
                speakMessageBtn.classList.remove('speaking');
                messageElement.classList.remove('speaking');
            }, text.length * 90); // Rough estimate of speech duration
        });
        messageElement.appendChild(speakMessageBtn);
    }
    
    chatContainer.appendChild(messageElement);
    chatContainer.scrollTop = chatContainer.scrollHeight;
    
    // Speak bot messages automatically if enabled
    if (sender === 'bot' && isSpeakEnabled) {
        speakText(text, lang);
    }
}

// Translate all chat messages when language is changed
function translateChatHistory(fromLang, toLang) {
    // Show translation status
    showTranslationStatus(toLang);
    
    // Get all messages
    const messages = document.querySelectorAll('.message');
    
    // Process translation with delay to avoid blocking UI
    setTimeout(() => {
        messages.forEach((message, index) => {
            const isUserMessage = message.classList.contains('user-message');
            const sender = isUserMessage ? 'user' : 'bot';
            
            // Skip welcome message from bot (as it's already in the new language)
            if (!isUserMessage && message.textContent === languages[fromLang].welcome) {
                message.textContent = languages[toLang].welcome;
                return;
            }
            
            // Skip already translated messages
            if (message.textContent.startsWith(languages[fromLang].translatedPrefix)) {
                const originalText = message.textContent.substring(languages[fromLang].translatedPrefix.length);
                message.textContent = languages[toLang].translatedPrefix + originalText;
                return;
            }
            
            // Translate with slight delay for each message for better UX
            setTimeout(() => {
                const translatedText = translateMessage(message.textContent, fromLang, toLang);
                message.textContent = languages[toLang].translatedPrefix + translatedText;
                message.classList.add('translated-message');
                
                // Hide status when done
                if (index === messages.length - 1) {
                    hideTranslationStatus();
                }
            }, index * 100);
        });
    }, 300);
}

// Show translation status for all messages
function showTranslationStatus(toLang) {
    // Create status element if it doesn't exist
    if (!document.getElementById('translation-status')) {
        const statusElement = document.createElement('div');
        statusElement.id = 'translation-status';
        statusElement.className = 'translation-status';
        document.body.appendChild(statusElement);
    }
    
    const statusElement = document.getElementById('translation-status');
    statusElement.textContent = languages[toLang].translatingAll;
    statusElement.classList.add('visible');
}

// Hide translation status
function hideTranslationStatus() {
    const statusElement = document.getElementById('translation-status');
    if (statusElement) {
        statusElement.classList.remove('visible');
        setTimeout(() => {
            statusElement.remove();
        }, 500);
    }
}

// Simulate translation (in a real app, use a translation API)
function translateMessage(text, fromLang, toLang) {
    // For demo, we're just simulating translation
    // In a real app, this would call Google Translate or similar API
    
    // Check if it's the welcome message
    if (text === languages[fromLang].welcome) {
        return languages[toLang].welcome;
    }
    
    // Simulate translation by adding some characters
    // This is just for demo purposes
    return text + ' [→ ' + toLang + ']';
}

// Show modal with content
function showModal(title, content) {
    const modal = document.getElementById('info-modal');
    if (!modal) return;
    
    document.getElementById('modal-title').textContent = title;
    document.getElementById('modal-body').innerHTML = content;
    modal.classList.add('active');
}

// Get about content
function getAboutContent() {
    return `
        <p>AI Assistant is a multilingual chat application that supports 13 languages with automatic language detection and translation capabilities.</p>
        <p>Features include:</p>
        <ul>
            <li>Multiple language support</li>
            <li>Voice input with language detection</li>
            <li>Auto-translation between languages</li>
            <li>Multiple visual themes</li>
            <li>Right-to-left language support</li>
        </ul>
        <p>Version 1.2.0</p>
    `;
}

// Get help content
function getHelpContent() {
    return `
        <h4>Getting Started</h4>
        <p>Just type your message in the input field and press Enter or click the Send button.</p>
        
        <h4>Voice Input</h4>
        <p>Click the microphone icon to use voice input. Speak clearly and the app will detect your language automatically.</p>
        
        <h4>Changing Language</h4>
        <p>Click the language selector in the top right to change the interface language.</p>
        
        <h4>Changing Theme</h4>
        <p>Click the theme selector in the top right to change the visual theme.</p>
        
        <h4>Auto-Translation</h4>
        <p>Enable auto-translation to automatically translate messages between languages.</p>
    `;
}

// Initialize the app when the DOM is loaded
document.addEventListener('DOMContentLoaded', initApp);