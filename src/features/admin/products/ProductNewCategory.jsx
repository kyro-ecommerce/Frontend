"use client";
import React, { useState } from "react";

const FormHeader = ({ title }) => {
  return <h2 className="text-black mb-6 text-xl font-semibold">{title}</h2>;
};

const FormField = ({ label, value, onChange, placeholder, type = "text" }) => {
  return (
    <div className="mb-4">
      <label className="text-black mb-2 text-sm font-semibold block">{label}</label>
      <input
        type={type}
        placeholder={placeholder}
        className="bg-white border border-gray-200 rounded w-full h-10 px-4 text-black outline-none focus:border-blue-500"
        value={value || ""}
        onChange={onChange}
      />
    </div>
  );
};


const ErrorMessage = ({ message, show }) => {
  if (!show) return null;
  return <p className="text-red-500 mb-4 text-xs">{message}</p>;
};


const ParentCategorySelect = ({ value, onChange, categories }) => {
  return (
    <div className="mb-6">
      <label className="text-black mb-2 text-sm font-semibold block">Parent</label>
      <div className="relative">
        <select
          className="bg-white border border-gray-200 rounded w-full h-10 px-4 text-black appearance-none outline-none focus:border-blue-500"
          value={value || ""}
          onChange={onChange}
        >
          <option value="">Chọn parent category</option>
          {categories?.map((category, index) => (
            <option key={index} value={category}>
              {category}
            </option>
          ))}
        </select>
        <div className="absolute top-1/2 right-4 -translate-y-1/2 pointer-events-none text-gray-500">
            <svg className="w-4 h-4 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
        </div>
      </div>
    </div>
  );
};


const ActionButtons = ({ onCancel, onSave }) => {
  return (
    <div className="flex justify-end gap-4 mt-auto pt-4">
      <button className="text-blue-600 bg-white border border-blue-600 rounded py-2 px-6 text-sm font-semibold cursor-pointer hover:bg-blue-50 transition-colors" onClick={onCancel}>
        Hủy
      </button>
      <button className="text-white bg-blue-600 border border-blue-600 rounded py-2 px-6 text-sm font-semibold cursor-pointer hover:bg-blue-700 transition-colors" onClick={onSave}>
        Lưu
      </button>
    </div>
  );
};

function ProductNewCategory({ onSave, onCancel }) {

  const [categoryName, setCategoryName] = useState("");
  const [showError, setShowError] = useState(false);
  const [selectedParent, setSelectedParent] = useState("");
  const [categories, setCategories] = useState([]);


  const handleCategoryNameChange = (event) => {
    setCategoryName(event.target.value);
    if (event.target.value) {
      setShowError(false);
    }
  };


  const handleParentChange = (event) => {
    setSelectedParent(event.target.value);
  };


  const handleCancel = () => {
    // Reset form
    setCategoryName("");
    setSelectedParent("");
    if (onCancel) {
      onCancel();
    }
  };


  const handleSave = () => {
    if (!categoryName.trim()) {
      setShowError(true);
      return;
    }


    const newCategory = {
      id: Date.now().toString(), // ID tạm, sửa lại ở be nha =))
      name: categoryName,
      parent: selectedParent || null
    };

    if (onSave) {
      onSave(newCategory);
    }
    // Chỗ này là backend nó hoạt động sau khi thêm category nên là sửa lại xíu nha
  };

  return (
    <section className="w-full bg-white p-6 flex flex-col h-full">
      <FormHeader title="Thêm danh mục" />

      <FormField
        label="Category Name"
        value={categoryName}
        onChange={handleCategoryNameChange}
        placeholder="Nhập tên danh mục"
      />

      <ErrorMessage
        message="Không được để trống tên"
        show={showError}
      />

      <ParentCategorySelect
        value={selectedParent}
        onChange={handleParentChange}
        categories={categories}
      />

      <ActionButtons
        onCancel={handleCancel}
        onSave={handleSave}
      />
    </section>
  );
}

export default ProductNewCategory;