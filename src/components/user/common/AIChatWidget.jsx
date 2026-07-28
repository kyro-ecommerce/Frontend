import React, { useState, useRef, useEffect } from "react";
import { aiService } from "../../../services/user/ai.service";

export const AIChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      sender: "bot",
      text: "Xin chào! Tôi là Trợ lý AI Tư vấn Mua sắm Kyro. Bạn cần tìm sản phẩm hay tư vấn thiết bị công nghệ nào?",
      recommendedProducts: [],
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

    // Append user message
    const newMessages = [...messages, { sender: "user", text }];
    setMessages(newMessages);
    if (!textToSend) setInputValue("");
    setLoading(true);

    try {
      const data = await aiService.chat(text);
      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: data.reply || "Xin lỗi, hiện tại tôi chưa tìm thấy phản hồi phù hợp.",
          recommendedProducts: data.recommended_products || [],
        },
      ]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: "Rất tiếc, hệ thống AI đang bận. Vui lòng thử lại sau!",
          recommendedProducts: [],
        },
      ]);
    } finally {
      setLoading(false);
    }
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
                key={index}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: msg.sender === "user" ? "flex-end" : "flex-start",
                  marginBottom: "12px",
                }}
              >
                <div
                  style={{
                    maxWidth: "80%",
                    padding: "10px 14px",
                    borderRadius: msg.sender === "user" ? "16px 16px 2px 16px" : "16px 16px 16px 2px",
                    backgroundColor: msg.sender === "user" ? "#2563eb" : "#ffffff",
                    color: msg.sender === "user" ? "#ffffff" : "#1f2937",
                    fontSize: "14px",
                    lineHeight: "1.4",
                    boxShadow: "0 2px 5px rgba(0,0,0,0.05)",
                    whiteSpace: "pre-line",
                  }}
                >
                  {msg.text}
                </div>

                {/* Render Recommended Products if available */}
                {msg.recommendedProducts && msg.recommendedProducts.length > 0 && (
                  <div style={{ width: "100%", marginTop: "8px", display: "flex", flexDirection: "column", gap: "8px" }}>
                    <span style={{ fontSize: "12px", fontWeight: "600", color: "#4b5563" }}>✨ Sản phẩm AI gợi ý phù hợp:</span>
                    {msg.recommendedProducts.map((prod) => (
                      <a
                        key={prod.product_id}
                        href={`/product/${prod.product_id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          padding: "8px 10px",
                          backgroundColor: "#ffffff",
                          borderRadius: "10px",
                          border: "1px solid #e5e7eb",
                          display: "flex",
                          gap: "10px",
                          alignItems: "center",
                          textDecoration: "none",
                          boxShadow: "0 2px 4px rgba(0,0,0,0.03)",
                          transition: "all 0.2s ease",
                        }}
                      >
                        {prod.image_url && (
                          <img
                            src={prod.image_url}
                            alt={prod.title}
                            style={{ width: "40px", height: "40px", objectFit: "contain", borderRadius: "6px" }}
                          />
                        )}
                        <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
                          <span style={{ fontWeight: "600", color: "#111827", fontSize: "12px", lineHeight: "1.3" }}>
                            {prod.title}
                          </span>
                          {prod.reason && (
                            <span style={{ fontSize: "10px", color: "#7c3aed", fontWeight: "500", marginTop: "2px" }}>
                              💡 {prod.reason}
                            </span>
                          )}
                          <span style={{ color: "#ef4444", fontWeight: "700", fontSize: "12px", marginTop: "2px" }}>
                            {(prod.discounted_price || prod.original_price)?.toLocaleString("vi-VN")} đ
                          </span>
                        </div>
                      </a>
                    ))}
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
