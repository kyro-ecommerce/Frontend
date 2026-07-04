import React from "react";
import {Link} from "react-router-dom";

const NotFound = () => {
    return (
        <div
            style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                height: "100vh",
                padding: "20px",
                textAlign: "center",
            }}
        >
            <h1
                style={{
                    fontSize: "72px",
                    marginBottom: "20px",
                    color: "var(--primary-color)",
                }}
            >
                404
            </h1>
            <h2 style={{marginBottom: "20px"}}>Không tìm thấy trang</h2>
            <p style={{marginBottom: "30px", maxWidth: "500px"}}>
                Trang bạn đang tìm kiếm có thể đã bị xóa, đổi tên hoặc tạm thời không
                khả dụng.
            </p>
            <Link
                to="/"
                style={{
                    backgroundColor: "var(--primary-color)",
                    color: "white",
                    padding: "10px 20px",
                    borderRadius: "4px",
                    textDecoration: "none",
                    fontWeight: "500",
                }}
            >
                Quay lại trang chủ
            </Link>
        </div>
    );
};

export default NotFound;
