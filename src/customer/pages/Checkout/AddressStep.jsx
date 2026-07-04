// src/pages/Checkout/AddressStep.jsx
import React from "react";
import { Button as MuiButton, CircularProgress } from "@mui/material";

const AddressStep = ({
  savedAddresses,
  selectedAddress,
  handleAddressSelect,
  shippingInfo,
  handleShippingChange,
  selectedProvinceId, // This is selectedProvinceCode from Checkout.jsx
  selectedDistrictId, // This is selectedDistrictCode from Checkout.jsx
  selectedWardId,     // This is selectedWardCode from Checkout.jsx
  handleProvinceChange,
  handleDistrictChange,
  handleWardChange,
  provinces, // Array of { code: '01', name: 'Hà Nội', ... }
  districts, // Array of { code: '001', name: 'Ba Đình', ... }
  wards,     // Array of { code: '00001', name: 'Phúc Xá', ... }
  isLoadingProvinces,
  isLoadingDistricts,
  isLoadingWards,
  handlePrevStep,
  onAddAddressAndContinue,
  handleNextStep,
  isAddingAddress
}) => {
  const canProceedWithNewAddress = shippingInfo.fullName && shippingInfo.phone && shippingInfo.address && selectedProvinceId && selectedDistrictId && selectedWardId;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-white p-6 md:p-8 rounded-lg shadow-lg">
      <div>
        <h2 className="text-xl font-bold mb-6 text-gray-800">Chọn địa chỉ đã lưu</h2>
        {savedAddresses.length > 0 ? (
          <div className="max-h-96 overflow-y-auto pr-2 space-y-4 custom-scrollbar">
            {savedAddresses.map(address => (
              <div
                key={address.id}
                className={`p-4 border rounded-md cursor-pointer transition-all duration-150 ease-in-out
                            ${selectedAddress && selectedAddress.id === address.id ? 'border-blue-500 ring-2 ring-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400'}`}
                onClick={() => handleAddressSelect(address)}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium text-gray-700">{address?.fullName}</h3>
                    <p className="text-gray-600 mt-1 text-sm">{address?.phoneNumber}</p>
                    <p className="text-gray-600 text-sm">{address?.street}</p>
                    <p className="text-gray-600 text-sm">{`${address?.ward || ''}, ${address?.district || ''}, ${address?.province || ''}`}</p>
                  </div>
                  {address.isDefault && (
                    <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-0.5 rounded-full">Mặc định</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">Bạn chưa có địa chỉ nào được lưu.</p>
        )}
      </div>

      <div>
        <h2 className="text-xl font-bold mb-6 text-gray-800">Hoặc nhập địa chỉ mới</h2>
        <form className="space-y-4">
          <div>
            <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">Họ và tên *</label>
            <input type="text" id="fullName" name="fullName" value={shippingInfo.fullName} onChange={handleShippingChange} className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" required />
          </div>
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại *</label>
            <input type="tel" id="phone" name="phone" value={shippingInfo.phone} onChange={handleShippingChange} className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" required />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="province" className="block text-sm font-medium text-gray-700 mb-1">Tỉnh/Thành phố *</label>
              <select id="province" name="province" value={selectedProvinceId} onChange={handleProvinceChange} className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white" disabled={isLoadingProvinces} required >
                <option value="">{isLoadingProvinces ? 'Đang tải...' : 'Chọn Tỉnh/Thành'}</option>
                {provinces.map(province => (<option key={province.code} value={province.code}>{province.name}</option>))}
              </select>
            </div>
            <div>
              <label htmlFor="district" className="block text-sm font-medium text-gray-700 mb-1">Quận/Huyện *</label>
              <select id="district" name="district" value={selectedDistrictId} onChange={handleDistrictChange} className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white" disabled={!selectedProvinceId || isLoadingDistricts} required >
                <option value="">{isLoadingDistricts ? 'Đang tải...' : 'Chọn Quận/Huyện'}</option>
                {districts.map(district => (<option key={district.code} value={district.code}>{district.name}</option>))}
              </select>
            </div>
          </div>
          <div>
            <label htmlFor="ward" className="block text-sm font-medium text-gray-700 mb-1">Phường/Xã *</label>
            <select id="ward" name="ward" value={selectedWardId} onChange={handleWardChange} className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white" disabled={!selectedDistrictId || isLoadingWards} required >
              <option value="">{isLoadingWards ? 'Đang tải...' : 'Chọn Phường/Xã'}</option>
              {wards.map(ward => (<option key={ward.code} value={ward.code}>{ward.name}</option>))}
            </select>
          </div>
          <div>
            <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">Số nhà, tên đường *</label>
            <input type="text" id="address" name="address" value={shippingInfo.address} onChange={handleShippingChange} placeholder="Ví dụ: 123 Nguyễn Huệ" className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" required />
          </div>
          <div>
            <label htmlFor="note" className="block text-sm font-medium text-gray-700 mb-1">Ghi chú (Tùy chọn)</label>
            <textarea id="note" name="note" value={shippingInfo.note} onChange={handleShippingChange} rows="2" className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"></textarea>
          </div>
        </form>
      </div>

      <div className="col-span-1 md:col-span-2 flex flex-col sm:flex-row justify-between mt-8 pt-6 border-t border-gray-200">
        <MuiButton variant="outlined" onClick={handlePrevStep} sx={{ mb: { xs: 2, sm: 0 } }}>
          QUAY LẠI GIỎ HÀNG
        </MuiButton>
        <div className="flex flex-col sm:flex-row gap-3">
          <MuiButton
            variant="contained"
            color="secondary"
            onClick={onAddAddressAndContinue}
            disabled={!canProceedWithNewAddress || isAddingAddress}
            sx={{bgcolor: 'rgb(79 70 229)', '&:hover': {bgcolor: 'rgb(67 56 202)'}}}
          >
            {isAddingAddress ? <CircularProgress size={24} color="inherit"/> : "LƯU & SỬ DỤNG ĐỊA CHỈ NÀY"}
          </MuiButton>
          <MuiButton
            variant="contained"
            color="primary"
            onClick={handleNextStep}
            disabled={!selectedAddress}
            sx={{bgcolor: 'rgb(220 38 38)', '&:hover': {bgcolor: 'rgb(185 28 28)'}}}
          >
            TIẾP TỤC VỚI ĐỊA CHỈ ĐÃ CHỌN
          </MuiButton>
        </div>
      </div>
    </div>
  );
};
export default AddressStep;