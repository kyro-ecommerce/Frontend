// src/pages/Checkout/AddressStep.jsx
import React from "react";
import { CircularProgress } from "@mui/material";
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

const AddressStep = ({
  savedAddresses,
  selectedAddress,
  handleAddressSelect,
  shippingInfo,
  handleShippingChange,
  selectedProvinceId,
  selectedDistrictId,
  selectedWardId,
  handleProvinceChange,
  handleDistrictChange,
  handleWardChange,
  provinces,
  districts,
  wards,
  isLoadingProvinces,
  isLoadingDistricts,
  isLoadingWards,
  handlePrevStep,
  onAddAddressAndContinue,
  handleNextStep,
  isAddingAddress,
  onClearSelectedAddress
}) => {
  const canProceedWithNewAddress = Boolean(
    shippingInfo.fullName &&
    shippingInfo.phone &&
    shippingInfo.address &&
    selectedProvinceId &&
    selectedDistrictId &&
    selectedWardId
  );

  const isButtonEnabled = Boolean(selectedAddress) || canProceedWithNewAddress;

  const handlePrimaryButtonClick = () => {
    if (selectedAddress) {
      handleNextStep();
    } else if (canProceedWithNewAddress) {
      onAddAddressAndContinue();
    }
  };

  const handleInputFocus = () => {
    if (selectedAddress && onClearSelectedAddress) {
      onClearSelectedAddress();
    }
  };

  return (
    <div className="bg-white rounded-3xl p-6 md:p-8 border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* LEFT COLUMN: Saved Addresses */}
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-gray-100">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <span>Chọn địa chỉ đã lưu</span>
            </h2>
            {savedAddresses.length > 0 && (
              <span className="text-xs font-semibold text-gray-400">({savedAddresses.length} địa chỉ)</span>
            )}
          </div>

          {savedAddresses.length > 0 ? (
            <div className="max-h-[440px] overflow-y-auto pr-2 space-y-3.5 custom-scrollbar">
              {savedAddresses.map(address => {
                const isSelected = selectedAddress && selectedAddress.id === address.id;
                return (
                  <div
                    key={address.id}
                    onClick={() => handleAddressSelect(address)}
                    className={`p-4 sm:p-5 rounded-2xl border transition-all duration-200 cursor-pointer relative ${
                      isSelected
                        ? 'border-2 border-blue-600 bg-blue-50/40 shadow-xs ring-2 ring-blue-500/10'
                        : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50/50'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-extrabold text-gray-900 text-sm sm:text-base">{address?.fullName}</h3>
                          {isSelected && <CheckCircleIcon fontSize="small" className="text-blue-600" />}
                        </div>
                        <p className="text-xs font-semibold text-gray-600">{address?.phoneNumber || address?.phone}</p>
                        <p className="text-xs text-gray-600 leading-relaxed pt-0.5">
                          {address?.street}, {address?.ward && `${address.ward}, `}{address?.district && `${address.district}, `}{address?.province}
                        </p>
                      </div>

                      {address.isDefault && (
                        <span className="bg-blue-100 text-blue-700 text-[11px] font-bold px-2.5 py-0.5 rounded-full shrink-0">
                          Mặc định
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-8 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-200">
              <p className="text-xs text-gray-500 font-medium">Bạn chưa có địa chỉ nào được lưu.</p>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: New Address Form */}
        <div className="space-y-4">
          <div className="pb-2 border-b border-gray-100">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <span>Hoặc nhập địa chỉ mới</span>
            </h2>
          </div>

          <form className="space-y-3.5" onSubmit={(e) => e.preventDefault()}>
            <div>
              <label htmlFor="fullName" className="block text-xs font-bold text-gray-700 mb-1">
                Họ và tên *
              </label>
              <input
                type="text"
                id="fullName"
                name="fullName"
                placeholder="Nhập họ và tên người nhận..."
                value={shippingInfo.fullName}
                onChange={(e) => {
                  handleInputFocus();
                  handleShippingChange(e);
                }}
                className="w-full p-3 rounded-2xl border border-gray-200 text-xs sm:text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all bg-white"
                required
              />
            </div>

            <div>
              <label htmlFor="phone" className="block text-xs font-bold text-gray-700 mb-1">
                Số điện thoại *
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                placeholder="Ví dụ: 0912345678"
                value={shippingInfo.phone}
                onChange={(e) => {
                  handleInputFocus();
                  handleShippingChange(e);
                }}
                className="w-full p-3 rounded-2xl border border-gray-200 text-xs sm:text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all bg-white"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label htmlFor="province" className="block text-xs font-bold text-gray-700 mb-1">
                  Tỉnh/Thành phố *
                </label>
                <select
                  id="province"
                  name="province"
                  value={selectedProvinceId}
                  onChange={(e) => {
                    handleInputFocus();
                    handleProvinceChange(e);
                  }}
                  className="w-full p-3 rounded-2xl border border-gray-200 text-xs sm:text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all bg-white"
                  disabled={isLoadingProvinces}
                  required
                >
                  <option value="">{isLoadingProvinces ? 'Đang tải...' : 'Chọn Tỉnh/Thành'}</option>
                  {provinces.map(province => (
                    <option key={province.code} value={province.code}>{province.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="district" className="block text-xs font-bold text-gray-700 mb-1">
                  Quận/Huyện *
                </label>
                <select
                  id="district"
                  name="district"
                  value={selectedDistrictId}
                  onChange={(e) => {
                    handleInputFocus();
                    handleDistrictChange(e);
                  }}
                  className="w-full p-3 rounded-2xl border border-gray-200 text-xs sm:text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all bg-white disabled:bg-gray-50"
                  disabled={!selectedProvinceId || isLoadingDistricts}
                  required
                >
                  <option value="">{isLoadingDistricts ? 'Đang tải...' : 'Chọn Quận/Huyện'}</option>
                  {districts.map(district => (
                    <option key={district.code} value={district.code}>{district.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="ward" className="block text-xs font-bold text-gray-700 mb-1">
                Phường/Xã *
              </label>
              <select
                id="ward"
                name="ward"
                value={selectedWardId}
                onChange={(e) => {
                  handleInputFocus();
                  handleWardChange(e);
                }}
                className="w-full p-3 rounded-2xl border border-gray-200 text-xs sm:text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all bg-white disabled:bg-gray-50"
                disabled={!selectedDistrictId || isLoadingWards}
                required
              >
                <option value="">{isLoadingWards ? 'Đang tải...' : 'Chọn Phường/Xã'}</option>
                {wards.map(ward => (
                  <option key={ward.code} value={ward.code}>{ward.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="address" className="block text-xs font-bold text-gray-700 mb-1">
                Số nhà, tên đường *
              </label>
              <input
                type="text"
                id="address"
                name="address"
                value={shippingInfo.address}
                onChange={(e) => {
                  handleInputFocus();
                  handleShippingChange(e);
                }}
                placeholder="Ví dụ: 123 Nguyễn Huệ"
                className="w-full p-3 rounded-2xl border border-gray-200 text-xs sm:text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all bg-white"
                required
              />
            </div>

            <div>
              <label htmlFor="note" className="block text-xs font-bold text-gray-700 mb-1">
                Ghi chú giao hàng (Tùy chọn)
              </label>
              <textarea
                id="note"
                name="note"
                value={shippingInfo.note}
                onChange={(e) => {
                  handleInputFocus();
                  handleShippingChange(e);
                }}
                placeholder="Lời nhắn cho shipper (ví dụ: giao giờ hành chính)..."
                rows="2"
                className="w-full p-3 rounded-2xl border border-gray-200 text-xs sm:text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all bg-white"
              ></textarea>
            </div>
          </form>
        </div>
      </div>

      {/* FOOTER ACTIONS BAR */}
      <div className="flex flex-col sm:flex-row justify-between items-center mt-8 pt-6 border-t border-gray-100 gap-4">
        <button
          type="button"
          onClick={handlePrevStep}
          className="w-full sm:w-auto px-6 py-3 rounded-2xl border border-gray-200 hover:bg-gray-50 text-gray-700 text-xs font-bold transition-all cursor-pointer"
        >
          ← QUAY LẠI GIỎ HÀNG
        </button>

        <button
          type="button"
          onClick={handlePrimaryButtonClick}
          disabled={!isButtonEnabled || isAddingAddress}
          className="w-full sm:w-auto bg-red-600 hover:bg-red-700 active:scale-[0.99] text-white text-xs sm:text-sm font-bold py-3.5 px-8 rounded-2xl shadow-lg shadow-red-100 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isAddingAddress ? (
            <CircularProgress size={20} color="inherit" />
          ) : (
            <>
              <span>TIẾP TỤC THANH TOÁN</span>
              <span className="text-base">→</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default AddressStep;