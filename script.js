const API_KEY = '  ';
const API_URL = '  ';

const chatMessages = document.getElementById('chat-messages');
const userInput = document.getElementById('user-input');
const sendButton = document.getElementById('send-button');

let typingIndicator = null;

async function generateResponse(prompt) {
    const response = await fetch(`${API_URL}?key=${API_KEY}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            contents: [
                {
                    parts: [{ text: prompt }]
                }
            ]
        })
    });

    if (!response.ok) {
        throw new Error('Failed to generate response');
    }

    const data = await response.json();
    return data.candidates[0].content.parts[0].text;
}

function cleanMarkdown(text) {
    return text
        .replace(/#{1,6}\s?/g, '')
        .replace(/\*\*/g, '')
        .replace(/\n{3,}/g, '\n\n')
        .trim();
}

function getCurrentTime() {
    const now = new Date();
    let hours = now.getHours();
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    return `${hours}:${minutes} ${ampm}`;
}

function addMessage(message, isUser) {
    const messageElement = document.createElement('div');
    messageElement.classList.add('message', isUser ? 'user-message' : 'bot-message');
    messageElement.style.opacity = '0';
    messageElement.style.transition = 'opacity 0.4s ease-in-out';

    const profileImage = document.createElement('img');
    profileImage.classList.add('profile-image');
    profileImage.src = isUser ? 'user-profile.png' : 'bot-profile.png';
    profileImage.alt = isUser ? 'User' : 'Bot';

    const messageContentWrapper = document.createElement('div');
    messageContentWrapper.classList.add('message-content');

    const text = document.createElement('div');
    text.textContent = message;

    const timestamp = document.createElement('div');
    timestamp.classList.add('timestamp');
    timestamp.textContent = getCurrentTime();

    messageContentWrapper.appendChild(text);
    messageContentWrapper.appendChild(timestamp);

    messageElement.appendChild(profileImage);
    messageElement.appendChild(messageContentWrapper);
    chatMessages.appendChild(messageElement);

    requestAnimationFrame(() => {
        messageElement.style.opacity = '1';
    });

    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function addTypingIndicator() {
    typingIndicator = document.createElement('div');
    typingIndicator.classList.add('message', 'bot-message', 'typing-indicator');

    const profileImage = document.createElement('img');
    profileImage.classList.add('profile-image');
    profileImage.src = 'bot-profile.png';
    profileImage.alt = 'Bot';

    const typingText = document.createElement('div');
    typingText.classList.add('message-content');
    typingText.innerHTML = 'Bot is typing...';

    typingIndicator.appendChild(profileImage);
    typingIndicator.appendChild(typingText);
    chatMessages.appendChild(typingIndicator);

    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function removeTypingIndicator() {
    if (typingIndicator) {
        chatMessages.removeChild(typingIndicator);
        typingIndicator = null;
    }
}

async function handleUserInput() {
    const userMessage = userInput.value.trim();

    if (userMessage) {
        addMessage(userMessage, true);
        userInput.value = '';

        sendButton.disabled = true;
        userInput.disabled = true;

        addTypingIndicator();

        try {
            const botMessage = await generateResponse(userMessage);
            removeTypingIndicator();
            addMessage(cleanMarkdown(botMessage), false);
        } catch (error) {
            console.error('Error:', error);
            removeTypingIndicator();
            addMessage('Sorry, I encountered an error. Please try again.', false);
        } finally {
            sendButton.disabled = false;
            userInput.disabled = false;
            userInput.focus();
        }
    }
}

sendButton.addEventListener('click', handleUserInput);
userInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleUserInput();
    }
});
