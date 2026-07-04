import React, { useState, useEffect } from 'react';

// Dữ liệu mẫu cho tỉnh/thành phố
const provincesData = [
  "Hà Nội",
  "TP. Hồ Chí Minh",
  "Đà Nẵng",
  "Hải Phòng",
  "Cần Thơ",
  "An Giang",
  "Bà Rịa - Vũng Tàu",
  "Bắc Giang",
  "Bắc Kạn",
  "Bạc Liêu"
];

// Dữ liệu mẫu cho quận/huyện (tùy thuộc vào tỉnh/thành phố)
const districtsData = {
  "Hà Nội": ["Ba Đình", "Hoàn Kiếm", "Hai Bà Trưng", "Đống Đa", "Tây Hồ", "Cầu Giấy"],
  "TP. Hồ Chí Minh": ["Quận 1", "Quận 2", "Quận 3", "Quận 4", "Quận 5", "Quận 6", "Quận 7", "Quận 8"],
  "Đà Nẵng": ["Hải Châu", "Thanh Khê", "Sơn Trà", "Ngũ Hành Sơn", "Liên Chiểu"],
  // Thêm dữ liệu cho các tỉnh khác
};

// Dữ liệu mẫu cho phường/xã (tùy thuộc vào quận/huyện)
const wardsData = {
  "Quận 1": ["Bến Nghé", "Bến Thành", "Cầu Kho", "Cầu Ông Lãnh", "Đa Kao"],
  "Quận 7": ["Tân Thuận Đông", "Tân Thuận Tây", "Tân Kiểng", "Tân Hưng", "Bình Thuận"],
  "Ba Đình": ["Phúc Xá", "Trúc Bạch", "Vĩnh Phúc", "Cống Vị", "Liễu Giai"],
  // Thêm dữ liệu cho các quận/huyện khác
};

