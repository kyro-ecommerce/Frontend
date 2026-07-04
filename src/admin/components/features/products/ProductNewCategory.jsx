"use client";
import React, { useState } from "react";
import "../../../styles/admin/product/category-form.css";

const FormHeader = ({ title }) => {
  return <h2 className="form-title">{title}</h2>;
};

const FormField = ({ label, value, onChange, placeholder, type = "text" }) => {
  return (
    <div className="form-group">
      <label className="form-label">{label}</label>
      <input
        type={type}
        placeholder={placeholder}
        className="form-input"
        value={value || ""}
        onChange={onChange}
      />
    </div>
  );
};


const ErrorMessage = ({ message, show }) => {
  if (!show) return null;
  return <p className="error-message">{message}</p>;
};


const ParentCategorySelect = ({ value, onChange, categories }) => {
  return (
    <div className="select-group">
      <label className="form-label">Parent</label>
      <div className="select-wrapper">
        <select
          className="form-select"
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
        <div className="select-icon" />
      </div>
    </div>
  );
};


const ActionButtons = ({ onCancel, onSave }) => {
  return (
    <div className="action-buttons">
      <button className="cancel-button" onClick={onCancel}>
        Hủy
      </button>
      <button className="save-button" onClick={onSave}>
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
    <section className="form-container">
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