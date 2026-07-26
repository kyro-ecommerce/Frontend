// src/components/features/user/AccountForm.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuthContext } from "../../../store/user/AuthContext";
import { authService } from "../../../services/user/auth.service";
import { orderService } from "../../../services/user/order.service";
import { useToast } from "../../../store/user/ToastContext";
import { Dialog, DialogContent, CircularProgress } from "@mui/material";
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';

const API_LOCATION_BASE_URL = "https://provinces.open-api.vn/api";

const AccountForm = () => {
  const { user: userFromContext, isLoading: authContextLoading, fetchUserProfile, clearAuthError } = useAuthContext();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState("profile"); // 'profile' | 'addresses'

  // --- Profile Form State ---
  const [formState, setFormState] = useState({ fullName: "", phone: "", email: "" });
  const [initialData, setInitialData] = useState({ fullName: "", phone: "", email: "" });
  const [isUpdating, setIsUpdating] = useState(false);

  // --- Address Management State ---
  const [addresses, setAddresses] = useState([]);
  const [isLoadingAddresses, setIsLoadingAddresses] = useState(false);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);

  const [addressForm, setAddressForm] = useState({
    fullName: "",
    phone: "",
    address: "",
    province: "",
    district: "",
    ward: "",
    isDefault: false
  });

  const [addressErrors, setAddressErrors] = useState({});

  // Location APIs state
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);
  const [selectedProvinceCode, setSelectedProvinceCode] = useState("");
  const [selectedDistrictCode, setSelectedDistrictCode] = useState("");
  const [selectedWardCode, setSelectedWardCode] = useState("");
  const [isSubmittingAddress, setIsSubmittingAddress] = useState(false);

  // Sync user profile data
  useEffect(() => {
    if (userFromContext) {
      let currentFullName = "";
      if (userFromContext.firstName && userFromContext.lastName && userFromContext.lastName.trim() !== "") {
        currentFullName = `${userFromContext.firstName} ${userFromContext.lastName}`;
      } else if (userFromContext.firstName) {
        currentFullName = userFromContext.firstName;
      } else if (userFromContext.fullName) {
        currentFullName = userFromContext.fullName;
      }

      const data = {
        fullName: currentFullName.trim(),
        phone: userFromContext.mobile || userFromContext.phoneNumber || "",
        email: userFromContext.email || ""
      };
      setFormState(data);
      setInitialData(data);
    }
  }, [userFromContext]);

  // Fetch addresses
  const loadAddresses = async () => {
    setIsLoadingAddresses(true);
    try {
      const response = await orderService.getAddresses();
      const addrList = response?.data?.data || response?.data || [];
      setAddresses(Array.isArray(addrList) ? addrList : []);
    } catch (error) {
      console.error("Error fetching addresses:", error);
    } finally {
      setIsLoadingAddresses(false);
    }
  };

  useEffect(() => {
    if (activeTab === "addresses") {
      loadAddresses();
    }
  }, [activeTab]);

  // Fetch Provinces
  useEffect(() => {
    const fetchProvinces = async () => {
      try {
        const response = await axios.get(`${API_LOCATION_BASE_URL}/p/`);
        setProvinces(response.data || []);
      } catch (error) {
        console.error("Error fetching provinces:", error);
      }
    };
    fetchProvinces();
  }, []);

  // Fetch Districts when province changes
  useEffect(() => {
    if (!selectedProvinceCode) {
      setDistricts([]);
      setSelectedDistrictCode("");
      setWards([]);
      setSelectedWardCode("");
      return;
    }
    const fetchDistricts = async () => {
      try {
        const response = await axios.get(`${API_LOCATION_BASE_URL}/p/${selectedProvinceCode}?depth=2`);
        setDistricts(response.data?.districts || []);
      } catch (error) {
        console.error("Error fetching districts:", error);
      }
    };
    fetchDistricts();
  }, [selectedProvinceCode]);

  // Fetch Wards when district changes
  useEffect(() => {
    if (!selectedDistrictCode) {
      setWards([]);
      setSelectedWardCode("");
      return;
    }
    const fetchWards = async () => {
      try {
        const response = await axios.get(`${API_LOCATION_BASE_URL}/d/${selectedDistrictCode}?depth=2`);
        setWards(response.data?.wards || []);
      } catch (error) {
        console.error("Error fetching wards:", error);
      }
    };
    fetchWards();
  }, [selectedDistrictCode]);

  // Handle Profile Form changes
  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setFormState(prev => ({ ...prev, [name]: value }));
  };

  const hasProfileChanges = () => {
    return formState.fullName.trim() !== initialData.fullName.trim() ||
           formState.phone.trim() !== initialData.phone.trim();
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    if (!hasProfileChanges() || isUpdating || authContextLoading) return;

    clearAuthError();
    setIsUpdating(true);
    try {
      const userDataToSubmit = {
        firstName: formState.fullName.trim(),
        lastName: "",
        phoneNumber: formState.phone.trim()
      };
      await authService.updateProfile(userDataToSubmit);
      await fetchUserProfile();
      showToast("Cập nhật thông tin thành công!", "success");
    } catch (error) {
      console.error("Error updating profile:", error);
      showToast(error.response?.data?.message || error.message || "Cập nhật thất bại.", "error");
    } finally {
      setIsUpdating(false);
    }
  };

  // --- ADDRESS VALIDATION LOGIC ---
  const validateAddressForm = () => {
    const errors = {};
    let isValid = true;

    // Validate Họ tên
    if (!addressForm.fullName || !addressForm.fullName.trim()) {
      errors.fullName = "Vui lòng nhập họ và tên";
      isValid = false;
    } else if (addressForm.fullName.trim().length < 2) {
      errors.fullName = "Họ và tên phải có ít nhất 2 ký tự";
      isValid = false;
    }

    // Validate Số điện thoại (Định dạng SĐT Việt Nam: 10 chữ số bắt đầu bằng 0)
    const phoneRegex = /^(0[3|5|7|8|9])+([0-9]{8})$/;
    if (!addressForm.phone || !addressForm.phone.trim()) {
      errors.phone = "Vui lòng nhập số điện thoại";
      isValid = false;
    } else if (!phoneRegex.test(addressForm.phone.trim())) {
      errors.phone = "Số điện thoại không hợp lệ (ví dụ: 0912345678)";
      isValid = false;
    }

    // Validate Tỉnh/Thành
    const currentProvince = provinces.find(p => String(p.code) === String(selectedProvinceCode))?.name || addressForm.province;
    if (!currentProvince) {
      errors.province = "Vui lòng chọn Tỉnh/Thành phố";
      isValid = false;
    }

    // Validate Quận/Huyện
    const currentDistrict = districts.find(d => String(d.code) === String(selectedDistrictCode))?.name || addressForm.district;
    if (!currentDistrict) {
      errors.district = "Vui lòng chọn Quận/Huyện";
      isValid = false;
    }

    // Validate Phường/Xã
    const currentWard = wards.find(w => String(w.code) === String(selectedWardCode))?.name || addressForm.ward;
    if (!currentWard) {
      errors.ward = "Vui lòng chọn Phường/Xã";
      isValid = false;
    }

    // Validate Số nhà, Tên đường
    if (!addressForm.address || !addressForm.address.trim()) {
      errors.address = "Vui lòng nhập số nhà, tên đường";
      isValid = false;
    } else if (addressForm.address.trim().length < 3) {
      errors.address = "Địa chỉ cụ thể phải từ 3 ký tự trở lên";
      isValid = false;
    }

    setAddressErrors(errors);
    return isValid;
  };

  // Handle Address Modal Open (Add vs Edit)
  const handleOpenAddModal = () => {
    setEditingAddress(null);
    setAddressForm({
      fullName: formState.fullName || "",
      phone: formState.phone || "",
      address: "",
      province: "",
      district: "",
      ward: "",
      isDefault: addresses.length === 0
    });
    setAddressErrors({});
    setSelectedProvinceCode("");
    setSelectedDistrictCode("");
    setSelectedWardCode("");
    setShowAddressModal(true);
  };

  const handleOpenEditModal = (addr) => {
    setEditingAddress(addr);
    setAddressForm({
      fullName: addr.fullName || "",
      phone: addr.phoneNumber || addr.phone || "",
      address: addr.street || addr.address || "",
      province: addr.province || "",
      district: addr.district || "",
      ward: addr.ward || "",
      isDefault: addr.isDefault || false
    });
    setAddressErrors({});
    setShowAddressModal(true);
  };

  const handleSaveAddress = async (e) => {
    e.preventDefault();
    if (!validateAddressForm()) {
      showToast("Vui lòng kiểm tra lại thông tin nhập.", "warning");
      return;
    }

    setIsSubmittingAddress(true);
    try {
      const selectedProvince = provinces.find(p => String(p.code) === String(selectedProvinceCode))?.name || addressForm.province;
      const selectedDistrict = districts.find(d => String(d.code) === String(selectedDistrictCode))?.name || addressForm.district;
      const selectedWard = wards.find(w => String(w.code) === String(selectedWardCode))?.name || addressForm.ward;

      const payload = {
        fullName: addressForm.fullName.trim(),
        phoneNumber: addressForm.phone.trim(),
        street: addressForm.address.trim(),
        city: selectedProvince,
        province: selectedProvince,
        district: selectedDistrict,
        ward: selectedWard,
        isDefault: addressForm.isDefault
      };

      if (editingAddress) {
        await orderService.updateAddress(editingAddress.id, payload);
        showToast("Cập nhật địa chỉ thành công!", "success");
      } else {
        await orderService.addAddress(payload);
        showToast("Thêm địa chỉ mới thành công!", "success");
      }

      setShowAddressModal(false);
      loadAddresses();
    } catch (error) {
      console.error("Error saving address:", error);
      showToast(error.response?.data?.message || error.message || "Không thể lưu địa chỉ.", "error");
    } finally {
      setIsSubmittingAddress(false);
    }
  };

  const handleDeleteAddress = async (addressId) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa địa chỉ này?")) return;

    try {
      await orderService.deleteAddress(addressId);
      showToast("Đã xóa địa chỉ thành công!", "success");
      loadAddresses();
    } catch (error) {
      console.error("Error deleting address:", error);
      showToast(error.response?.data?.message || error.message || "Xóa địa chỉ thất bại.", "error");
    }
  };

  const displayName = initialData.fullName || "Tài khoản của tôi";

  return (
    <div className="flex-1 min-w-0">
      {/* Title */}
      <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-6 tracking-tight">
        {displayName}
      </h1>

      {/* Tabs Switcher */}
      <div className="flex border-b border-gray-200 mb-8">
        <button
          onClick={() => setActiveTab("profile")}
          className={`py-3 px-6 text-sm font-bold border-b-2 transition-all cursor-pointer ${
            activeTab === "profile"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-gray-500 hover:text-gray-800"
          }`}
        >
          Thông tin cá nhân
        </button>
        <button
          onClick={() => setActiveTab("addresses")}
          className={`py-3 px-6 text-sm font-bold border-b-2 transition-all cursor-pointer ${
            activeTab === "addresses"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-gray-500 hover:text-gray-800"
          }`}
        >
          Địa chỉ giao hàng
        </button>
      </div>

      {/* TAB 1: PROFILE FORM */}
      {activeTab === "profile" && (
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
          <h2 className="text-lg font-bold text-gray-900 mb-5">Thông tin tài khoản</h2>

          {authContextLoading && !userFromContext ? (
            <div className="flex justify-center items-center py-10">
              <CircularProgress size={30} />
            </div>
          ) : (
            <form onSubmit={handleProfileSubmit} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5" htmlFor="fullName">
                    Họ và Tên
                  </label>
                  <input
                    type="text"
                    id="fullName"
                    name="fullName"
                    value={formState.fullName}
                    onChange={handleProfileChange}
                    className="w-full p-3 rounded-2xl border border-gray-200 text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                    disabled={authContextLoading || isUpdating}
                    placeholder="Nhập họ và tên..."
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5" htmlFor="phone">
                    Số điện thoại
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formState.phone}
                    onChange={handleProfileChange}
                    className="w-full p-3 rounded-2xl border border-gray-200 text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                    placeholder="Vui lòng nhập số điện thoại"
                    disabled={authContextLoading || isUpdating}
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-gray-700 mb-1.5" htmlFor="email">
                    Địa chỉ Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    readOnly
                    value={formState.email}
                    className="w-full p-3 rounded-2xl border border-gray-200 bg-gray-50 text-gray-500 text-sm font-medium cursor-not-allowed outline-none"
                    disabled
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={authContextLoading || isUpdating || !hasProfileChanges()}
                className={`px-8 py-3.5 rounded-2xl text-sm font-bold text-white transition-all cursor-pointer shadow-md ${
                  authContextLoading || isUpdating || !hasProfileChanges()
                    ? "bg-gray-300 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700 shadow-blue-200 active:scale-[0.99]"
                }`}
              >
                {isUpdating ? "ĐANG LƯU..." : "LƯU THAY ĐỔI"}
              </button>
            </form>
          )}
        </div>
      )}

      {/* TAB 2: ADDRESS MANAGEMENT */}
      {activeTab === "addresses" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900">Sổ địa chỉ của bạn</h2>
            <button
              onClick={handleOpenAddModal}
              className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-2.5 px-4 rounded-2xl transition-all shadow-md shadow-blue-100 cursor-pointer"
            >
              <AddIcon fontSize="small" />
              <span>Thêm địa chỉ mới</span>
            </button>
          </div>

          {isLoadingAddresses ? (
            <div className="flex justify-center items-center py-12 bg-white rounded-3xl border border-gray-100">
              <CircularProgress size={32} />
            </div>
          ) : addresses.length === 0 ? (
            <div className="bg-white rounded-3xl p-10 text-center border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
              <p className="text-gray-500 text-sm mb-4">Bạn chưa lưu địa chỉ nhận hàng nào.</p>
              <button
                onClick={handleOpenAddModal}
                className="bg-blue-50 text-blue-600 font-bold text-xs py-2.5 px-5 rounded-2xl hover:bg-blue-100 transition-colors cursor-pointer"
              >
                + Thêm địa chỉ nhận hàng
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {addresses.map((addr) => (
                <div
                  key={addr.id}
                  className="bg-white rounded-3xl p-5 border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] flex flex-col justify-between relative group hover:border-gray-200 transition-all"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-bold text-gray-900 text-base">{addr.fullName}</h3>
                      {addr.isDefault && (
                        <span className="bg-blue-50 text-blue-700 text-[11px] font-bold px-2.5 py-0.5 rounded-full border border-blue-100">
                          Mặc định
                        </span>
                      )}
                    </div>
                    <p className="text-xs font-semibold text-gray-600 mb-1">{addr.phoneNumber || addr.phone}</p>
                    <p className="text-xs text-gray-600 leading-relaxed mb-3">
                      {addr.street || addr.address}, {addr.ward && `${addr.ward}, `}{addr.district && `${addr.district}, `}{addr.province || addr.city}
                    </p>
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100 text-xs font-semibold">
                    <button
                      onClick={() => handleOpenEditModal(addr)}
                      className="flex items-center gap-1 text-gray-600 hover:text-blue-600 cursor-pointer transition-colors"
                    >
                      <EditOutlinedIcon fontSize="small" />
                      <span>Sửa</span>
                    </button>
                    <button
                      onClick={() => handleDeleteAddress(addr.id)}
                      className="flex items-center gap-1 text-gray-400 hover:text-red-600 cursor-pointer transition-colors"
                    >
                      <DeleteOutlineIcon fontSize="small" />
                      <span>Xóa</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* MODAL THÊM / SỬA ĐỊA CHỈ VOI VALIDATOR */}
      <Dialog
        open={showAddressModal}
        onClose={() => setShowAddressModal(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: { borderRadius: '24px', p: 1 }
        }}
      >
        <DialogContent onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
            <h3 className="text-base font-bold text-gray-900">
              {editingAddress ? "Chỉnh sửa địa chỉ" : "Thêm địa chỉ giao hàng mới"}
            </h3>
            <button
              onClick={() => setShowAddressModal(false)}
              className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 flex items-center justify-center cursor-pointer"
            >
              <CloseIcon fontSize="small" />
            </button>
          </div>

          <form onSubmit={handleSaveAddress} className="space-y-3.5" noValidate>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Họ và tên *</label>
                <input
                  type="text"
                  placeholder="Nhập họ tên..."
                  value={addressForm.fullName}
                  onChange={(e) => {
                    setAddressForm({ ...addressForm, fullName: e.target.value });
                    if (addressErrors.fullName) setAddressErrors(prev => ({ ...prev, fullName: "" }));
                  }}
                  className={`w-full p-2.5 rounded-xl border text-xs font-medium outline-none transition-all ${
                    addressErrors.fullName ? 'border-red-500 bg-red-50/30' : 'border-gray-200 focus:ring-2 focus:ring-blue-500'
                  }`}
                />
                {addressErrors.fullName && (
                  <p className="text-[11px] text-red-500 font-semibold mt-1">{addressErrors.fullName}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Số điện thoại *</label>
                <input
                  type="tel"
                  placeholder="0912345678"
                  value={addressForm.phone}
                  onChange={(e) => {
                    setAddressForm({ ...addressForm, phone: e.target.value });
                    if (addressErrors.phone) setAddressErrors(prev => ({ ...prev, phone: "" }));
                  }}
                  className={`w-full p-2.5 rounded-xl border text-xs font-medium outline-none transition-all ${
                    addressErrors.phone ? 'border-red-500 bg-red-50/30' : 'border-gray-200 focus:ring-2 focus:ring-blue-500'
                  }`}
                />
                {addressErrors.phone && (
                  <p className="text-[11px] text-red-500 font-semibold mt-1">{addressErrors.phone}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Tỉnh/Thành phố *</label>
                <select
                  value={selectedProvinceCode}
                  onChange={(e) => {
                    setSelectedProvinceCode(e.target.value);
                    if (addressErrors.province) setAddressErrors(prev => ({ ...prev, province: "" }));
                  }}
                  className={`w-full p-2.5 rounded-xl border text-xs font-medium bg-white outline-none transition-all ${
                    addressErrors.province ? 'border-red-500 bg-red-50/30' : 'border-gray-200 focus:ring-2 focus:ring-blue-500'
                  }`}
                >
                  <option value="">{addressForm.province || "Chọn Tỉnh/Thành"}</option>
                  {provinces.map(p => (
                    <option key={p.code} value={p.code}>{p.name}</option>
                  ))}
                </select>
                {addressErrors.province && (
                  <p className="text-[11px] text-red-500 font-semibold mt-1">{addressErrors.province}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Quận/Huyện *</label>
                <select
                  value={selectedDistrictCode}
                  onChange={(e) => {
                    setSelectedDistrictCode(e.target.value);
                    if (addressErrors.district) setAddressErrors(prev => ({ ...prev, district: "" }));
                  }}
                  disabled={!selectedProvinceCode && !editingAddress}
                  className={`w-full p-2.5 rounded-xl border text-xs font-medium bg-white outline-none disabled:bg-gray-50 transition-all ${
                    addressErrors.district ? 'border-red-500 bg-red-50/30' : 'border-gray-200 focus:ring-2 focus:ring-blue-500'
                  }`}
                >
                  <option value="">{addressForm.district || "Chọn Quận/Huyện"}</option>
                  {districts.map(d => (
                    <option key={d.code} value={d.code}>{d.name}</option>
                  ))}
                </select>
                {addressErrors.district && (
                  <p className="text-[11px] text-red-500 font-semibold mt-1">{addressErrors.district}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Phường/Xã *</label>
                <select
                  value={selectedWardCode}
                  onChange={(e) => {
                    setSelectedWardCode(e.target.value);
                    if (addressErrors.ward) setAddressErrors(prev => ({ ...prev, ward: "" }));
                  }}
                  disabled={!selectedDistrictCode && !editingAddress}
                  className={`w-full p-2.5 rounded-xl border text-xs font-medium bg-white outline-none disabled:bg-gray-50 transition-all ${
                    addressErrors.ward ? 'border-red-500 bg-red-50/30' : 'border-gray-200 focus:ring-2 focus:ring-blue-500'
                  }`}
                >
                  <option value="">{addressForm.ward || "Chọn Phường/Xã"}</option>
                  {wards.map(w => (
                    <option key={w.code} value={w.code}>{w.name}</option>
                  ))}
                </select>
                {addressErrors.ward && (
                  <p className="text-[11px] text-red-500 font-semibold mt-1">{addressErrors.ward}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Số nhà, Tên đường *</label>
              <input
                type="text"
                placeholder="Ví dụ: 123 Nguyễn Huệ"
                value={addressForm.address}
                onChange={(e) => {
                  setAddressForm({ ...addressForm, address: e.target.value });
                  if (addressErrors.address) setAddressErrors(prev => ({ ...prev, address: "" }));
                }}
                className={`w-full p-2.5 rounded-xl border text-xs font-medium outline-none transition-all ${
                  addressErrors.address ? 'border-red-500 bg-red-50/30' : 'border-gray-200 focus:ring-2 focus:ring-blue-500'
                }`}
              />
              {addressErrors.address && (
                <p className="text-[11px] text-red-500 font-semibold mt-1">{addressErrors.address}</p>
              )}
            </div>

            <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-gray-700 pt-1">
              <input
                type="checkbox"
                checked={addressForm.isDefault}
                onChange={(e) => setAddressForm({ ...addressForm, isDefault: e.target.checked })}
                className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
              />
              <span>Đặt làm địa chỉ giao hàng mặc định</span>
            </label>

            <div className="flex justify-end gap-2 pt-3">
              <button
                type="button"
                onClick={() => setShowAddressModal(false)}
                className="px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-50 cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={isSubmittingAddress}
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-xs font-bold text-white shadow-md shadow-blue-100 cursor-pointer flex items-center justify-center"
              >
                {isSubmittingAddress ? <CircularProgress size={18} color="inherit" /> : "Lưu địa chỉ"}
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AccountForm;