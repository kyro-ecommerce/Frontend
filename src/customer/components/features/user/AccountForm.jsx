// src/components/features/user/AccountForm.jsx
import React, { useState, useEffect } from "react";
import { useAuthContext } from "../../../contexts/AuthContext";
import { authService } from "../../../services/auth.service";
import { useToast } from "../../../contexts/ToastContext";

const AccountForm = () => {
  const { user: userFromContext, isLoading: authContextLoading, fetchUserProfile, clearAuthError } = useAuthContext();
  const { showToast } = useToast();

  const [formState, setFormState] = useState({
    fullName: "", // Trường duy nhất cho Họ và Tên
    phone: "",
    email: ""
  });

  const [initialData, setInitialData] = useState({
    fullName: "",
    phone: "",
    email: ""
  });
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    // console.log("[AccountForm] userFromContext changed:", userFromContext);
    if (userFromContext) {
      let currentFullName = "";
      if (userFromContext.firstName && userFromContext.lastName && userFromContext.lastName.trim() !== "") {
        currentFullName = `${userFromContext.firstName} ${userFromContext.lastName}`;
      } else if (userFromContext.firstName) {
        currentFullName = userFromContext.firstName; // Nếu lastName rỗng, chỉ dùng firstName
      } else if (userFromContext.fullName) { // Nếu backend có trường fullName riêng
        currentFullName = userFromContext.fullName;
      }
      // Else: currentFullName sẽ là "" nếu không có firstName, lastName, fullName nào

      const data = {
        fullName: currentFullName.trim(),
        phone: userFromContext.mobile || userFromContext.phoneNumber || "",
        email: userFromContext.email || ""
      };
      setFormState(data);
      setInitialData(data);
    } else {
      const defaultForm = { fullName: "", phone: "", email: "" };
      setFormState(defaultForm);
      setInitialData(defaultForm);
    }
  }, [userFromContext]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormState(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const hasChanges = () => {
    return formState.fullName.trim() !== initialData.fullName.trim() ||
           formState.phone.trim() !== initialData.phone.trim();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!hasChanges() || isUpdating || authContextLoading) return;

    clearAuthError();
    setIsUpdating(true);
    try {
      const userDataToSubmit = {
        firstName: formState.fullName.trim(), // Toàn bộ nội dung Họ Tên sẽ là firstName
        lastName: "",                         // lastName sẽ là chuỗi rỗng
        phoneNumber: formState.phone.trim()
      };
      // console.log("Submitting userData to updateProfile:", userDataToSubmit);

      await authService.updateProfile(userDataToSubmit);
      await fetchUserProfile(); // Fetch lại để context cập nhật
      
      // useEffect sẽ tự động cập nhật initialData và formState từ userFromContext mới
      showToast("Cập nhật thông tin thành công!", "success");

    } catch (error) {
      console.error("Lỗi khi cập nhật thông tin:", error);
      const errorMessage = error.response?.data?.message || error.message || "Cập nhật thất bại. Vui lòng thử lại.";
      showToast(errorMessage, "error");
    } finally {
      setIsUpdating(false);
    }
  };

  const formDisabled = authContextLoading || isUpdating;

  // Xác định tên hiển thị cho tiêu đề H1
  const getDisplayNameForTitle = () => {
    if (authContextLoading && !formState.fullName && !initialData.fullName) {
        return "Đang tải...";
    }
    // Ưu tiên formState nếu đang nhập liệu, sau đó là initialData (từ context)
    const nameSource = (formState.fullName && formState.fullName !== initialData.fullName) ? formState : initialData;
    return nameSource.fullName || "Tài khoản của tôi";
  };
  const displayName = getDisplayNameForTitle();

  return (
    <div className="flex-1">
      <h1 className="mb-6 text-2xl sm:text-3xl font-bold text-gray-800">
        {displayName}
      </h1>
      <h2 className="mb-4 text-lg font-bold text-neutral-800">
        Thông tin tài khoản
      </h2>

      {authContextLoading && !userFromContext ? (
         <div className="flex justify-center items-center py-10">
            <p>Đang tải thông tin người dùng...</p>
         </div>
      ) : (
        <form className="pt-6" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Họ Tên (Một trường duy nhất) */}
            <div className="flex flex-col gap-2 md:col-span-1"> {/* Cho Họ Tên chiếm 1 cột trên md */}
              <label
                className="text-base font-medium text-black"
                htmlFor="fullName"
              >
                Họ Tên
              </label>
              <input
                type="text"
                id="fullName"
                name="fullName"
                value={formState.fullName}
                onChange={handleChange}
                className="p-3 w-full rounded border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={formDisabled}
                placeholder="Nhập họ và tên của bạn"
              />
            </div>
            
            {/* Số điện thoại */}
            <div className="flex flex-col gap-2 md:col-span-1"> {/* Cho Số điện thoại chiếm 1 cột trên md */}
              <label className="text-base font-medium text-black" htmlFor="phone">
                Số điện thoại
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formState.phone}
                onChange={handleChange}
                className="p-3 w-full rounded border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Vui lòng nhập số điện thoại"
                disabled={formDisabled}
              />
            </div>

            {/* Email (chiếm cả dòng trên mobile, 2 cột trên md) */}
            <div className="flex flex-col gap-2 md:col-span-2">
              <label className="text-base font-medium text-black" htmlFor="email">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                readOnly
                value={formState.email}
                className="p-3 w-full rounded border border-gray-300 bg-gray-100 cursor-not-allowed"
                disabled={formDisabled}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={formDisabled || !hasChanges()}
            className={`px-6 py-3 mt-8 font-semibold text-white rounded transition-colors duration-150
              ${(formDisabled || !hasChanges())
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
              }`}
          >
            {isUpdating ? "ĐANG LƯU..." : "LƯU THAY ĐỔI"}
          </button>
        </form>
      )}
    </div>
  );
};

export default AccountForm;