// src/components/features/products/ProductFormModal.jsx
import React, { useState, useEffect } from "react";
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
        <div className="fixed top-0 left-0 w-screen h-screen bg-black/50 flex items-center justify-center z-1000" onClick={onClose}>
            <div className="relative bg-white w-[90%] max-w-250 rounded-lg shadow-[0_5px_15px_rgba(0,0,0,0.2)] max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-between items-center py-4 px-6 border-b border-gray-200">
                    <h2 className="m-0 text-blue-600 text-xl font-bold">{isEditing ? "Chỉnh sửa sản phẩm" : "Thêm sản phẩm mới"}</h2>
                    <button className="bg-transparent border-none text-2xl cursor-pointer text-gray-500 hover:text-blue-600 transition-colors" onClick={onClose}>×</button>
                </div>

                {showCategoryForm ? (
                    <ProductNewCategory
                        onSave={handleCategoryCreated}
                        onCancel={() => setShowCategoryForm(false)}
                    />
                ) : (
                    <form onSubmit={handleSubmit} className="flex flex-col h-full overflow-hidden">
                        <div className="p-5 px-6 overflow-y-auto flex-1">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div>
                                    <div className="mb-4">
                                        <label htmlFor="title" className="block mb-1.5 font-medium text-gray-800">Tên sản phẩm <span className="text-red-500">*</span></label>
                                        <input
                                            type="text"
                                            id="title"
                                            name="title"
                                            value={formData.title}
                                            onChange={handleInputChange}
                                            required
                                            className="w-full p-2.5 border border-gray-300 rounded text-sm outline-none focus:border-blue-500"
                                        />
                                        {errors.title && <div className="text-red-500 text-xs mt-1">{errors.title}</div>}
                                    </div>

                                    <div className="mb-4">
                                        <label htmlFor="description" className="block mb-1.5 font-medium text-gray-800">Mô tả sản phẩm</label>
                                        <textarea
                                            id="description"
                                            name="description"
                                            value={formData.description}
                                            onChange={handleInputChange}
                                            rows="5"
                                            className="w-full p-2.5 border border-gray-300 rounded text-sm outline-none focus:border-blue-500 min-h-25 resize-y"
                                        ></textarea>
                                    </div>

                                    <div className="flex gap-3">
                                        <div className="mb-4 flex-1">
                                            <label htmlFor="price" className="block mb-1.5 font-medium text-gray-800">Giá bán <span className="text-red-500">*</span></label>
                                            <input
                                                type="number"
                                                id="price"
                                                name="price"
                                                value={formData.price}
                                                onChange={handleInputChange}
                                                min="0"
                                                required
                                                className="w-full p-2.5 border border-gray-300 rounded text-sm outline-none focus:border-blue-500"
                                            />
                                            {errors.price && <div className="text-red-500 text-xs mt-1">{errors.price}</div>}
                                        </div>

                                        <div className="mb-4 flex-1">
                                            <label htmlFor="discountedPrice" className="block mb-1.5 font-medium text-gray-800">Giá khuyến mãi</label>
                                            <input
                                                type="number"
                                                id="discountedPrice"
                                                name="discountedPrice"
                                                value={formData.discountedPrice}
                                                onChange={handleInputChange}
                                                min="0"
                                                className="w-full p-2.5 border border-gray-300 rounded text-sm outline-none focus:border-blue-500"
                                            />
                                            {errors.discountedPrice && <div className="text-red-500 text-xs mt-1">{errors.discountedPrice}</div>}
                                        </div>
                                    </div>

                                    <div className="flex gap-3">
                                        <div className="mb-4 flex-1">
                                            <label htmlFor="quantity" className="block mb-1.5 font-medium text-gray-800">Số lượng <span className="text-red-500">*</span></label>
                                            <input
                                                type="number"
                                                id="quantity"
                                                name="quantity"
                                                value={formData.quantity}
                                                onChange={handleInputChange}
                                                min="0"
                                                required
                                                className="w-full p-2.5 border border-gray-300 rounded text-sm outline-none focus:border-blue-500"
                                            />
                                            {errors.quantity && <div className="text-red-500 text-xs mt-1">{errors.quantity}</div>}
                                        </div>
                                    </div>

                                    <div className="flex gap-3">
                                        <div className="mb-4 flex-1">
                                            <label htmlFor="topLevelCategory" className="block mb-1.5 font-medium text-gray-800">Danh mục chính</label>
                                            <select
                                                id="topLevelCategory"
                                                name="topLevelCategory"
                                                value={formData.topLevelCategory}
                                                onChange={handleTopCategoryChange}
                                                className="w-full p-2.5 border border-gray-300 rounded text-sm outline-none focus:border-blue-500 bg-white"
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

                                        <div className="mb-4 flex-1">
                                            <label htmlFor="secondLevelCategory" className="block mb-1.5 font-medium text-gray-800">Danh mục con</label>
                                            <select
                                                id="secondLevelCategory"
                                                name="secondLevelCategory"
                                                value={formData.secondLevelCategory}
                                                onChange={handleSubCategoryChange}
                                                disabled={!formData.topLevelCategory || formData.topLevelCategory === 'add-new'}
                                                className="w-full p-2.5 border border-gray-300 rounded text-sm outline-none focus:border-blue-500 bg-white disabled:bg-gray-100 disabled:text-gray-400"
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

                                <div>
                                    <div className="mb-4">
                                        <label className="block mb-1.5 font-medium text-gray-800">Kích thước sản phẩm</label>
                                        <div className="flex flex-wrap gap-2.5 mt-2">
                                            {availableSizes.map((size) => (
                                                <div
                                                    key={size}
                                                    className={`flex items-center justify-center w-10 h-10 border rounded cursor-pointer font-medium transition-colors ${formData.sizes.includes(size) ? 'bg-blue-600 text-white border-blue-600 hover:bg-blue-700' : 'border-gray-300 text-gray-800 hover:bg-gray-50'}`}
                                                    onClick={() => handleSizeToggle(size)}
                                                >
                                                    {size}
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="mb-4">
                                        <label className="block mb-1.5 font-medium text-gray-800">Hình ảnh sản phẩm</label>
                                        <div className="flex flex-col items-center justify-center mb-4">
                                            <input
                                                type="file"
                                                id="productImages"
                                                multiple
                                                accept="image/*"
                                                onChange={handleFileChange}
                                                className="hidden"
                                            />
                                            <label htmlFor="productImages" className="flex flex-col items-center justify-center w-full h-25 border-2 border-dashed border-gray-300 rounded cursor-pointer transition-colors hover:border-blue-600">
                                                <div className="text-2xl text-gray-400 flex items-center justify-center mb-1">+</div>
                                                <div className="text-sm text-gray-500 flex items-center justify-center">Chọn ảnh</div>
                                            </label>
                                        </div>

                                        <div className="flex flex-wrap gap-2.5 mt-4">
                                            {/* Display newly selected images */}
                                            {imageFiles.map((file, index) => (
                                                <div key={`new-${index}`} className="relative w-20 h-20 rounded overflow-hidden border border-gray-200 group">
                                                    <img className="w-full h-full object-cover" src={URL.createObjectURL(file)} alt={`New upload ${index + 1}`} />
                                                    <button
                                                        type="button"
                                                        className="absolute top-1 right-1 w-5 h-5 bg-black/50 text-white border-none rounded-full flex items-center justify-center cursor-pointer text-sm p-0 hover:bg-black/80 transition-colors opacity-0 group-hover:opacity-100"
                                                        onClick={() => removeImageFile(index)}
                                                    >
                                                        ×
                                                    </button>
                                                </div>
                                            ))}

                                            {/* Display existing images (for edit mode) */}
                                            {formData.imageUrls && formData.imageUrls.map((image, index) => (
                                                <div key={`existing-${index}`} className="relative w-20 h-20 rounded overflow-hidden border border-gray-200 group">
                                                    <img className="w-full h-full object-cover" src={image.downloadUrl || image} alt={`Existing ${index + 1}`} />
                                                    <button
                                                        type="button"
                                                        className="absolute top-1 right-1 w-5 h-5 bg-black/50 text-white border-none rounded-full flex items-center justify-center cursor-pointer text-sm p-0 hover:bg-black/80 transition-colors opacity-0 group-hover:opacity-100"
                                                        onClick={() => removeExistingImage(index)}
                                                    >
                                                        ×
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="flex justify-end py-4 border-t border-gray-200 gap-3 mt-auto">
                                        <button type="button" className="py-2.5 px-5 rounded bg-gray-100 text-gray-800 font-medium cursor-pointer border-none transition-colors hover:bg-gray-200" onClick={onClose}>
                                            Hủy
                                        </button>
                                        <button
                                            type="submit"
                                            className="py-2.5 px-5 rounded bg-blue-600 text-white font-medium cursor-pointer border-none transition-colors hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
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