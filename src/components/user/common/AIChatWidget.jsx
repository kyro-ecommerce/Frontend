import React, { useState, useRef, useEffect } from "react";
import { aiService } from "../../../services/user/ai.service";

const renderMessageText = (text) => {
  if (!text) return null;
  const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
  const parts = [];
  let lastIndex = 0;
  let match;

  while ((match = linkRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.substring(lastIndex, match.index));
    }
    const linkTitle = match[1];
    const linkUrl = match[2];
    parts.push(
      <a
        key={match.index}
        href={linkUrl}
        target="_blank"
        rel="noopener noreferrer"
        style={{ color: "#2563eb", fontWeight: "700", textDecoration: "underline", margin: "0 2px" }}
      >
        {linkTitle} 🔗
      </a>
    );
    lastIndex = linkRegex.lastIndex;
  }

  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex));
  }

  return parts;
};

export const AIChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: "welcome-1",
      sender: "bot",
      text: "Xin chào! Tôi là Trợ lý AI Tư vấn Mua sắm Kyro. Bạn cần tìm sản phẩm hay tư vấn thiết bị công nghệ nào?",
      recommendedProducts: [],
      isStreaming: false,
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSendMessage = async (textToSend) => {
    const text = textToSend || inputValue;
    if (!text.trim() || loading) return;

    // Append user message and empty bot streaming message
    const botMessageId = Date.now();
    setMessages((prev) => [
      ...prev,
      { id: `user-${botMessageId}`, sender: "user", text },
      { id: botMessageId, sender: "bot", text: "", recommendedProducts: [], isStreaming: true },
    ]);
    if (!textToSend) setInputValue("");
    setLoading(true);

    let hasReceivedChunk = false;

    await aiService.chatStream(
      text,
      (metadata) => {
        setMessages((prev) =>
          prev.map((msg) =>
            String(msg.id) === String(botMessageId)
              ? { ...msg, recommendedProducts: metadata.recommended_products || [] }
              : msg
          )
        );
      },
      (chunk) => {
        hasReceivedChunk = true;
        setMessages((prev) =>
          prev.map((msg) =>
            String(msg.id) === String(botMessageId)
              ? { ...msg, text: msg.text + chunk }
              : msg
          )
        );
      },
      () => {
        setMessages((prev) =>
          prev.map((msg) =>
            String(msg.id) === String(botMessageId)
              ? {
                  ...msg,
                  text: msg.text || "Xin lỗi, hiện tại tôi chưa tìm thấy phản hồi phù hợp.",
                  isStreaming: false,
                }
              : msg
          )
        );
        setLoading(false);
      },
      (error) => {
        setMessages((prev) =>
          prev.map((msg) =>
            String(msg.id) === String(botMessageId)
              ? {
                  ...msg,
                  text: hasReceivedChunk
                    ? msg.text
                    : "Rất tiếc, hệ thống AI đang bận. Vui lòng thử lại sau!",
                  isStreaming: false,
                }
              : msg
          )
        );
        setLoading(false);
      }
    );
  };

  const handleFeedback = (msgId, type, text) => {
    setMessages((prev) =>
      prev.map((msg) => (String(msg.id) === String(msgId) ? { ...msg, feedback: type } : msg))
    );
    aiService.sendFeedback(type, text);
  };


  return (
    <div style={{ position: "fixed", bottom: "24px", right: "24px", zIndex: 9999, fontFamily: "sans-serif" }}>
      {/* Floating Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          style={{
            width: "60px",
            height: "60px",
            borderRadius: "50%",
            backgroundColor: "#2563eb",
            color: "#ffffff",
            border: "none",
            boxShadow: "0 10px 25px rgba(37, 99, 235, 0.4)",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "24px",
            transition: "all 0.3s ease",
          }}
          title="Hỏi Trợ lý AI Kyro"
        >
          💬
        </button>
      )}

      {/* Chat Box Drawer */}
      {isOpen && (
        <div
          style={{
            width: "380px",
            height: "520px",
            backgroundColor: "#ffffff",
            borderRadius: "16px",
            boxShadow: "0 20px 40px rgba(0, 0, 0, 0.15)",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            border: "1px solid #e5e7eb",
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: "16px",
              background: "linear-gradient(135deg, #1e40af, #3b82f6)",
              color: "#ffffff",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <span style={{ fontSize: "22px" }}>🤖</span>
              <div>
                <h4 style={{ margin: 0, fontSize: "16px", fontWeight: "600" }}>Trợ lý AI Kyro</h4>
                <span style={{ fontSize: "12px", opacity: 0.85 }}>Tư vấn sản phẩm thông minh</span>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              style={{
                background: "transparent",
                border: "none",
                color: "#ffffff",
                fontSize: "20px",
                cursor: "pointer",
                padding: "0 4px",
              }}
            >
              ✕
            </button>
          </div>

          {/* Messages Container */}
          <div style={{ flex: 1, padding: "16px", overflowY: "auto", backgroundColor: "#f9fafb" }}>
            {messages.map((msg, index) => (
              <div
                key={msg.id || index}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: msg.sender === "user" ? "flex-end" : "flex-start",
                  marginBottom: "12px",
                }}
              >
                <div
                  style={{
                    maxWidth: "85%",
                    padding: "10px 14px",
                    borderRadius: msg.sender === "user" ? "16px 16px 2px 16px" : "16px 16px 16px 2px",
                    backgroundColor: msg.sender === "user" ? "#2563eb" : "#ffffff",
                    color: msg.sender === "user" ? "#ffffff" : "#1f2937",
                    fontSize: "14px",
                    lineHeight: "1.5",
                    boxShadow: "0 2px 5px rgba(0,0,0,0.05)",
                    whiteSpace: "pre-line",
                  }}
                >
                  {renderMessageText(msg.text)}
                </div>

                {/* Feedback Buttons for Bot Messages */}
                {msg.sender === "bot" && !msg.isStreaming && msg.text && (
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "4px", paddingLeft: "4px" }}>
                    <span style={{ fontSize: "11px", color: "#9ca3af" }}>Đánh giá:</span>
                    <button
                      onClick={() => handleFeedback(msg.id, "thumbs_up", msg.text)}
                      style={{
                        background: msg.feedback === "thumbs_up" ? "#dcfce7" : "#f3f4f6",
                        border: msg.feedback === "thumbs_up" ? "1px solid #86efac" : "1px solid #e5e7eb",
                        borderRadius: "6px",
                        cursor: "pointer",
                        fontSize: "11px",
                        padding: "2px 8px",
                        color: msg.feedback === "thumbs_up" ? "#166534" : "#4b5563",
                        fontWeight: "600",
                        transition: "all 0.2s ease",
                      }}
                      title="Hữu ích"
                    >
                      👍 {msg.feedback === "thumbs_up" ? "Đã thích" : "Thích"}
                    </button>
                    <button
                      onClick={() => handleFeedback(msg.id, "thumbs_down", msg.text)}
                      style={{
                        background: msg.feedback === "thumbs_down" ? "#fee2e2" : "#f3f4f6",
                        border: msg.feedback === "thumbs_down" ? "1px solid #fca5a5" : "1px solid #e5e7eb",
                        borderRadius: "6px",
                        cursor: "pointer",
                        fontSize: "11px",
                        padding: "2px 8px",
                        color: msg.feedback === "thumbs_down" ? "#991b1b" : "#4b5563",
                        fontWeight: "600",
                        transition: "all 0.2s ease",
                      }}
                      title="Chưa hữu ích"
                    >
                      👎 {msg.feedback === "thumbs_down" ? "Đã bỏ qua" : "Chưa tốt"}
                    </button>
                  </div>
                )}

                {/* Render Recommended Products if available */}
                {msg.recommendedProducts && msg.recommendedProducts.length > 0 && (
                  <div style={{ width: "100%", marginTop: "8px", display: "flex", flexDirection: "column", gap: "8px" }}>
                    <span style={{ fontSize: "12px", fontWeight: "700", color: "#4b5563" }}>✨ Sản phẩm tư vấn phù hợp nhất:</span>
                    {msg.recommendedProducts.map((prod) => {
                      const pid = prod.product_id || prod.id;
                      const price = prod.minSalePrice;
                      const priceStr = typeof price === 'number' ? price.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' }) : price;
                      const rating = prod.average_rating ? `${prod.average_rating.toFixed(1)}⭐` : null;

                      return (
                        <a
                          key={pid}
                          href={`/product/${pid}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            padding: "10px 12px",
                            backgroundColor: "#ffffff",
                            borderRadius: "12px",
                            border: "1px solid #e5e7eb",
                            display: "flex",
                            gap: "12px",
                            alignItems: "center",
                            textDecoration: "none",
                            boxShadow: "0 2px 6px rgba(0,0,0,0.04)",
                            transition: "all 0.2s ease",
                          }}
                        >
                          <img
                            src={prod.image_url || "/Placeholder2.png"}
                            alt={prod.title}
                            onError={(e) => { e.target.onerror = null; e.target.src = "/Placeholder2.png"; }}
                            style={{ width: "48px", height: "48px", objectFit: "contain", borderRadius: "8px", backgroundColor: "#f9fafb", padding: "2px" }}
                          />
                          <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                              <span style={{ fontWeight: "700", color: "#111827", fontSize: "13px", lineHeight: "1.3", flex: 1 }}>
                                {prod.title}
                              </span>
                              {rating && (
                                <span style={{ fontSize: "11px", backgroundColor: "#fef3c7", color: "#92400e", padding: "1px 5px", borderRadius: "6px", fontWeight: "700" }}>
                                  {rating}
                                </span>
                              )}
                            </div>
                            {prod.reason && (
                              <span style={{ fontSize: "11px", color: "#7c3aed", fontWeight: "600", marginTop: "2px" }}>
                                ✨ {prod.reason}
                              </span>
                            )}
                            <span style={{ color: "#E05600", fontWeight: "800", fontSize: "13px", marginTop: "2px" }}>
                              {priceStr || "Xem chi tiết"}
                            </span>
                          </div>
                          <span style={{ fontSize: "14px", backgroundColor: "#eff6ff", color: "#2563eb", fontWeight: "bold", padding: "4px 8px", borderRadius: "8px" }}>
                            Xem ➔
                          </span>
                        </a>
                      );
                    })}
                  </div>
                )}


              </div>
            ))}

            {loading && (
              <div style={{ color: "#6b7280", fontSize: "13px", fontStyle: "italic", marginBottom: "8px" }}>
                AI đang tìm câu trả lời tốt nhất...
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Suggestions */}
          <div style={{ padding: "8px 16px", backgroundColor: "#ffffff", borderTop: "1px solid #f3f4f6", display: "flex", gap: "6px", overflowX: "auto" }}>
            <button
              onClick={() => handleSendMessage("Gợi ý laptop học tập dưới 20 triệu")}
              style={{
                fontSize: "12px",
                padding: "4px 10px",
                borderRadius: "12px",
                border: "1px solid #d1d5db",
                backgroundColor: "#f3f4f6",
                cursor: "pointer",
                whiteSpace: "nowrap",
              }}
            >
              💻 Laptop học tập
            </button>
            <button
              onClick={() => handleSendMessage("Tai nghe bluetooth pin trâu")}
              style={{
                fontSize: "12px",
                padding: "4px 10px",
                borderRadius: "12px",
                border: "1px solid #d1d5db",
                backgroundColor: "#f3f4f6",
                cursor: "pointer",
                whiteSpace: "nowrap",
              }}
            >
              🎧 Tai nghe Bluetooth
            </button>
          </div>

          {/* Input Box */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            style={{ padding: "12px", backgroundColor: "#ffffff", borderTop: "1px solid #e5e7eb", display: "flex", gap: "8px" }}
          >
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Nhập câu hỏi tư vấn..."
              style={{
                flex: 1,
                padding: "10px 14px",
                borderRadius: "20px",
                border: "1px solid #d1d5db",
                outline: "none",
                fontSize: "14px",
              }}
            />
            <button
              type="submit"
              disabled={loading || !inputValue.trim()}
              style={{
                padding: "10px 16px",
                borderRadius: "20px",
                backgroundColor: loading || !inputValue.trim() ? "#9ca3af" : "#2563eb",
                color: "#ffffff",
                border: "none",
                cursor: loading || !inputValue.trim() ? "not-allowed" : "pointer",
                fontWeight: "600",
                fontSize: "14px",
              }}
            >
              Gửi
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default AIChatWidget;
