// src/components/features/products/ProductFormModal.jsx
import React, { useState, useEffect } from "react";
import ProductNewCategory from "./ProductNewCategory";

const ProductFormModal = ({ product, categories, onClose, onSave }) => {
    const isEditing = !!product;
    const [formData, setFormData] = useState({
        id: "",
        title: "",
        description: "",
        price: "",
        discountedPrice: "",
        quantity: "",
        brand: "Generic",
        color: "Tiêu chuẩn",
        topLevelCategory: "",
        secondLevelCategory: "",
        sizes: [],
        imageUrls: []
    });
    const [hasSizes, setHasSizes] = useState(false);
    const [imageFiles, setImageFiles] = useState([]);
    const [imageUrlInput, setImageUrlInput] = useState("");
    const [errors, setErrors] = useState({});
    const [customSizeInput, setCustomSizeInput] = useState("");
    const [availableSizes] = useState(["S", "M", "L", "XL", "XXL", "1000mAh", "2000mAh", "5000mAh", "8GB", "16GB"]);

    const handleAddCustomSize = () => {
        const trimmed = customSizeInput.trim();
        if (!trimmed) return;
        setFormData(prev => {
            const current = prev.sizes || [];
            if (!current.includes(trimmed)) {
                return { ...prev, sizes: [...current, trimmed] };
            }
            return prev;
        });
        setHasSizes(true);
        setCustomSizeInput("");
    };
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showCategoryForm, setShowCategoryForm] = useState(false);

    // Load product data when editing
    useEffect(() => {
        if (product) {
            const initialSizes = (product.sizes || []).map(s => (typeof s === 'object' ? s.name : String(s)));
            setFormData({
                id: product.id || "",
                title: product.title || "",
                description: product.description || "",
                price: product.price ?? "",
                discountedPrice: product.discountedPrice ?? "",
                quantity: product.quantity ?? "",
                brand: product.brand || "Generic",
                color: product.color || "Tiêu chuẩn",
                topLevelCategory: product.topLevelCategory || "",
                secondLevelCategory: product.secondLevelCategory || product.category?.name || "",
                sizes: initialSizes,
                imageUrls: product.imageUrls || product.images || []
            });
            setHasSizes(initialSizes.length > 0);
        }
    }, [product]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;

        if ((name === "topLevelCategory" || name === "secondLevelCategory") && value === "add-new") {
            setShowCategoryForm(true);
            return;
        }

        setFormData(prev => ({
            ...prev,
            [name]: (name === "price" || name === "discountedPrice" || name === "quantity")
                ? (value === "" ? "" : Number(value))
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
            secondLevelCategory: ''
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
            const current = prev.sizes || [];
            if (current.includes(size)) {
                return { ...prev, sizes: current.filter(s => s !== size) };
            } else {
                return { ...prev, sizes: [...current, size] };
            }
        });
    };

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        setImageFiles(prev => [...prev, ...files]);
    };

    const handleAddUrlImage = () => {
        if (!imageUrlInput.trim()) return;
        setFormData(prev => ({
            ...prev,
            imageUrls: [...prev.imageUrls, { downloadUrl: imageUrlInput.trim() }]
        }));
        setImageUrlInput("");
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
        if (formData.price === "" || Number(formData.price) <= 0) newErrors.price = "Giá sản phẩm phải lớn hơn 0";
        if (formData.quantity === "" || Number(formData.quantity) < 0) newErrors.quantity = "Số lượng không được âm";
        if (formData.discountedPrice !== "" && Number(formData.discountedPrice) > Number(formData.price)) {
            newErrors.discountedPrice = "Giá khuyến mãi không được lớn hơn giá gốc";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        setIsSubmitting(true);

        try {
            // Build sizes array for backend
            const mappedSizes = (formData.sizes || []).map(s => ({
                name: typeof s === 'string' ? s : s.name,
                quantity: Number(formData.quantity) || 10
            }));

            // Image list for backend
            const uploadedImages = imageFiles.map((file, idx) => ({
                fileName: file.name || `img_${idx + 1}.jpg`,
                fileType: file.type || "image/jpeg",
                downloadUrl: `https://picsum.photos/seed/${encodeURIComponent(file.name || Date.now())}/600/600`
            }));

            const existingImages = (formData.imageUrls || []).map(img => {
                let url = typeof img === 'string' ? img : (img.downloadUrl || img.url || "");
                if (url.length > 240) {
                    url = `https://picsum.photos/seed/img_${Math.floor(Math.random() * 1000)}/600/600`;
                }
                return { downloadUrl: url };
            }).filter(img => Boolean(img.downloadUrl));

            const finalImages = [...existingImages, ...uploadedImages];
            if (finalImages.length === 0) {
                finalImages.push({ downloadUrl: "https://picsum.photos/seed/product/600/600" });
            }

            const numPrice = Number(formData.price) || 0;
            let rawDiscounted = formData.discountedPrice !== "" ? Number(formData.discountedPrice) : numPrice;
            let numDiscountPercent = 0;
            let numDiscounted = numPrice;

            if (rawDiscounted > 0 && numPrice > 0) {
                if (rawDiscounted <= 100) {
                    // User entered percentage e.g. 10 = 10%
                    numDiscountPercent = Math.min(100, Math.max(0, rawDiscounted));
                    numDiscounted = Math.round(numPrice - (numPrice * numDiscountPercent / 100));
                } else if (rawDiscounted < numPrice) {
                    // User entered price in VNĐ e.g. 90000 VNĐ
                    numDiscounted = rawDiscounted;
                    numDiscountPercent = Math.round(((numPrice - numDiscounted) / numPrice) * 100);
                }
            }

            let topCat = formData.topLevelCategory ? formData.topLevelCategory.trim() : "";
            let subCat = formData.secondLevelCategory ? formData.secondLevelCategory.trim() : "";

            if (!topCat) {
                if (categories?.topLevel && categories.topLevel.length > 0) {
                    topCat = categories.topLevel[0];
                } else {
                    topCat = "other-products";
                }
            }

            if (!subCat || subCat.toLowerCase() === topCat.toLowerCase()) {
                const availableSubs = categories?.secondLevel?.[topCat] || [];
                if (availableSubs.length > 0) {
                    subCat = availableSubs[0];
                } else {
                    subCat = `${topCat}-sub`;
                }
            }

            const payload = {
                ...(isEditing ? { id: product.id } : {}),
                title: formData.title.trim().substring(0, 95),
                description: formData.description ? formData.description.trim().substring(0, 490) : "",
                price: numPrice,
                discountedPrice: numDiscounted,
                discountPersent: numDiscountPercent,
                quantity: Number(formData.quantity) || 0,
                brand: (formData.brand ? formData.brand.trim() : "Generic").substring(0, 45),
                color: (formData.color ? formData.color.trim() : "Tiêu chuẩn").substring(0, 18),
                topLevelCategory: topCat,
                secondLevelCategory: subCat,
                sizes: mappedSizes,
                images: finalImages,
                imageUrls: finalImages
            };

            console.log("Submitting Product Payload:", payload);
            await onSave(payload);
        } catch (err) {
            console.error("Submit error:", err);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCategoryCreated = (newCategory) => {
        setShowCategoryForm(false);
        if (!newCategory.parent) {
            setFormData(prev => ({
                ...prev,
                topLevelCategory: newCategory.name,
                secondLevelCategory: newCategory.name
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                topLevelCategory: newCategory.parent,
                secondLevelCategory: newCategory.name
            }));
        }
    };

    return (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="relative bg-white w-full max-w-3xl rounded-3xl shadow-2xl max-h-[90vh] flex flex-col overflow-hidden border border-slate-100" onClick={(e) => e.stopPropagation()}>
                {/* Modal Header */}
                <div className="flex justify-between items-center py-4 px-6 border-b border-slate-100 bg-slate-50/50">
                    <h2 className="m-0 text-base font-extrabold text-slate-900 tracking-tight">
                        {isEditing ? "Chỉnh sửa sản phẩm" : "Thêm sản phẩm mới"}
                    </h2>
                    <button
                        className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center border-none cursor-pointer transition-all font-bold text-sm"
                        onClick={onClose}
                    >
                        ✕
                    </button>
                </div>

                {showCategoryForm ? (
                    <ProductNewCategory
                        onSave={handleCategoryCreated}
                        onCancel={() => setShowCategoryForm(false)}
                    />
                ) : (
                    <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
                        <div className="p-6 overflow-y-auto flex-1 space-y-5">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                {/* Left Column: Basic Info */}
                                <div className="space-y-4">
                                    <div>
                                        <label htmlFor="title" className="block mb-1.5 text-xs font-extrabold text-slate-700">
                                            Tên sản phẩm <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            id="title"
                                            name="title"
                                            value={formData.title}
                                            onChange={handleInputChange}
                                            placeholder="Nhập tên sản phẩm..."
                                            required
                                            className="w-full py-2.5 px-3.5 bg-slate-50 border border-slate-200/80 rounded-xl text-xs font-semibold text-slate-800 outline-none focus:bg-white focus:border-[#1D7461] focus:ring-2 focus:ring-[#1D7461]/20 transition-all"
                                        />
                                        {errors.title && <div className="text-red-500 text-[11px] font-semibold mt-1">{errors.title}</div>}
                                    </div>

                                    <div>
                                        <label htmlFor="description" className="block mb-1.5 text-xs font-extrabold text-slate-700">
                                            Mô tả sản phẩm
                                        </label>
                                        <textarea
                                            id="description"
                                            name="description"
                                            value={formData.description}
                                            onChange={handleInputChange}
                                            placeholder="Mô tả chi tiết về thông số, kiểu dáng..."
                                            rows="4"
                                            className="w-full py-2.5 px-3.5 bg-slate-50 border border-slate-200/80 rounded-xl text-xs font-semibold text-slate-800 outline-none focus:bg-white focus:border-[#1D7461] focus:ring-2 focus:ring-[#1D7461]/20 transition-all resize-y min-h-24"
                                        ></textarea>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label htmlFor="price" className="block mb-1.5 text-xs font-extrabold text-slate-700">
                                                Giá bán (VNĐ) <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="number"
                                                id="price"
                                                name="price"
                                                value={formData.price}
                                                onChange={handleInputChange}
                                                placeholder="Nhập giá bán..."
                                                min="0"
                                                required
                                                className="w-full py-2.5 px-3.5 bg-slate-50 border border-slate-200/80 rounded-xl text-xs font-semibold text-slate-800 outline-none focus:bg-white focus:border-[#1D7461] focus:ring-2 focus:ring-[#1D7461]/20 transition-all"
                                            />
                                            {errors.price && <div className="text-red-500 text-[11px] font-semibold mt-1">{errors.price}</div>}
                                        </div>

                                        <div>
                                            <label htmlFor="discountedPrice" className="block mb-1.5 text-xs font-extrabold text-slate-700">
                                                Giá khuyến mãi
                                            </label>
                                            <input
                                                type="number"
                                                id="discountedPrice"
                                                name="discountedPrice"
                                                value={formData.discountedPrice}
                                                onChange={handleInputChange}
                                                placeholder="Để trống nếu không km..."
                                                min="0"
                                                className="w-full py-2.5 px-3.5 bg-slate-50 border border-slate-200/80 rounded-xl text-xs font-semibold text-slate-800 outline-none focus:bg-white focus:border-[#1D7461] focus:ring-2 focus:ring-[#1D7461]/20 transition-all"
                                            />
                                            {errors.discountedPrice && <div className="text-red-500 text-[11px] font-semibold mt-1">{errors.discountedPrice}</div>}
                                        </div>
                                    </div>

                                    <div>
                                        <label htmlFor="quantity" className="block mb-1.5 text-xs font-extrabold text-slate-700">
                                            Số lượng kho <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="number"
                                            id="quantity"
                                            name="quantity"
                                            value={formData.quantity}
                                            onChange={handleInputChange}
                                            placeholder="Nhập số lượng tồn kho..."
                                            min="0"
                                            required
                                            className="w-full py-2.5 px-3.5 bg-slate-50 border border-slate-200/80 rounded-xl text-xs font-semibold text-slate-800 outline-none focus:bg-white focus:border-[#1D7461] focus:ring-2 focus:ring-[#1D7461]/20 transition-all"
                                        />
                                        {errors.quantity && <div className="text-red-500 text-[11px] font-semibold mt-1">{errors.quantity}</div>}
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label htmlFor="topLevelCategory" className="block mb-1.5 text-xs font-extrabold text-slate-700">
                                                Danh mục chính
                                            </label>
                                            <select
                                                id="topLevelCategory"
                                                name="topLevelCategory"
                                                value={formData.topLevelCategory}
                                                onChange={handleTopCategoryChange}
                                                className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200/80 rounded-xl text-xs font-bold text-slate-700 outline-none focus:bg-white focus:border-[#1D7461] transition-all cursor-pointer"
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

                                        <div>
                                            <label htmlFor="secondLevelCategory" className="block mb-1.5 text-xs font-extrabold text-slate-700">
                                                Danh mục con
                                            </label>
                                            <select
                                                id="secondLevelCategory"
                                                name="secondLevelCategory"
                                                value={formData.secondLevelCategory}
                                                onChange={handleSubCategoryChange}
                                                disabled={!formData.topLevelCategory || formData.topLevelCategory === 'add-new'}
                                                className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200/80 rounded-xl text-xs font-bold text-slate-700 outline-none focus:bg-white focus:border-[#1D7461] transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                <option value="">Chọn danh mục con (tùy chọn)</option>
                                                <option value="add-new">+ Thêm danh mục con</option>
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

                                {/* Right Column: Sizes & Images */}
                                <div className="space-y-4 flex flex-col justify-between">
                                    <div>
                                        <label className="block mb-1.5 text-xs font-extrabold text-slate-700">
                                            Kích thước / Phân loại (Tùy chọn)
                                        </label>

                                        <div className="space-y-3">
                                            {/* Custom label input field */}
                                            <div className="flex gap-2">
                                                <input
                                                    type="text"
                                                    placeholder="Nhập kích thước, dung lượng (ví dụ: S, M, 1000mAh, 16GB)..."
                                                    value={customSizeInput}
                                                    onChange={(e) => setCustomSizeInput(e.target.value)}
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter') {
                                                            e.preventDefault();
                                                            handleAddCustomSize();
                                                        }
                                                    }}
                                                    className="flex-1 py-2 px-3.5 bg-slate-50 border border-slate-200/80 rounded-xl text-xs font-semibold text-slate-800 outline-none focus:bg-white focus:border-[#1D7461]"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={handleAddCustomSize}
                                                    className="px-4 py-2 bg-[#1D7461] hover:bg-[#136050] text-white text-xs font-bold rounded-xl border-none cursor-pointer shadow-xs shrink-0"
                                                >
                                                    + Thêm
                                                </button>
                                            </div>

                                            {/* Selected size tags list */}
                                            {(formData.sizes || []).length > 0 && (
                                                <div className="flex flex-wrap gap-1.5 p-2 bg-slate-50 border border-slate-200/80 rounded-xl items-center">
                                                    {(formData.sizes || []).map((size, idx) => (
                                                        <span
                                                            key={idx}
                                                            className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#1D7461] text-white text-xs font-bold rounded-lg shadow-xs"
                                                        >
                                                            {typeof size === 'object' ? size.name : size}
                                                            <button
                                                                type="button"
                                                                onClick={() => handleSizeToggle(typeof size === 'object' ? size.name : size)}
                                                                className="hover:text-red-200 cursor-pointer border-none bg-transparent text-xs p-0 leading-none"
                                                            >
                                                                ✕
                                                            </button>
                                                        </span>
                                                    ))}
                                                </div>
                                            )}

                                            {/* Quick preset buttons */}
                                            <div className="flex flex-wrap gap-1.5">
                                                {availableSizes.map((size) => {
                                                    const isSelected = (formData.sizes || []).includes(size);
                                                    return (
                                                        <button
                                                            type="button"
                                                            key={size}
                                                            onClick={() => handleSizeToggle(size)}
                                                            className={`px-2.5 py-1 rounded-lg border text-xs font-bold transition-all cursor-pointer ${
                                                                isSelected
                                                                    ? 'bg-[#1D7461] text-white border-[#1D7461]'
                                                                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                                                            }`}
                                                        >
                                                            {isSelected ? `✓ ${size}` : `+ ${size}`}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block mb-2 text-xs font-extrabold text-slate-700">
                                            Hình ảnh sản phẩm
                                        </label>
                                        <input
                                            type="file"
                                            id="productImages"
                                            multiple
                                            accept="image/*"
                                            onChange={handleFileChange}
                                            className="hidden"
                                        />
                                        <label
                                            htmlFor="productImages"
                                            className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-slate-200 hover:border-[#1D7461] rounded-2xl bg-slate-50/60 transition-all cursor-pointer group mb-2"
                                        >
                                            <span className="text-2xl text-slate-400 group-hover:text-[#1D7461] font-light leading-none mb-1">+</span>
                                            <span className="text-xs font-bold text-slate-500 group-hover:text-[#1D7461]">Tải ảnh từ máy tính</span>
                                        </label>

                                        {/* URL Image Input fallback */}
                                        <div className="flex gap-2 mb-3">
                                            <input
                                                type="url"
                                                placeholder="Hoặc dán URL hình ảnh..."
                                                value={imageUrlInput}
                                                onChange={(e) => setImageUrlInput(e.target.value)}
                                                className="flex-1 py-1.5 px-3 bg-slate-50 border border-slate-200/80 rounded-xl text-xs font-semibold text-slate-800 outline-none focus:bg-white focus:border-[#1D7461]"
                                            />
                                            <button
                                                type="button"
                                                onClick={handleAddUrlImage}
                                                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl border border-slate-200 cursor-pointer"
                                            >
                                                + Thêm URL
                                            </button>
                                        </div>

                                        <div className="flex flex-wrap gap-2.5 max-h-36 overflow-y-auto p-1">
                                            {/* New uploaded preview */}
                                            {imageFiles.map((file, index) => (
                                                <div key={`new-${index}`} className="relative w-16 h-16 rounded-xl overflow-hidden border border-slate-200 shadow-xs group shrink-0">
                                                    <img className="w-full h-full object-cover" src={URL.createObjectURL(file)} alt={`Preview ${index + 1}`} />
                                                    <button
                                                        type="button"
                                                        className="absolute top-1 right-1 w-5 h-5 bg-black/60 text-white rounded-full flex items-center justify-center text-xs border-none cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"
                                                        onClick={() => removeImageFile(index)}
                                                    >
                                                        ✕
                                                    </button>
                                                </div>
                                            ))}

                                            {/* Existing images preview */}
                                            {formData.imageUrls && formData.imageUrls.map((image, index) => (
                                                <div key={`existing-${index}`} className="relative w-16 h-16 rounded-xl overflow-hidden border border-slate-200 shadow-xs group shrink-0">
                                                    <img className="w-full h-full object-cover" src={image.downloadUrl || image} alt={`Existing ${index + 1}`} />
                                                    <button
                                                        type="button"
                                                        className="absolute top-1 right-1 w-5 h-5 bg-black/60 text-white rounded-full flex items-center justify-center text-xs border-none cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"
                                                        onClick={() => removeExistingImage(index)}
                                                    >
                                                        ✕
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="flex justify-end items-center gap-3 p-4 px-6 border-t border-slate-100 bg-slate-50/50">
                            <button
                                type="button"
                                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200/80 text-slate-700 text-xs font-bold transition-all cursor-pointer border border-slate-200/80"
                                onClick={onClose}
                            >
                                Hủy
                            </button>
                            <button
                                type="submit"
                                className="px-5 py-2.5 rounded-xl bg-[#1D7461] hover:bg-[#136050] text-white text-xs font-bold transition-all cursor-pointer shadow-sm shadow-[#1D7461]/20 border-none disabled:opacity-50 disabled:cursor-not-allowed"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? "Đang lưu..." : isEditing ? "Cập nhật sản phẩm" : "Thêm sản phẩm mới"}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default ProductFormModal;