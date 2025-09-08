document.addEventListener('DOMContentLoaded', function() {
    
    const chatToggle = document.querySelector('#chatbot-toggle');        
    const chatContainer = document.querySelector('#chatbot-container');  
    const closeBtn = document.querySelector('#close-btn');              
    
    const sendBtn = document.querySelector('#send-btn');
    const messageInput = document.querySelector('#message-input');
    const messagesContainer = document.querySelector('#chatbot-messages');
    const typingIndicator = document.querySelector('#typing-indicator');
    
    // Variable to track if chat is open or closed 
    let isChatOpen = false;
    
    // Function to open the chatbot
    function openChat() {
        chatContainer.classList.add('show');
        chatToggle.classList.add('active');
        isChatOpen = true;
        console.log('Chat opened');
    }
    
    function closeChat() {
        chatContainer.classList.remove('show');
        chatToggle.classList.remove('active');
        isChatOpen = false;
        console.log('Chat closed');
    }
    
    function toggleChat() {
        if (isChatOpen) {
            closeChat();
        } else {
            openChat();
        }
    }

    // Function to send message to FastAPI backend
    async function sendMessageToAPI(userMessage) {
        try {
            const response = await fetch('https://jubilant-barnacle-pjpjxp577pq5c6r6v-8000.app.github.dev/ask', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    query: userMessage  
                })
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            // Get response data FastAPI
            const data = await response.json();
            console.log('API Response:', data); 
            
            // Return bot's response
            return data.response || "No response received";
            
        } catch (error) {
            console.error('API Error:', error);
            
            // Handle different types of errors
            if (error.name === 'TypeError' && error.message.includes('fetch')) {
                return "Cannot connect to the server. Please check if your FastAPI is running.";
            } else {
                return "Sorry, something went wrong. Please try again.";
            }
        }
    }

    // Function to add message to chat UI
    function addMessageToChat(message, isUser = false) {
        const messageClass = isUser ? 'user-message' : 'bot-message';
        const avatar = isUser ? '<i class="fas fa-user"></i>' : '<i class="fas fa-brain"></i>';
        
        // Get current time
        const now = new Date();
        const timeString = now.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
        
        const messageHTML = `
            <div class="message ${messageClass}">
                <div class="message-avatar">
                    ${avatar}
                </div>
                <div class="message-content">
                    <div class="message-bubble">
                        ${message}
                    </div>
                    <div class="message-time">${timeString}</div>
                </div>
            </div>
        `;
        
        messagesContainer.insertAdjacentHTML('beforeend', messageHTML);
        
        // Scroll to bottom to show new message
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
    
    // Function to show typing indicator (bot is thinking)
    function showTypingIndicator() {
        if (typingIndicator) {
            typingIndicator.classList.add('show');
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }
    }
    
    // Function to hide typing indicator
    function hideTypingIndicator() {
        if (typingIndicator) {
            typingIndicator.classList.remove('show');
        }
    }
    
    // Main function to handle sending messages
    async function handleSendMessage() {
        const userMessage = messageInput.value.trim();
        
        // Don't send empty messages
        if (!userMessage) {
            return;
        }
        
        // Disable send button to prevent multiple requests
        if (sendBtn) {
            sendBtn.disabled = true;
        }
        
        // Add user message to chat
        addMessageToChat(userMessage, true);
        
        // Clear input field
        messageInput.value = '';
        
        // Show typing indicator (bot is processing)
        showTypingIndicator();
        
        try {
            // Send message to FastAPI and wait for response
            const botResponse = await sendMessageToAPI(userMessage);
            
            // Hide typing indicator
            hideTypingIndicator();
            
            // Add bot response to chat
            addMessageToChat(botResponse, false);
            
        } catch (error) {
            console.error('Error in handleSendMessage:', error);
            hideTypingIndicator();
            addMessageToChat("Error: Could not get response from server.", false);
        } finally {
            // Re-enable send button
            if (sendBtn) {
                sendBtn.disabled = false;
            }
            
            // Focus back to input for next message
            if (messageInput) {
                messageInput.focus();
            }
        }
    }

    // EVENT LISTENERS
    chatToggle.addEventListener('click', toggleChat);
    closeBtn.addEventListener('click', closeChat);
    
    // Send message functionality 
    if (sendBtn) {
        sendBtn.addEventListener('click', handleSendMessage);
    }
    
    // Send message with Enter key
    if (messageInput) {
        messageInput.addEventListener('keypress', function(event) {
            if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault(); 
                handleSendMessage();
            }
        });
    }
    
    // Close chat when clicking outside
    document.addEventListener('click', function(event) {
        const isClickInsideChatbot = event.target.closest('#chatbot');
        if (!isClickInsideChatbot && isChatOpen) {
            closeChat();
        }
    });
    
    // Close chat with Escape key
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape' && isChatOpen) {
            closeChat();
        }
    });
    
    console.log('Chatbot with FastAPI integration loaded successfully!');
});