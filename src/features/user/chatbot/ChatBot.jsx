import React, { useState, useEffect, useRef } from "react";
import Cookies from "js-cookie";
import { v4 as uuidv4 } from 'uuid'; // Thư viện để tạo ID duy nhất
import { aiService } from "../../../services/user/ai.service";

const ChatBot = () => {
  const [messages, setMessages] = useState([
    { sender: "bot", content: "Xin chào! Tôi là trợ lý Kyro Store AI. Tôi có thể giúp gì cho bạn?" }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  // --- THAY ĐỔI 1: Lấy hoặc tạo Sender ID cho Rasa ---
  const getSenderId = () => {
    let senderId = Cookies.get('rasa_sender_id');
    if (!senderId) {
      senderId = uuidv4(); // Tạo một ID mới nếu chưa có
      Cookies.set('rasa_sender_id', senderId, { expires: 365 });
    }
    return senderId;
  };

  // --- LOGIC LƯU VÀ TẢI LỊCH SỬ CHAT (GIỮ NGUYÊN) ---
  useEffect(() => {
    const storedMessages = Cookies.get('tech_shop_rasa_chat_history'); 
    if (storedMessages) {
      try {
        const parsedMessages = JSON.parse(storedMessages);
        if (Array.isArray(parsedMessages) && parsedMessages.length > 0) {
            setMessages(parsedMessages);
        } else {
            setMessages([ { sender: "bot", content: "Xin chào! Tôi là trợ lý Kyro Store AI. Tôi có thể giúp gì cho bạn?" }]);
        }
      } catch (error) {
        console.error("Lỗi phân tích lịch sử chat đã lưu:", error);
        setMessages([ { sender: "bot", content: "Xin chào! Tôi là trợ lý Kyro Store AI. Tôi có thể giúp gì cho bạn?" }]);
      }
    }
  }, []);

  useEffect(() => {
    if (messages.length > 0) { 
      Cookies.set('tech_shop_rasa_chat_history', JSON.stringify(messages), { expires: 7 });
    }
  }, [messages]);

  useEffect(() => {
    if (isOpen && messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);


  const sendMessage = async () => {
    if (!inputValue.trim() || isTyping) return;

    const senderId = getSenderId();
    const userMessage = { sender: "user", content: inputValue };
    setMessages(prevMessages => [...prevMessages, userMessage]);
    const messageToSend = inputValue;
    setInputValue("");
    setIsTyping(true);

    try {
      const data = await aiService.chat(messageToSend);
      setIsTyping(false);

      if (data && data.reply) {
        let formattedText = data.reply
          .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-blue-600 font-bold underline hover:text-blue-800 inline-flex items-center gap-1 mx-1">$1 🔗</a>')
          .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
          .replace(/\*(.*?)\*/g, "<em>$1</em>")
          .replace(/\n/g, "<br />");

        setMessages((prevMessages) => [
          ...prevMessages,
          {
            sender: "bot",
            content: formattedText,
            isHTML: true,
            recommendedProducts: data.recommended_products || [],
          },
        ]);
      }
    } catch (error) {
      console.error("Lỗi khi kết nối AI Service:", error);
      setIsTyping(false);
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          sender: "bot",
          content: "Xin lỗi, hệ thống AI đang bận. Vui lòng thử lại sau.",
        },
      ]);
    }
  };

  const handleFeedback = (msgIndex, type, text) => {
    setMessages((prev) =>
      prev.map((msg, idx) => (idx === msgIndex ? { ...msg, feedback: type } : msg))
    );
    aiService.sendFeedback(type, text);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !isTyping) { 
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChatHistory = () => {
    Cookies.remove('tech_shop_rasa_chat_history');
    setMessages([
      { sender: "bot", content: "Xin chào! Tôi là trợ lý Kyro Store AI. Tôi có thể giúp gì cho bạn?" }
    ]);
  };
  
  return (
    <div className="fixed bottom-4 right-4 z-50 font-sans">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-colors duration-300"
        aria-label={isOpen ? "Đóng chat" : "Mở chat"}
      >
        {isOpen ? (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
        )}
      </button>

      {isOpen && (
        <div 
            className="absolute bottom-18 right-0 w-full max-w-sm sm:w-96 h-125 bg-white rounded-lg shadow-xl flex flex-col border border-gray-300 overflow-hidden"
            role="dialog" aria-modal="true" aria-labelledby="chatbox-header"
        >
          <div id="chatbox-header" className="bg-blue-600 text-white p-3 sm:p-4 rounded-t-lg flex justify-between items-center shrink-0">
            <div>
              <h3 className="font-medium text-sm sm:text-base">Kyro Store Trợ Lý AI</h3>
              <p className="text-xs opacity-80">Tư vấn mua sắm thông minh</p>
            </div>
            <button 
              onClick={clearChatHistory}
              className="bg-blue-700 hover:bg-blue-800 text-white text-xs px-2 py-1 rounded focus:outline-none focus:ring-2 focus:ring-white"
              title="Xóa lịch sử trò chuyện"
            >
              Xóa lịch sử
            </button>
          </div>

          <div className="flex-1 p-3 sm:p-4 overflow-y-auto">
            {messages.map((message, index) => (
              <div key={index} className={`mb-3 sm:mb-4 flex flex-col ${message.sender === "user" ? "items-end" : "items-start"}`}>
                <div className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"} w-full`}>
                  {message.sender === "bot" && (
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-blue-100 flex items-center justify-center mr-2 shrink-0">
                       <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" viewBox="0 0 20 20" fill="currentColor"><path d="M10 9a3 3 0 100-6 3 3 0 000 6zM6 8a2 2 0 11-4 0 2 2 0 014 0zM1.49 15.326C1.49 13.845 2.73 13 4.21 13h11.58c1.48 0 2.72 1.157 2.72 2.636 0 1.176-.755 2.158-1.788 2.522-.346.124-.698.182-1.048.182H4.21c-1.48 0-2.72-1.157-2.72-2.636z" /></svg>
                    </div>
                  )}
                  <div className={`p-2.5 sm:p-3 rounded-xl max-w-[85%] wrap-break-word text-sm ${ message.sender === "user" ? "bg-blue-600 text-white rounded-br-none" : "bg-gray-100 text-gray-800 rounded-bl-none shadow-xs"}`}>
                    {message.isHTML ? <div dangerouslySetInnerHTML={{ __html: message.content }} /> : message.content ? <p>{message.content}</p> : null}
                    {message.image && <img src={message.image} alt="Hình ảnh từ bot" className="mt-2 rounded-md max-w-full h-auto" />}
                  </div>
                  {message.sender === "user" && (
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-blue-500 flex items-center justify-center ml-2 shrink-0 text-white">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" /></svg>
                    </div>
                  )}
                </div>

                {/* Feedback Buttons (Thumbs Up / Thumbs Down) for Bot Messages */}
                {message.sender === "bot" && message.content && (
                  <div className="mt-1.5 pl-9 flex items-center gap-2">
                    <span className="text-[11px] text-gray-400 font-medium">Đánh giá:</span>
                    <button
                      onClick={() => handleFeedback(index, "thumbs_up", message.content)}
                      className={`px-2 py-0.5 rounded text-[11px] font-semibold border transition-all flex items-center gap-1 ${
                        message.feedback === "thumbs_up"
                          ? "bg-green-100 border-green-300 text-green-700"
                          : "bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100"
                      }`}
                      title="Câu trả lời hữu ích"
                    >
                      👍 {message.feedback === "thumbs_up" ? "Đã thích" : "Thích"}
                    </button>
                    <button
                      onClick={() => handleFeedback(index, "thumbs_down", message.content)}
                      className={`px-2 py-0.5 rounded text-[11px] font-semibold border transition-all flex items-center gap-1 ${
                        message.feedback === "thumbs_down"
                          ? "bg-red-100 border-red-300 text-red-700"
                          : "bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100"
                      }`}
                      title="Câu trả lời chưa phù hợp"
                    >
                      👎 {message.feedback === "thumbs_down" ? "Đã bỏ qua" : "Chưa tốt"}
                    </button>
                  </div>
                )}

                {/* Render Product Cards for Bot Messages */}
                {message.sender === "bot" && message.recommendedProducts && message.recommendedProducts.length > 0 && (
                  <div className="mt-2.5 pl-9 space-y-2 w-full max-w-[92%]">
                    <span className="text-[11px] font-bold text-gray-600 flex items-center gap-1">
                      ✨ Thẻ sản phẩm gợi ý:
                    </span>
                    {message.recommendedProducts.map((prod) => {
                      const pid = prod.product_id || prod.id;
                      const price = prod.minSalePrice;
                      const priceStr = typeof price === 'number' ? price.toLocaleString('vi-VN') + ' đ' : price;

                      return (
                        <a
                          key={pid}
                          href={`/product/${pid}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-3 p-2.5 bg-white border border-gray-200 rounded-xl hover:border-blue-500 hover:shadow-md transition-all text-decoration-none group"
                        >
                          <img
                            src={prod.image_url || "/Placeholder2.png"}
                            alt={prod.title}
                            onError={(e) => { e.target.onerror = null; e.target.src = "/Placeholder2.png"; }}
                            className="w-11 h-11 object-contain rounded-lg bg-gray-50 p-1 shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <h4 className="text-xs font-bold text-gray-900 group-hover:text-blue-600 truncate">
                              {prod.title}
                            </h4>
                            {prod.reason && (
                              <p className="text-[10px] text-purple-600 font-semibold truncate">
                                ✨ {prod.reason}
                              </p>
                            )}
                            <p className="text-xs font-extrabold text-orange-600 mt-0.5">
                              {priceStr || "Xem chi tiết"}
                            </p>
                          </div>
                          <span className="text-blue-600 font-bold text-sm group-hover:translate-x-0.5 transition-transform">
                            ➔
                          </span>
                        </a>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start mb-3 sm:mb-4">
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-blue-100 flex items-center justify-center mr-2 shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" viewBox="0 0 20 20" fill="currentColor"><path d="M10 9a3 3 0 100-6 3 3 0 000 6zM6 8a2 2 0 11-4 0 2 2 0 014 0zM1.49 15.326C1.49 13.845 2.73 13 4.21 13h11.58c1.48 0 2.72 1.157 2.72 2.636 0 1.176-.755 2.158-1.788 2.522-.346.124-.698.182-1.048.182H4.21c-1.48 0-2.72-1.157-2.72-2.636z" /></svg>
                </div>
                <div className="p-2 sm:p-3 rounded-lg bg-gray-100 text-gray-800 rounded-bl-none">
                  <div className="flex space-x-1">
                    <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-gray-500 animate-bounce" style={{ animationDelay: "0ms" }}></div>
                    <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-gray-500 animate-bounce" style={{ animationDelay: "100ms" }}></div>
                    <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-gray-500 animate-bounce" style={{ animationDelay: "200ms" }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="border-t border-gray-200 p-3 sm:p-4 flex shrink-0">
            <input
              type="text"
              name="chat-input" 
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Nhập tin nhắn..."
              className="flex-1 border border-gray-300 rounded-l-md p-2 text-sm sm:text-base outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              disabled={isTyping} 
              aria-label="Chat input"
            />
            <button 
              onClick={sendMessage}
              className="bg-blue-600 text-white px-3 sm:px-4 rounded-r-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isTyping || !inputValue.trim()} aria-label="Gửi tin nhắn"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatBot;