const AddressSelection = ({ onAddressSelect, onProceed }) => {
  // State cho danh sách địa chỉ
  const [addresses, setAddresses] = useState([]);
  // State cho địa chỉ đang được chọn
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  // State hiển thị form thêm địa chỉ mới
  const [showAddForm, setShowAddForm] = useState(false);
  // State cho thông tin địa chỉ mới
  const [newAddress, setNewAddress] = useState({
    fullName: '',
    province: '',
    district: '',
    ward: '',
    streetAddress: '',
    mobile: ''
  });

  // State cho danh sách quận/huyện dựa trên tỉnh/thành phố đã chọn
  const [availableDistricts, setAvailableDistricts] = useState([]);
  // State cho danh sách phường/xã dựa trên quận/huyện đã chọn
  const [availableWards, setAvailableWards] = useState([]);

  // Load danh sách địa chỉ từ localStorage khi component được tạo
  useEffect(() => {
    const savedAddresses = localStorage.getItem('userAddresses');
    if (savedAddresses) {
      const parsedAddresses = JSON.parse(savedAddresses);
      setAddresses(parsedAddresses);
      
      // Nếu có địa chỉ, mặc định chọn địa chỉ đầu tiên
      if (parsedAddresses.length > 0) {
        setSelectedAddressId(parsedAddresses[0].id);
        onAddressSelect(parsedAddresses[0]);
      }
    }
  }, [onAddressSelect]);

  // Cập nhật danh sách quận/huyện khi tỉnh/thành phố thay đổi
  useEffect(() => {
    if (newAddress.province) {
      const districts = districtsData[newAddress.province] || [];
      setAvailableDistricts(districts);
      // Reset quận/huyện và phường/xã khi thay đổi tỉnh/thành phố
      setNewAddress(prev => ({
        ...prev,
        district: '',
        ward: ''
      }));
      setAvailableWards([]);
    }
  }, [newAddress.province]);

  // Cập nhật danh sách phường/xã khi quận/huyện thay đổi
  useEffect(() => {
    if (newAddress.district) {
      const wards = wardsData[newAddress.district] || [];
      setAvailableWards(wards);
      // Reset phường/xã khi thay đổi quận/huyện
      setNewAddress(prev => ({
        ...prev,
        ward: ''
      }));
    }
  }, [newAddress.district]);

  // Xử lý khi người dùng thay đổi thông tin địa chỉ mới
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewAddress({
      ...newAddress,
      [name]: value
    });
  };

  // Xử lý khi người dùng chọn địa chỉ
  const handleAddressSelect = (addressId) => {
    setSelectedAddressId(addressId);
    const selectedAddress = addresses.find(addr => addr.id === addressId);
    if (selectedAddress) {
      onAddressSelect(selectedAddress);
    }
  };

  // Xử lý khi người dùng thêm địa chỉ mới
  const handleAddAddress = () => {
    // Kiểm tra các trường bắt buộc
    if (!newAddress.fullName || !newAddress.province || !newAddress.district || 
        !newAddress.ward || !newAddress.streetAddress || !newAddress.mobile) {
      alert('Vui lòng điền đầy đủ thông tin địa chỉ');
      return;
    }

    // Tạo địa chỉ mới với ID ngẫu nhiên
    const newAddr = {
      ...newAddress,
      id: Date.now().toString()
    };

    // Cập nhật danh sách địa chỉ
    const updatedAddresses = [...addresses, newAddr];
    setAddresses(updatedAddresses);
    
    // Lưu vào localStorage
    localStorage.setItem('userAddresses', JSON.stringify(updatedAddresses));
    
    // Chọn địa chỉ mới thêm
    setSelectedAddressId(newAddr.id);
    onAddressSelect(newAddr);
    
    // Đóng form thêm địa chỉ mới
    setShowAddForm(false);
    
    // Reset form
    setNewAddress({
      fullName: '',
      province: '',
      district: '',
      ward: '',
      streetAddress: '',
      mobile: ''
    });
  };

  // Xử lý khi người dùng chọn giao hàng đến địa chỉ đã chọn
  const handleProceed = () => {
    if (!selectedAddressId) {
      alert('Vui lòng chọn địa chỉ giao hàng');
      return;
    }
    
    const selectedAddress = addresses.find(addr => addr.id === selectedAddressId);
    onProceed(selectedAddress);
  };

  // Component hiển thị thông tin địa chỉ đã chọn
  const SelectedAddressCard = () => {
    const address = addresses.find(addr => addr.id === selectedAddressId);
    
    if (!address) return null;
    
    return (
      <div className="w-full bg-white rounded-lg shadow-md mb-6 overflow-hidden">
        <div className="p-5 bg-white">
          <h2 className="text-xl font-bold mb-4">Address Information</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <p className="text-sm font-medium text-gray-500">Họ tên:</p>
              <p className="text-base">{address.fullName}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Số nhà:</p>
              <p className="text-base">{address.streetAddress}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Phường/Xã:</p>
              <p className="text-base">{address.ward}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Quận/Huyện:</p>
              <p className="text-base">{address.district}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Tỉnh/Thành phố:</p>
              <p className="text-base">{address.province}</p>
            </div>
            <div className="col-span-2">
              <p className="text-sm font-medium text-gray-500">Số điện thoại:</p>
              <p className="text-base">{address.mobile}</p>
            </div>
          </div>
        </div>
        <button 
          className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 transition-colors"
          onClick={handleProceed}
        >
          GIAO HÀNG ĐẾN ĐỊA CHỈ NÀY
        </button>
      </div>
    );
  };

  return (
    <div className="flex flex-col md:flex-row gap-6">
      {/* Cột bên trái: Thông tin địa chỉ đã chọn */}
      <div className="w-full md:w-1/2">
        {selectedAddressId && <SelectedAddressCard />}
        
        {/* Danh sách địa chỉ đã lưu */}
        {addresses.length > 0 && (
          <div className="mb-6">
            <h2 className="text-lg font-medium mb-4">Địa chỉ đã lưu</h2>
            <div className="space-y-3">
              {addresses.map(address => (
                <div 
                  key={address.id} 
                  className={`cursor-pointer p-4 border rounded-md transition-all 
                    ${selectedAddressId === address.id 
                      ? 'border-purple-500 bg-purple-50' 
                      : 'border-gray-200 hover:border-purple-300'
                    }`}
                  onClick={() => handleAddressSelect(address.id)}
                >
                  <div className="flex items-start">
                    <input
                      type="radio"
                      id={`address-${address.id}`}
                      name="address"
                      checked={selectedAddressId === address.id}
                      onChange={() => handleAddressSelect(address.id)}
                      className="mt-1 mr-3"
                    />
                    <div>
                      <div className="font-medium">{address.fullName}</div>
                      <div className="text-sm text-gray-600">
                        {address.streetAddress}, {address.ward}, {address.district}, {address.province}
                      </div>
                      <div className="text-sm text-gray-600">Điện thoại: {address.mobile}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      
      {/* Cột bên phải: Form thêm địa chỉ mới */}
      <div className="w-full md:w-1/2">
        {!showAddForm ? (
          <button 
            className="w-full bg-purple-600 text-white py-3 px-6 rounded-md hover:bg-purple-700 transition-colors mb-6"
            onClick={() => setShowAddForm(true)}
          >
            THÊM ĐỊA CHỈ MỚI
          </button>
        ) : (
          <div className="bg-white p-6 border border-gray-200 rounded-lg mb-6">
            <h2 className="text-xl font-bold mb-4">Thêm địa chỉ mới</h2>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Họ tên *</label>
              <input
                type="text"
                name="fullName"
                value={newAddress.fullName}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded focus:ring-purple-500 focus:border-purple-500"
                required
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Tỉnh/Thành phố *</label>
              <select
                name="province"
                value={newAddress.province}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded focus:ring-purple-500 focus:border-purple-500"
                required
              >
                <option value="">Chọn Tỉnh/Thành phố</option>
                {provincesData.map(province => (
                  <option key={province} value={province}>{province}</option>
                ))}
              </select>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Quận/Huyện *</label>
              <select
                name="district"
                value={newAddress.district}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded focus:ring-purple-500 focus:border-purple-500"
                required
                disabled={!newAddress.province}
              >
                <option value="">Chọn Quận/Huyện</option>
                {availableDistricts.map(district => (
                  <option key={district} value={district}>{district}</option>
                ))}
              </select>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Phường/Xã *</label>
              <select
                name="ward"
                value={newAddress.ward}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded focus:ring-purple-500 focus:border-purple-500"
                required
                disabled={!newAddress.district}
              >
                <option value="">Chọn Phường/Xã</option>
                {availableWards.map(ward => (
                  <option key={ward} value={ward}>{ward}</option>
                ))}
              </select>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Số nhà, tên đường *</label>
              <input
                type="text"
                name="streetAddress"
                value={newAddress.streetAddress}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded focus:ring-purple-500 focus:border-purple-500"
                required
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại *</label>
              <input
                type="text"
                name="mobile"
                value={newAddress.mobile}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded focus:ring-purple-500 focus:border-purple-500"
                required
              />
            </div>
            
            <div className="flex justify-between mt-6">
              <button
                type="button"
                className="bg-gray-200 text-gray-700 py-2 px-6 rounded hover:bg-gray-300 transition-colors"
                onClick={() => setShowAddForm(false)}
              >
                HỦY
              </button>
              <button
                type="button"
                className="bg-purple-600 text-white py-2 px-6 rounded hover:bg-purple-700 transition-colors"
                onClick={handleAddAddress}
              >
                THÊM ĐỊA CHỈ
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AddressSelection;