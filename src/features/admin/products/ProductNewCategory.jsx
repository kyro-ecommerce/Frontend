"use client";
import React, { useState } from "react";

const FormHeader = ({ title }) => {
  return <h2 className="text-base font-extrabold text-slate-900 tracking-tight mb-4">{title}</h2>;
};

const FormField = ({ label, value, onChange, placeholder, type = "text" }) => {
  return (
    <div className="mb-4">
      <label className="block mb-1.5 text-xs font-extrabold text-slate-700">{label}</label>
      <input
        type={type}
        placeholder={placeholder}
        className="w-full py-2.5 px-3.5 bg-slate-50 border border-slate-200/80 rounded-xl text-xs font-semibold text-slate-800 outline-none focus:bg-white focus:border-[#1D7461] focus:ring-2 focus:ring-[#1D7461]/20 transition-all"
        value={value || ""}
        onChange={onChange}
      />
    </div>
  );
};


const ErrorMessage = ({ message, show }) => {
  if (!show) return null;
  return <p className="text-red-500 mb-3 text-[11px] font-semibold">{message}</p>;
};


const ParentCategorySelect = ({ value, onChange, categories }) => {
  return (
    <div className="mb-5">
      <label className="block mb-1.5 text-xs font-extrabold text-slate-700">Danh mục cha (Tùy chọn)</label>
      <div className="relative">
        <select
          className="w-full py-2.5 px-3.5 bg-slate-50 border border-slate-200/80 rounded-xl text-xs font-bold text-slate-700 outline-none focus:bg-white focus:border-[#1D7461] transition-all cursor-pointer appearance-none"
          value={value || ""}
          onChange={onChange}
        >
          <option value="">Không chọn (Tạo danh mục gốc)</option>
          {categories?.map((category, index) => (
            <option key={index} value={category}>
              {category}
            </option>
          ))}
        </select>
        <div className="absolute top-1/2 right-3.5 -translate-y-1/2 pointer-events-none text-slate-400 text-[10px]">
            ▼
        </div>
      </div>
    </div>
  );
};


const ActionButtons = ({ onCancel, onSave }) => {
  return (
    <div className="flex justify-end gap-3 mt-auto pt-4 border-t border-slate-100">
      <button className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200/80 text-slate-700 text-xs font-bold transition-all cursor-pointer border border-slate-200/80" onClick={onCancel}>
        Hủy
      </button>
      <button className="px-5 py-2.5 rounded-xl bg-[#1D7461] hover:bg-[#136050] text-white text-xs font-bold transition-all cursor-pointer shadow-sm shadow-[#1D7461]/20 border-none" onClick={onSave}>
        Lưu danh mục
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