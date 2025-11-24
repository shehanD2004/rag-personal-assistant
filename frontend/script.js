const backendUrl = "http://127.0.0.1:8000";

// DOM Elements
let pdfInput, uploadBtn, uploadStatus, questionInput, sendBtn, chatHistory;

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeElements();
    setupEventListeners();
});

function initializeElements() {
    pdfInput = document.getElementById('pdfInput');
    uploadBtn = document.getElementById('uploadBtn');
    uploadStatus = document.getElementById('uploadStatus');
    questionInput = document.getElementById('questionInput');
    sendBtn = document.getElementById('sendBtn');
    chatHistory = document.getElementById('chatHistory');
}

function setupEventListeners() {
    // File upload events
    pdfInput.addEventListener('change', handleFileSelect);
    uploadBtn.addEventListener('click', uploadPDF);
    
    // Chat events
    questionInput.addEventListener('input', handleInputChange);
    questionInput.addEventListener('keypress', handleKeyPress);
    sendBtn.addEventListener('click', askQuestion);
    
    // Drag and drop
    setupDragAndDrop();
}

function setupDragAndDrop() {
    const uploadArea = document.querySelector('.file-upload');
    
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        uploadArea.addEventListener(eventName, preventDefaults, false);
    });
    
    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }
    
    ['dragenter', 'dragover'].forEach(eventName => {
        uploadArea.addEventListener(eventName, () => uploadArea.classList.add('dragover'), false);
    });
    
    ['dragleave', 'drop'].forEach(eventName => {
        uploadArea.addEventListener(eventName, () => uploadArea.classList.remove('dragover'), false);
    });
    
    uploadArea.addEventListener('drop', handleDrop, false);
}

function handleDrop(e) {
    const dt = e.dataTransfer;
    const files = dt.files;
    if (files.length > 0) {
        pdfInput.files = files;
        updateFileInfo();
    }
}

function handleFileSelect() {
    updateFileInfo();
}

function updateFileInfo() {
    const fileInfo = document.getElementById('fileInfo');
    if (pdfInput.files.length > 0) {
        const file = pdfInput.files[0];
        fileInfo.innerHTML = `
            <strong>Selected:</strong> ${file.name}<br>
            <small>Size: ${(file.size / 1024 / 1024).toFixed(2)} MB</small>
        `;
    } else {
        fileInfo.innerHTML = 'No file selected';
    }
}

// Upload PDF
async function uploadPDF() {
    const file = pdfInput.files[0];

    if (!file) {
        showStatus('Please select a PDF file.', 'error');
        return;
    }

    if (!file.type.includes('pdf')) {
        showStatus('Please select a valid PDF file.', 'error');
        return;
    }

    const formData = new FormData();
    formData.append("file", file);

    // Update UI
    uploadBtn.disabled = true;
    uploadBtn.innerHTML = '<span class="loading-dots"><span></span><span></span><span></span></span> Uploading...';
    showStatus('Uploading and processing PDF...', 'info');

    try {
        const response = await fetch(`${backendUrl}/upload`, {
            method: "POST",
            body: formData
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || "Upload failed");
        }

        const data = await response.json();
        showStatus(`✅ PDF processed successfully! ${data.chunks} text chunks indexed.`, 'success');
        
        // Clear file input
        pdfInput.value = '';
        document.getElementById('fileInfo').innerHTML = 'No file selected';
        
    } catch (error) {
        showStatus(`❌ Error: ${error.message}`, 'error');
        console.error("Upload error:", error);
    } finally {
        uploadBtn.disabled = false;
        uploadBtn.innerHTML = '📁 Upload PDF';
    }
}

// Ask Question
async function askQuestion() {
    const question = questionInput.value.trim();

    if (!question) {
        showChatStatus('Please enter a question.', 'error');
        return;
    }

    // Add user message to chat
    addMessageToChat('user', question);
    
    // Clear input and disable send button
    questionInput.value = '';
    sendBtn.disabled = true;
    updateSendButton();

    // Show loading message
    const loadingId = showLoadingMessage();

    try {
        const response = await fetch(`${backendUrl}/ask?q=${encodeURIComponent(question)}`);
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || "Failed to get answer");
        }

        const data = await response.json();
        
        // Remove loading message
        removeLoadingMessage(loadingId);
        
        // Add assistant response
        addMessageToChat('assistant', data.answer);
        
        // Update chat history if needed
        if (data.chat_history) {
            // You could update the sidebar with chat history here
        }

    } catch (error) {
        removeLoadingMessage(loadingId);
        addMessageToChat('error', `Error: ${error.message}`);
        console.error("Ask error:", error);
    } finally {
        sendBtn.disabled = false;
        updateSendButton();
        questionInput.focus();
    }
}

// Chat message functions
function addMessageToChat(type, content) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `chat-message ${type}-message`;
    
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    messageDiv.innerHTML = `
        <div class="message-bubble">
            <div class="message-content">${formatMessageContent(content)}</div>
            <div class="message-time">${time}</div>
        </div>
    `;
    
    chatHistory.appendChild(messageDiv);
    scrollToBottom();
}

function formatMessageContent(content) {
    // Basic formatting - you can enhance this further
    return content
        .replace(/\n/g, '<br>')
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/`(.*?)`/g, '<code>$1</code>');
}

function showLoadingMessage() {
    const loadingId = 'loading-' + Date.now();
    const messageDiv = document.createElement('div');
    messageDiv.className = 'chat-message assistant-message';
    messageDiv.id = loadingId;
    
    messageDiv.innerHTML = `
        <div class="message-bubble">
            <div class="message-content">
                <span class="loading-dots">
                    <span></span><span></span><span></span>
                </span>
            </div>
        </div>
    `;
    
    chatHistory.appendChild(messageDiv);
    scrollToBottom();
    return loadingId;
}

function removeLoadingMessage(loadingId) {
    const loadingElement = document.getElementById(loadingId);
    if (loadingElement) {
        loadingElement.remove();
    }
}

function showChatStatus(message, type) {
    // You could implement a toast notification system here
    alert(message); // Simple alert for now
}

// Utility functions
function showStatus(message, type) {
    uploadStatus.innerHTML = `<div class="status ${type}">${message}</div>`;
}

function handleInputChange() {
    updateSendButton();
}

function handleKeyPress(event) {
    if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        askQuestion();
    }
}

function updateSendButton() {
    const hasText = questionInput.value.trim().length > 0;
    sendBtn.disabled = !hasText;
    
    if (hasText) {
        sendBtn.innerHTML = 'Send ↗';
    } else {
        sendBtn.innerHTML = 'Send';
    }
}

function scrollToBottom() {
    chatHistory.scrollTop = chatHistory.scrollHeight;
}

// Initialize file info on load
document.addEventListener('DOMContentLoaded', updateFileInfo);