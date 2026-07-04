// src/components/features/products/ProductFormModal.jsx
import React, { useState, useEffect } from "react";
import "../../../styles/admin/product/product-form.css";
import ProductNewCategory from "./ProductNewCategory";

const ProductFormModal = ({ product, categories, onClose, onSave }) => {
    const isEditing = !!product;
    const [formData, setFormData] = useState({
        id: "",
        title: "",
        description: "",
        price: 0,
        discountedPrice: 0,
        quantity: 0,
        topLevelCategory: "",
        secondLevelCategory: "",
        sizes: [],
        imageUrls: []
    });
    const [imageFiles, setImageFiles] = useState([]);
    const [errors, setErrors] = useState({});
    const [availableSizes, setAvailableSizes] = useState(["S", "M", "L", "XL", "XXL"]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showCategoryForm, setShowCategoryForm] = useState(false);

    // Load product data when editing
    useEffect(() => {
        if (product) {
            setFormData({
                id: product.id || "",
                title: product.title || "",
                description: product.description || "",
                price: product.price || 0,
                discountedPrice: product.discountedPrice || 0,
                quantity: product.quantity || 0,
                topLevelCategory: product.topLevelCategory || "",
                secondLevelCategory: product.category?.name || "",
                sizes: product.sizes || [],
                imageUrls: product.imageUrls || product.images || []
            });
        }
    }, [product]);

    // Debug categories structure
    useEffect(() => {
        console.log('Categories structure:', categories);
    }, [categories]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;

        if ((name === "topLevelCategory" || name === "secondLevelCategory") && value === "add-new") {
            setShowCategoryForm(true);
            return;
        }

        setFormData(prev => ({
            ...prev,
            [name]: name === "price" || name === "discountedPrice" || name === "quantity"
                ? Number(value)
                : value
        }));
    };

    const handleTopCategoryChange = (e) => {
        const value = e.target.value;

        if (value === "add-new") {
            setShowCategoryForm(true);
            return;
        }

        setFormData(prev => ({
            ...prev,
            topLevelCategory: value,
            secondLevelCategory: '' // Reset sub category when main category changes
        }));
    };

    const handleSubCategoryChange = (e) => {
        const value = e.target.value;

        if (value === "add-new") {
            setShowCategoryForm(true);
            return;
        }

        setFormData(prev => ({
            ...prev,
            secondLevelCategory: value
        }));
    };

    const handleSizeToggle = (size) => {
        setFormData(prev => {
            if (prev.sizes.includes(size)) {
                return { ...prev, sizes: prev.sizes.filter(s => s !== size) };
            } else {
                return { ...prev, sizes: [...prev.sizes, size] };
            }
        });
    };

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        setImageFiles(prev => [...prev, ...files]);
    };

    const removeImageFile = (index) => {
        setImageFiles(prev => prev.filter((_, i) => i !== index));
    };

    const removeExistingImage = (index) => {
        setFormData(prev => ({
            ...prev,
            imageUrls: prev.imageUrls.filter((_, i) => i !== index)
        }));
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData.title.trim()) newErrors.title = "Tên sản phẩm không được để trống";
        if (formData.price <= 0) newErrors.price = "Giá sản phẩm phải lớn hơn 0";
        if (formData.quantity < 0) newErrors.quantity = "Số lượng không được âm";
        if (formData.discountedPrice > formData.price) {
            newErrors.discountedPrice = "Giá khuyến mãi không được lớn hơn giá gốc";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        setIsSubmitting(true);

        const productData = {
            ...formData,
            images: imageFiles,
            // Send category information in the format backend expects
            topLevelCategory: formData.topLevelCategory,
            secondLevelCategory: formData.secondLevelCategory
        };

        onSave(productData).finally(() => {
            setIsSubmitting(false);
        });
    };

    const handleCategoryCreated = (newCategory) => {
        setShowCategoryForm(false);

        // If it's a top-level category
        if (!newCategory.parent) {
            setFormData(prev => ({
                ...prev,
                topLevelCategory: newCategory.name,
                secondLevelCategory: ""
            }));
        } else {
            // If it's a sub-category, set both top and sub
            setFormData(prev => ({
                ...prev,
                topLevelCategory: newCategory.parent,
                secondLevelCategory: newCategory.name
            }));
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="product-form-modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>{isEditing ? "Chỉnh sửa sản phẩm" : "Thêm sản phẩm mới"}</h2>
                    <button className="close-btn" onClick={onClose}>×</button>
                </div>

                {showCategoryForm ? (
                    <ProductNewCategory
                        onSave={handleCategoryCreated}
                        onCancel={() => setShowCategoryForm(false)}
                    />
                ) : (
                    <form onSubmit={handleSubmit} className="product-form">
                        <div className="modal-body">
                            <div className="form-grid">
                                <div className="form-left">
                                    <div className="form-group">
                                        <label htmlFor="title">Tên sản phẩm <span className="required">*</span></label>
                                        <input
                                            type="text"
                                            id="title"
                                            name="title"
                                            value={formData.title}
                                            onChange={handleInputChange}
                                            required
                                        />
                                        {errors.title && <div className="error-message">{errors.title}</div>}
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="description">Mô tả sản phẩm</label>
                                        <textarea
                                            id="description"
                                            name="description"
                                            value={formData.description}
                                            onChange={handleInputChange}
                                            rows="5"
                                        ></textarea>
                                    </div>

                                    <div className="form-row">
                                        <div className="form-group">
                                            <label htmlFor="price">Giá bán <span className="required">*</span></label>
                                            <input
                                                type="number"
                                                id="price"
                                                name="price"
                                                value={formData.price}
                                                onChange={handleInputChange}
                                                min="0"
                                                required
                                            />
                                            {errors.price && <div className="error-message">{errors.price}</div>}
                                        </div>

                                        <div className="form-group">
                                            <label htmlFor="discountedPrice">Giá khuyến mãi</label>
                                            <input
                                                type="number"
                                                id="discountedPrice"
                                                name="discountedPrice"
                                                value={formData.discountedPrice}
                                                onChange={handleInputChange}
                                                min="0"
                                            />
                                            {errors.discountedPrice && <div className="error-message">{errors.discountedPrice}</div>}
                                        </div>
                                    </div>

                                    <div className="form-row">
                                        <div className="form-group">
                                            <label htmlFor="quantity">Số lượng <span className="required">*</span></label>
                                            <input
                                                type="number"
                                                id="quantity"
                                                name="quantity"
                                                value={formData.quantity}
                                                onChange={handleInputChange}
                                                min="0"
                                                required
                                            />
                                            {errors.quantity && <div className="error-message">{errors.quantity}</div>}
                                        </div>
                                    </div>

                                    <div className="form-row">
                                        <div className="form-group">
                                            <label htmlFor="topLevelCategory">Danh mục chính</label>
                                            <select
                                                id="topLevelCategory"
                                                name="topLevelCategory"
                                                value={formData.topLevelCategory}
                                                onChange={handleTopCategoryChange}
                                            >
                                                <option value="">Chọn danh mục chính</option>
                                                <option value="add-new">+ Thêm danh mục mới</option>
                                                {categories?.topLevel?.map((categoryName, index) => (
                                                    <option key={index} value={categoryName}>
                                                        {categoryName}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        <div className="form-group">
                                            <label htmlFor="secondLevelCategory">Danh mục con</label>
                                            <select
                                                id="secondLevelCategory"
                                                name="secondLevelCategory"
                                                value={formData.secondLevelCategory}
                                                onChange={handleSubCategoryChange}
                                                disabled={!formData.topLevelCategory || formData.topLevelCategory === 'add-new'}
                                            >
                                                <option value="">Chọn danh mục con (tùy chọn)</option>
                                                <option value="add-new">+ Thêm danh mục con mới</option>
                                                {formData.topLevelCategory &&
                                                    categories?.secondLevel?.[formData.topLevelCategory]?.map((subCategory, index) => (
                                                        <option key={index} value={subCategory}>
                                                            {subCategory}
                                                        </option>
                                                    ))}
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                <div className="form-right">
                                    <div className="form-group">
                                        <label>Kích thước sản phẩm</label>
                                        <div className="size-options">
                                            {availableSizes.map((size) => (
                                                <div
                                                    key={size}
                                                    className={`size-option ${formData.sizes.includes(size) ? 'selected' : ''}`}
                                                    onClick={() => handleSizeToggle(size)}
                                                >
                                                    {size}
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="form-group">
                                        <label>Hình ảnh sản phẩm</label>
                                        <div className="image-upload-container">
                                            <input
                                                type="file"
                                                id="productImages"
                                                multiple
                                                accept="image/*"
                                                onChange={handleFileChange}
                                                className="image-upload-input"
                                            />
                                            <label htmlFor="productImages" className="image-upload-label">
                                                <div className="upload-icon">+</div>
                                                <div className="upload-text">Chọn ảnh</div>
                                            </label>
                                        </div>

                                        <div className="image-preview-container">
                                            {/* Display newly selected images */}
                                            {imageFiles.map((file, index) => (
                                                <div key={`new-${index}`} className="image-preview-item">
                                                    <img src={URL.createObjectURL(file)} alt={`New upload ${index + 1}`} />
                                                    <button
                                                        type="button"
                                                        className="remove-image-btn"
                                                        onClick={() => removeImageFile(index)}
                                                    >
                                                        ×
                                                    </button>
                                                </div>
                                            ))}

                                            {/* Display existing images (for edit mode) */}
                                            {formData.imageUrls && formData.imageUrls.map((image, index) => (
                                                <div key={`existing-${index}`} className="image-preview-item">
                                                    <img src={image.downloadUrl || image} alt={`Existing ${index + 1}`} />
                                                    <button
                                                        type="button"
                                                        className="remove-image-btn"
                                                        onClick={() => removeExistingImage(index)}
                                                    >
                                                        ×
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="modal-footer">
                                        <button type="button" className="btn-secondary" onClick={onClose}>
                                            Hủy
                                        </button>
                                        <button
                                            type="submit"
                                            className="btn-primary"
                                            disabled={isSubmitting}
                                        >
                                            {isSubmitting ? "Đang lưu..." : isEditing ? "Cập nhật" : "Thêm sản phẩm"}
                                        </button>
                                    </div>
                                </div>

                            </div>

                        </div>


                    </form>
                )}
            </div>
        </div>
    );
};

export default ProductFormModal;