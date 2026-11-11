import React from "react";

export default function RecommendationStatus({ status, hasData = false }) {
  if (status === "success" || status === "idle") return null;
  let message = "Đang tải gợi ý sản phẩm…";
  if (status === "reconnecting") message = "Dịch vụ gợi ý tạm thời gián đoạn. Hệ thống sẽ tự kết nối lại, bạn không cần tải lại trang.";
  if (status === "error") message = "Chưa thể tải gợi ý. Vui lòng kiểm tra phiên đăng nhập hoặc liên hệ hỗ trợ nếu lỗi tiếp diễn.";
  if (hasData) message += " Đang hiển thị kết quả trước đó; giá và tồn kho chưa được cập nhật lại.";
  return <p role="status" className="px-4 py-3 text-sm text-gray-600">{message}</p>;
}
