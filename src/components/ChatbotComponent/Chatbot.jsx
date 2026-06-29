import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useUser } from "../../context/UserContext";
import ProImage from "../../assets/images/Pro.png";
import { 
  ChevronLeft, 
  MessageSquare, 
  Mic, 
  Plus, 
  RotateCcw, 
  Send, 
  ThumbsDown, 
  ThumbsUp, 
  Image as ImageIcon,
  Edit3,
  Paperclip,
  ChevronRight
} from "lucide-react";
import './chat.css';
import ChatBackground from '../../assets/images/chatbot-background.png';

// Suggested prompts for empty state - 6 educational cards
const SUGGESTED_PROMPTS = [
  { id: 1, title: "Come up with concepts", subtitle: "for a retro-style arcade game" },
  { id: 2, title: "Explain why popcorn pops", subtitle: "to a kid who loves to watch it in the microwave" },
  { id: 3, title: "Plan a trip", subtitle: "to see the northern lights in Iceland" },
  { id: 4, title: "Analyze the themes", subtitle: "of the movie 'Interstellar' with a historical context" },
  { id: 5, title: "Explain the process", subtitle: "of cellular respiration to a high-school student" },
  { id: 6, title: "Derive the formula", subtitle: "for projectile motion step-by-step" },
];

// Chat history data
const CHAT_HISTORY = {
  yesterday: [
    { id: 1, title: "Platform Marketplace 101" },
    { id: 2, title: "Give me a proposal for company..." },
    { id: 3, title: "Can you write a short paragraph f..." },
    { id: 4, title: "Research about ui ux" },
  ],
  lastWeek: [
    { id: 5, title: "Platform Marketplace 101" },
    { id: 6, title: "Give me a proposal for company..." },
  ],
  lastMonth: [
    { id: 7, title: "Platform Marketplace 101" },
    { id: 8, title: "Give me a proposal for company..." },
  ],
};

// Default avatar fallback
const DEFAULT_AVATAR = "https://ui-avatars.com/api/?name=User&background=8B5CF6&color=fff";

const Chatbot = () => {
  // State Management
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [typingText, setTypingText] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();
  const { displayName, avatarUrl } = useUser();

  // Typing animation effect for AI responses
  const simulateTypingResponse = (fullText, messageId) => {
    let currentIndex = 0;
    setTypingText("");
    
    const typeNextChar = () => {
      if (currentIndex < fullText.length) {
        setTypingText(fullText.slice(0, currentIndex + 1));
        currentIndex++;
        setTimeout(typeNextChar, 30); // 30ms delay between characters
      } else {
        // Update the actual message when typing is complete
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === messageId ? { ...msg, content: fullText, isTyping: false } : msg
          )
        );
        setTypingText("");
      }
    };
    
    typeNextChar();
  };

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Cleanup object URLs when component unmounts or file changes
  useEffect(() => {
    return () => {
      if (previewUrl && previewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  // Handle send message
  const handleBackClick = () => {
    navigate(-1);
  };

  const handleSendMessage = (text) => {
    if (!text.trim()) return;

    // Add user message
    const userMessage = {
      id: Date.now(),
      content: text,
      sender: "user",
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setInputMessage("");
    setIsLoading(true);

    // Simulate AI response with typing animation
    setTimeout(() => {
      const responseText = "AI can automate tasks, analyze data for decisions, improve accuracy, and operate continuously 24/7. It's revolutionizing industries worldwide.";
      const botMessageId = Date.now() + 1;
      
      const botMessage = {
        id: botMessageId,
        content: "",
        sender: "bot",
        timestamp: new Date(),
        isTyping: true,
      };
      setMessages((prev) => [...prev, botMessage]);
      setIsLoading(false);
      
      simulateTypingResponse(responseText, botMessageId);
    }, 800);
  };

  // Toggle attachment menu
  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  // Handle file upload with validation
  const handleFileUpload = (event) => {
    const file = event.target.files?.[0];
    if (file) {
      // Get the current accept attribute to determine file type
      const acceptAttribute = fileInputRef.current?.accept || "";
      const isImageMode = acceptAttribute === "image/*";
      
      // Validate file type based on upload mode
      if (isImageMode) {
        // Validate that it's actually an image
        if (!file.type.startsWith("image/")) {
          console.warn(`File type mismatch: Expected image file, but got ${file.type}`);
          alert("Please select a valid image file (PNG, JPG, JPEG, GIF, etc.)");
          event.target.value = "";
          return;
        }
      } else {
        // Validate that it's a document/file type, not an image
        const allowedDocTypes = [
          "application/pdf",
          "application/msword",
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          "text/plain",
          "application/zip",
          "application/x-rar-compressed",
          "text/csv",
          "application/vnd.ms-excel",
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        ];
        
        if (file.type.startsWith("image/")) {
          console.warn(`File type mismatch: Expected document file, but got image (${file.type})`);
          alert("Please select a document file (PDF, DOC, TXT, ZIP, CSV, etc.), not an image.");
          event.target.value = "";
          return;
        }
        
        if (!allowedDocTypes.includes(file.type) && !file.name.match(/\.(pdf|doc|docx|txt|zip|rar|csv|xls|xlsx)$/i)) {
          console.warn(`File type not supported: ${file.type}`);
          alert("File type not supported. Please select: PDF, DOC, DOCX, TXT, ZIP, RAR, or CSV.");
          event.target.value = "";
          return;
        }
      }
      
      // File validation passed - log and process
      console.log(`File uploaded: ${file.name}`);
      console.log(`File type: ${file.type}`);
      console.log(`File size: ${(file.size / 1024).toFixed(2)} KB`);
      console.log(`Upload mode: ${isImageMode ? "Photos" : "Files"}`);
      
      // Set the selected file
      setSelectedFile(file);
      
      // Create preview based on file type
      if (isImageMode) {
        // Create object URL for image preview
        const objectUrl = URL.createObjectURL(file);
        setPreviewUrl(objectUrl);
      } else {
        // For documents, we'll just show the file info (no visual preview)
        // but we still set previewUrl to trigger the preview UI
        setPreviewUrl(`document:${file.name}`);
      }
      
      // Close the menu after file selection
      setIsMenuOpen(false);
      // Reset the input so the same file can be uploaded again
      event.target.value = "";
    }
  };

  // Trigger file input for document files only
  const handleUploadFiles = () => {
    if (fileInputRef.current) {
      // Set accept attribute for documents only
      fileInputRef.current.accept = ".pdf,.doc,.docx,.txt,.zip,.rar,.csv,.xls,.xlsx";
      fileInputRef.current.click();
    }
  };

  // Trigger file input for images only
  const handleUploadPhotos = () => {
    if (fileInputRef.current) {
      // Set accept attribute for images only
      fileInputRef.current.accept = "image/*";
      fileInputRef.current.click();
    }
  };

  // Handle removing selected file/preview
  const handleRemoveFile = () => {
    setSelectedFile(null);
    if (previewUrl && previewUrl.startsWith("blob:")) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
  };

  // Handle Google Drive integration
  const handleGoogleDriveClick = () => {
    console.log("Opening Google Drive Picker...");
    // TODO: Implement Google Picker API here
    // For now, this is a placeholder that logs to console
    // Future implementation will use: https://developers.google.com/picker/docs
    setIsMenuOpen(false);
  };

  // Handle prompt click
  const handlePromptClick = (promptText) => {
    handleSendMessage(promptText);
  };

  // Render empty state
  const renderEmptyState = () => (
    <motion.div 
      className="empty-state"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Background Character Image */}
      <div className="chat-background-character" />
      
      {/* Suggested Prompts Grid */}
      <div className="prompts-grid">
        {SUGGESTED_PROMPTS.map((prompt, index) => (
          <motion.button
            key={prompt.id}
            onClick={() => handlePromptClick(`${prompt.title} ${prompt.subtitle}`)}
            className="prompt-card"
            variants={promptCardVariants}
            whileHover={hoverScale}
            layout
          >
            <p className="prompt-title">
              {prompt.title}
            </p>
            <p className="prompt-subtitle">{prompt.subtitle}</p>
          </motion.button>
        ))}
      </div>
    </motion.div>
  );

  // Render active chat
  const renderActiveChat = () => (
    <motion.div 
      className="chat-messages"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {messages.map((message) => (
        <motion.div 
          key={message.id} 
          className="message"
          variants={messageVariants}
          layout
        >
          {message.role === "user" ? (
            // User Message
            <motion.div 
              className="message-user"
              initial={{ opacity: 0, scale: 0.8, x: 50 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              transition={{ type: "spring", damping: 20, stiffness: 100 }}
            >
              <div className="message-content">
                <p>{message.isTyping ? typingText || "..." : message.content}</p>
              </div>
              <motion.button 
                className="edit-btn"
                whileHover={{ scale: 1.1, rotate: 15 }}
                whileTap={{ scale: 0.9 }}
              >
                <Edit3 size={16} />
              </motion.button>
              <motion.img
                src={avatarUrl || DEFAULT_AVATAR}
                alt={displayName || "User"}
                className="user-avatar"
                whileHover={{ scale: 1.1 }}
                transition={{ type: "spring", stiffness: 200 }}
              />
            </motion.div>
          ) : (
            // AI Message
            <motion.div 
              className="message-ai"
              initial={{ opacity: 0, scale: 0.8, x: -50 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              transition={{ type: "spring", damping: 20, stiffness: 100 }}
            >
              <motion.div 
                className="ai-avatar"
                whileHover={{ scale: 1.1, rotate: 10 }}
                transition={{ type: "spring", stiffness: 200 }}
              >
                <span>🤖</span>
              </motion.div>
              <div className="ai-content">
                <motion.div 
                  className="ai-bubble"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1, duration: 0.3 }}
                >
                  {message.content.split("\n\n").map((paragraph, idx) => {
                    if (paragraph.match(/^\d+\./)) {
                      // Numbered list item
                      const [number, ...text] = paragraph.split(" ");
                      const boldText = text.join(" ").split("**");
                      return (
                        <p key={idx}>
                          <strong>{number}</strong>{" "}
                          {boldText.map((part, i) =>
                            i % 2 === 1 ? (
                              <strong key={i}>{part}</strong>
                            ) : (
                              part
                            )
                          )}
                        </p>
                      );
                    }
                    return <p key={idx}>{paragraph}</p>;
                  })}
                </motion.div>
                {/* Feedback buttons */}
                <motion.div 
                  className="feedback-btns"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <motion.button 
                    className="feedback-btn"
                    whileHover={{ scale: 1.2, y: -2 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <ThumbsUp size={18} />
                  </motion.button>
                  <motion.button 
                    className="feedback-btn dislike"
                    whileHover={{ scale: 1.2, y: -2 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <ThumbsDown size={18} />
                  </motion.button>
                </motion.div>
              </div>
            </motion.div>
          )}
        </motion.div>
      ))}

      {/* Action Buttons (only show after AI response) */}
      {messages.length > 0 && messages[messages.length - 1].role === "ai" && (
        <motion.div 
          className="action-btns"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.button 
            className="action-btn"
            variants={promptCardVariants}
            whileHover={hoverScale}
            whileTap={{ scale: 0.95 }}
          >
            <RotateCcw size={14} style={{ color: "#8b5cf6" }} />
            Regenerate response
          </motion.button>
          <motion.button 
            className="action-btn action-btn-primary"
            variants={promptCardVariants}
            whileHover={hoverScale}
            whileTap={{ scale: 0.95 }}
          >
            Make Response Shorter
          </motion.button>
          <motion.button 
            className="action-btn action-btn-secondary"
            variants={promptCardVariants}
            whileHover={hoverScale}
            whileTap={{ scale: 0.95 }}
          >
            Explain it to me like a lawyer
          </motion.button>
          <motion.button 
            className="action-btn action-btn-accent"
            variants={promptCardVariants}
            whileHover={hoverScale}
            whileTap={{ scale: 0.95 }}
          >
            Tell me about more
          </motion.button>
        </motion.div>
      )}

      {/* Loading indicator */}
      {isLoading && (
        <motion.div 
          className="loading-indicator"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", damping: 20 }}
        >
          <div className="ai-avatar">
            <span>🤖</span>
          </div>
          <div className="loading-dots">
            <span className="loading-dot" style={{ animationDelay: "0ms" }} />
            <span className="loading-dot" style={{ animationDelay: "150ms" }} />
            <span className="loading-dot" style={{ animationDelay: "300ms" }} />
          </div>
        </motion.div>
      )}

      <div ref={messagesEndRef} />
    </motion.div>
  );

  // Premium Animation Variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.15,
        delayChildren: 0.1
      }
    }
  };

  const sidebarVariants = {
    hidden: { opacity: 0, x: -100 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: { 
        type: "spring",
        damping: 20,
        stiffness: 100,
        mass: 1
      }
    }
  };

  const mainContentVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        type: "spring",
        damping: 25,
        stiffness: 120,
        delay: 0.2
      }
    }
  };

  const promptCardVariants = {
    hidden: { opacity: 0, scale: 0.8, y: 20 },
    visible: { 
      opacity: 1, 
      scale: 1,
      y: 0,
      transition: { 
        type: "spring",
        damping: 15,
        stiffness: 200
      }
    }
  };

  const messageVariants = {
    hidden: { opacity: 0, scale: 0.9, y: 10 },
    visible: { 
      opacity: 1, 
      scale: 1,
      y: 0,
      transition: { 
        type: "spring",
        damping: 20,
        stiffness: 150
      }
    }
  };

  const hoverScale = {
    scale: 1.02,
    y: -5,
    transition: { 
      type: "spring",
      damping: 15,
      stiffness: 300
    }
  };

  return (
    <motion.div 
      className="chatbot-wrapper"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      {/* Sidebar */}
      <motion.aside 
        className="sidebar"
        variants={sidebarVariants}
      >
        {/* Header */}
        <div className="sidebar-header">
          <button className="back-btn" onClick={handleBackClick}>
            <ChevronLeft size={20} strokeWidth={1.5} />
          </button>
          <button 
            onClick={() => setMessages([])}
            className="sidebar-btn"
          >
            <Plus size={20} strokeWidth={1.5} />
            New Chat
          </button>
        </div>

        {/* Chat History - Scrollable */}
        <div className="sidebar-history">
          {/* Yesterday */}
          <div className="history-group">
            <h4 className="history-title">Yesterday</h4>
            <div className="history-list">
              {CHAT_HISTORY.yesterday.map((chat) => (
                <button
                  key={chat.id}
                  className="history-item"
                >
                  <MessageSquare size={16} strokeWidth={1.5} className="history-icon" />
                  <span>{chat.title}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Last Week */}
          <div className="history-group">
            <h4 className="history-title">Last Week</h4>
            <div className="history-list">
              {CHAT_HISTORY.lastWeek.map((chat) => (
                <button
                  key={chat.id}
                  className="history-item"
                >
                  <MessageSquare size={16} strokeWidth={1.5} className="history-icon" />
                  <span>{chat.title}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Last Month */}
          <div className="history-group">
            <h4 className="history-title">Last Month</h4>
            <div className="history-list">
              {CHAT_HISTORY.lastMonth.map((chat) => (
                <button
                  key={chat.id}
                  className="history-item"
                >
                  <MessageSquare size={16} strokeWidth={1.5} className="history-icon" />
                  <span>{chat.title}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Pro Upgrade Section - Pushed to bottom */}
        <div className="upgrade-card-image">
          <img 
            src={ProImage} 
            alt="Upgrade to Pro" 
            className="pro-image" 
          />
        </div>

        {/* User Profile - Fixed at bottom */}
        <div className="user-profile">
          <img
            src={avatarUrl || DEFAULT_AVATAR}
            alt={displayName || "User"}
            className="user-avatar"
          />
          <span className="user-name">{displayName || "Guest"}</span>
        </div>
      </motion.aside>

      {/* Main Chat Area */}
      <motion.main 
        className="chat-main"
        variants={mainContentVariants}
      >
        {/* Chat Content */}
        {messages.length === 0 ? renderEmptyState() : renderActiveChat()}

        {/* Fixed Input Area with Attachment Menu */}
        <div className="input-area">
          {/* Attachment Menu */}
          {isMenuOpen && (
            <motion.div 
              className="attachment-menu"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
            >
              <button className="attachment-item" onClick={handleUploadFiles}>
                <Paperclip size={16} strokeWidth={1.5} />
                <span>Upload files</span>
              </button>
              <button className="attachment-item" onClick={handleGoogleDriveClick}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M12 19l7-7 3 3-7 7-3-3z" />
                  <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z" />
                  <path d="M2 2l7.586 7.586" />
                  <circle cx="11" cy="11" r="2" />
                </svg>
                <span>Add from Drive</span>
              </button>
              <button className="attachment-item" onClick={handleUploadPhotos}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <polyline points="21 15 16 10 5 21" />
                </svg>
                <span>Photos</span>
              </button>
            </motion.div>
          )}

          {/* Input Container */}
          <div className="input-wrapper">
            {/* File Preview Section */}
            {selectedFile && previewUrl && (
              <motion.div
                className="file-preview-container"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ type: "spring", damping: 20 }}
              >
                {previewUrl.startsWith("blob:") ? (
                  // Image Preview
                  <div className="preview-item">
                    <motion.img
                      src={previewUrl}
                      alt="Preview"
                      className="preview-image"
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ type: "spring", damping: 20 }}
                    />
                    <motion.button
                      onClick={handleRemoveFile}
                      className="preview-remove-btn"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      title="Remove file"
                    >
                      ✕
                    </motion.button>
                  </div>
                ) : (
                  // Document Preview
                  <div className="preview-item document-preview">
                    <div className="document-icon">
                      <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" />
                        <polyline points="13 2 13 9 20 9" />
                      </svg>
                    </div>
                    <div className="document-info">
                      <p className="document-name">{selectedFile.name}</p>
                      <p className="document-size">
                        {(selectedFile.size / 1024).toFixed(2)} KB
                      </p>
                    </div>
                    <motion.button
                      onClick={handleRemoveFile}
                      className="preview-remove-btn"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      title="Remove file"
                    >
                      ✕
                    </motion.button>
                  </div>
                )}
              </motion.div>
            )}

            {/* Input Container */}
            <div className="input-container">
              <button className="input-attach-btn" onClick={toggleMenu}>
                <Paperclip size={20} strokeWidth={1.5} />
              </button>
              <textarea
                value={inputMessage}
                onChange={(e) => {
                  setInputMessage(e.target.value);
                  e.target.style.height = 'auto';
                  e.target.style.height = Math.min(e.target.scrollHeight, 200) + 'px';
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage(inputMessage);
                  }
                }}
                placeholder="Ask anything..."
                className="chat-input"
                rows={1}
              />
              <div className="input-actions">
                <button className="input-mic-btn">
                  <Mic size={20} strokeWidth={1.5} />
                </button>
                <button
                  onClick={() => handleSendMessage(inputMessage)}
                  disabled={!inputMessage.trim() || isLoading}
                  className="input-send-btn"
                >
                  <Send size={18} strokeWidth={1.5} />
                </button>
              </div>
            </div>
            {/* Slogan with spacing */}
            <p className="input-slogan">AI Genda is an AI Productivity Assistant</p>
          </div>
        </div>

        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileUpload}
          style={{ display: "none" }}
          accept=""
        />
      </motion.main>
    </motion.div>
  );
};

export default Chatbot;
