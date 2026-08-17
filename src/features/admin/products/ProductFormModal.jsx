import React, { useState, useRef } from "react";
import { X, Plus, Trash2, Upload, Image as ImageIcon, Tag, Layers, FileText, Check, AlertCircle, RefreshCw, Link as LinkIcon } from "lucide-react";
import { translateCategoryName } from "../../../utils/admin/format.js";

const emptyVariant = () => ({ sku: "", variantName: "", price: 0, stock: 0, active: true });
const emptyAttribute = () => ({ name: "", value: "", unit: "" });

const ProductFormModal = ({ product, categories = [], onClose, onSave }) => {
  const fileInputRef = useRef(null);
  const [form, setForm] = useState(() => ({
    title: product?.title || "",
    description: product?.description || "",
    detailedReview: product?.detailedReview || "",
    brand: product?.brand || "",
    discountPercent: product?.discountPercent || 0,
    topLevelCategory: product?.topLevelCategory || "",
    secondLevelCategory: product?.secondLevelCategory || "",
    variants: product?.variants?.length ? product.variants : [emptyVariant()],
    attributes: product?.attributes || [],
  }));

  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [newImageFiles, setNewImageFiles] = useState([]);
  const [newImageUrl, setNewImageUrl] = useState("");
  const [removedImageIds, setRemovedImageIds] = useState([]);
  const [showUrlInput, setShowUrlInput] = useState(false);

  const categoryList = Array.isArray(categories) ? categories : (categories?.rawCategories || categories?.tree || categories?.rawList || []);
  const parents = categoryList.filter(c => !c.parentId && (c.level === 1 || c.isParent));
  const parent = categoryList.find(c => c.name === form.topLevelCategory);
  const children = parent?.subCategories || categoryList.filter(c => c.parentId === parent?.categoryId);

  const set = (key, value) => setForm(current => ({ ...current, [key]: value }));
  const updateRow = (key, index, field, value) => set(key, form[key].map((row, i) => i === index ? { ...row, [field]: value } : row));

  const removeVariant = (index) => {
    if (form.variants.length <= 1) return;
    setForm(current => ({ ...current, variants: current.variants.filter((_, i) => i !== index) }));
  };

  const removeAttribute = (index) => {
    setForm(current => ({ ...current, attributes: current.attributes.filter((_, i) => i !== index) }));
  };

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFiles = Array.from(e.target.files);
      setNewImageFiles(prev => [...prev, ...selectedFiles]);
    }
  };

  const removeNewImageFile = (index) => {
    setNewImageFiles(prev => prev.filter((_, i) => i !== index));
  };

  const removeUrlImage = (index) => {
    const urls = newImageUrl.split('\n').filter(Boolean);
    const updatedUrls = urls.filter((_, i) => i !== index);
    setNewImageUrl(updatedUrls.join('\n'));
  };

  const submit = async (event) => {
    event.preventDefault();
    setError("");
    if (!form.title.trim() || !form.brand.trim() || !form.topLevelCategory || !form.secondLevelCategory) {
      return setError("Vui lòng điền đầy đủ tên sản phẩm, thương hiệu và chọn danh mục.");
    }
    if (!form.variants.some(v => v.active) || form.variants.some(v => !v.sku.trim() || !v.variantName.trim() || Number(v.price) < 0 || Number(v.stock) < 0)) {
      return setError("Cần ít nhất một variant kích hoạt; SKU, tên cấu hình, giá bán và tồn kho phải hợp lệ.");
    }
    const variantSkus = form.variants.map(v => v.sku.trim());
    if (new Set(variantSkus).size !== variantSkus.length) {
      return setError("SKU của các variant không được trùng nhau.");
    }
    const variantNames = form.variants.map(v => v.variantName.trim());
    if (new Set(variantNames).size !== variantNames.length) {
      return setError("Tên cấu hình của các variant không được trùng nhau.");
    }

    const urls = newImageUrl.split('\n').map(value => value.trim()).filter(Boolean);
    const remainingImages = (product?.imageUrls?.length || 0) - removedImageIds.length + newImageFiles.length + urls.length;
    if (remainingImages > 10) return setError("Một sản phẩm có tối đa 10 hình ảnh.");
    if (newImageFiles.some(file => file.size > 10 * 1024 * 1024 || !['image/jpeg', 'image/png', 'image/webp'].includes(file.type))) {
      return setError("Hình ảnh phải đúng định dạng JPEG, PNG hoặc WebP và dung lượng không quá 10MB.");
    }

    setSaving(true);

    const cleanVariants = form.variants.map(v => {
      const item = {
        sku: v.sku?.trim() || "",
        variantName: v.variantName?.trim() || "",
        price: Number(v.price) || 0,
        stock: Number(v.stock) || 0,
        active: Boolean(v.active)
      };
      if (v.id) item.id = Number(v.id);
      return item;
    });

    const seenAttributes = new Set();
    const cleanAttributes = [];

    for (const a of form.attributes) {
      const name = a.name?.trim();
      const value = a.value?.trim();
      const unit = a.unit?.trim() || "";
      if (!name || !value) continue;

      const key = `${name.toLowerCase()}|${value.toLowerCase()}|${unit.toLowerCase()}`;
      if (seenAttributes.has(key)) continue;
      seenAttributes.add(key);

      const item = { name, value, unit };
      if (a.id) item.id = Number(a.id);
      cleanAttributes.push(item);
    }

    const payload = {
      title: form.title.trim(),
      brand: form.brand.trim(),
      topLevelCategory: form.topLevelCategory || "",
      secondLevelCategory: form.secondLevelCategory || "",
      discountPercent: Number(form.discountPercent) || 0,
      description: form.description?.trim() || "",
      detailedReview: form.detailedReview?.trim() || "",
      newImageFiles,
      newImageUrls: urls,
      removedImageIds,
    };

    // Chỉ gửi variants khi tạo mới hoặc khi danh sách biến thể thực sự bị người dùng thay đổi
    const currentVariantsList = cleanVariants.map(v => `${v.id || ""}|${v.sku}|${v.variantName}|${v.price}|${v.stock}|${v.active}`);
    const origVariantsList = (product?.variants || []).map(v => `${v.id || ""}|${v.sku?.trim() || ""}|${v.variantName?.trim() || ""}|${Number(v.price) || 0}|${Number(v.stock) || 0}|${Boolean(v.active)}`);
    const isVariantsChanged = !product || currentVariantsList.length !== origVariantsList.length || currentVariantsList.some((val, idx) => val !== origVariantsList[idx]);

    if (isVariantsChanged) {
      payload.variants = cleanVariants;
    }

    // Chỉ gửi attributes khi tạo mới hoặc khi danh sách thuộc tính thực sự bị người dùng thay đổi
    const currentAttrList = cleanAttributes.map(a => `${a.id || ""}|${a.name}|${a.value}|${a.unit}`);
    const origAttrList = (product?.attributes || [])
      .filter(a => a.name?.trim() && a.value?.trim())
      .map(a => `${a.id || ""}|${a.name?.trim() || ""}|${a.value?.trim() || ""}|${a.unit?.trim() || ""}`);
    const isAttributesChanged = !product || currentAttrList.length !== origAttrList.length || currentAttrList.some((val, idx) => val !== origAttrList[idx]);

    if (isAttributesChanged) {
      payload.attributes = cleanAttributes;
    }

    const result = await onSave(payload);
    setSaving(false);
    if (!result?.success) setError(result?.error || "Không thể lưu sản phẩm. Vui lòng thử lại.");
    else onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-emerald-800 to-teal-700 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center backdrop-blur-md">
              <Tag className="w-5 h-5 text-emerald-300" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight">
                {product ? "Chỉnh sửa sản phẩm" : "Thêm sản phẩm mới"}
              </h2>
              <p className="text-xs text-emerald-100/80 font-medium">
                {product ? `Mã SP: #${product.id}` : "Nhập đầy đủ thông tin sản phẩm và phân loại cấu hình"}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Content */}
        <form onSubmit={submit} className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-7">
          
          {error && (
            <div className="flex items-center gap-3 p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl text-sm font-semibold">
              <AlertCircle className="w-5 h-5 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          {/* Section 1: Thông tin chung */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-slate-800 font-bold text-base border-b border-slate-100 pb-2">
              <Layers className="w-5 h-5 text-emerald-600" />
              <span>Thông tin chung</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Tên sản phẩm <span className="text-rose-500">*</span></label>
                <input
                  type="text"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:bg-white focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 outline-none transition-all"
                  placeholder="Ví dụ: Laptop ASUS ROG Zephyrus G14"
                  value={form.title}
                  onChange={e => set("title", e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Thương hiệu / Hãng <span className="text-rose-500">*</span></label>
                <input
                  type="text"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:bg-white focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 outline-none transition-all"
                  placeholder="Ví dụ: ASUS, Apple, Dell..."
                  value={form.brand}
                  onChange={e => set("brand", e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Danh mục chính <span className="text-rose-500">*</span></label>
                <select
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:bg-white focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 outline-none transition-all cursor-pointer"
                  value={form.topLevelCategory}
                  onChange={e => {
                    set("topLevelCategory", e.target.value);
                    set("secondLevelCategory", "");
                  }}
                >
                  <option value="">-- Chọn danh mục chính --</option>
                  {parents.map(c => (
                    <option key={c.categoryId || c.id || c.name} value={c.name}>{translateCategoryName(c.name)}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Danh mục con <span className="text-rose-500">*</span></label>
                <select
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:bg-white focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 outline-none transition-all cursor-pointer disabled:opacity-50"
                  disabled={!form.topLevelCategory}
                  value={form.secondLevelCategory}
                  onChange={e => set("secondLevelCategory", e.target.value)}
                >
                  <option value="">-- Chọn danh mục con --</option>
                  {children.map(c => (
                    <option key={c.categoryId || c.id || c.name} value={c.name}>{translateCategoryName(c.name)}</option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Phần trăm giảm giá (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  className="w-full max-w-xs px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:bg-white focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 outline-none transition-all"
                  placeholder="0 - 100"
                  value={form.discountPercent}
                  onChange={e => set("discountPercent", e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Mô tả sản phẩm</label>
              <textarea
                rows={3}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:bg-white focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 outline-none transition-all resize-y"
                placeholder="Nhập mô tả tóm tắt tính năng nổi bật của sản phẩm..."
                value={form.description}
                onChange={e => set("description", e.target.value)}
              />
            </div>
          </div>

          {/* Section 2: Quản lý hình ảnh */}
          <div className="space-y-4 border-t border-slate-100 pt-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-slate-800 font-bold text-base">
                <ImageIcon className="w-5 h-5 text-emerald-600" />
                <span>Quản lý hình ảnh</span>
              </div>

              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={handleFileSelect}
              />

              {/* Action buttons on the header row */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowUrlInput(!showUrlInput)}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <LinkIcon className="w-3.5 h-3.5" />
                  <span>{showUrlInput ? "Ẩn URL" : "+ Nhập URL ảnh"}</span>
                </button>

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>+ Tải ảnh từ máy tính</span>
                </button>
              </div>
            </div>

            {/* Input URL khi bấm nút + Nhập URL ảnh */}
            {showUrlInput && (
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl animate-in fade-in duration-150">
                <label className="block text-xs font-bold text-slate-700 mb-1">Điền URL ảnh (mỗi dòng 1 URL):</label>
                <textarea
                  rows={2}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 outline-none transition-all"
                  placeholder="https://example.com/image.jpg"
                  value={newImageUrl}
                  onChange={e => setNewImageUrl(e.target.value)}
                />
              </div>
            )}

            {/* Tất cả các ảnh hiển thị CHUNG 1 HÀNG flex-wrap gallery */}
            <div className="flex flex-wrap items-center gap-3">
              
              {/* 1. Ảnh hiện tại của sản phẩm */}
              {product && product.imageUrls && product.imageUrls.map(image => {
                const id = image.imageId ?? image.id;
                const isRemoved = removedImageIds.includes(id);
                return (
                  <button
                    type="button"
                    key={`existing-${id}`}
                    onClick={() => setRemovedImageIds(current => isRemoved ? current.filter(val => val !== id) : [...current, id])}
                    className={`group relative border-2 rounded-2xl p-1 transition-all overflow-hidden cursor-pointer shrink-0 ${
                      isRemoved ? 'border-rose-400 bg-rose-50 opacity-40' : 'border-slate-200 hover:border-emerald-500 bg-white'
                    }`}
                  >
                    <img src={image.downloadUrl} alt="Ảnh sản phẩm" className="w-20 h-20 object-contain rounded-xl bg-white" />
                    <div className={`absolute inset-0 flex flex-col items-center justify-center text-xs font-bold rounded-xl transition-all ${
                      isRemoved ? 'bg-rose-900/60 text-white' : 'opacity-0 group-hover:opacity-100 bg-black/40 text-white'
                    }`}>
                      {isRemoved ? <RefreshCw className="w-4 h-4" /> : <Trash2 className="w-4 h-4" />}
                      <span className="text-[9px] mt-0.5">{isRemoved ? "Hoàn tác" : "Xoá"}</span>
                    </div>
                  </button>
                );
              })}

              {/* 2. Ảnh mới từ máy tính (Xem trước tạm thời) */}
              {newImageFiles.map((file, idx) => {
                const previewUrl = URL.createObjectURL(file);
                return (
                  <div key={`file-${idx}`} className="group relative border-2 border-emerald-500 rounded-2xl p-1 bg-emerald-50/40 overflow-hidden shadow-xs shrink-0">
                    <img src={previewUrl} alt={file.name} className="w-20 h-20 object-contain rounded-xl bg-white" />
                    <button
                      type="button"
                      onClick={() => removeNewImageFile(idx)}
                      className="absolute top-1.5 right-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-full p-1 shadow-md transition-colors cursor-pointer"
                      title="Xóa tệp này"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                    <div className="absolute bottom-1 left-1 right-1 text-[9px] font-bold bg-emerald-800/80 text-white px-1 py-0.5 rounded text-center truncate">
                      Mới ({file.name})
                    </div>
                  </div>
                );
              })}

              {/* 3. Ảnh từ URL (Xem trước tạm thời) */}
              {newImageUrl.split('\n').filter(url => url.trim()).map((url, idx) => (
                <div key={`url-${idx}`} className="group relative border-2 border-blue-400 rounded-2xl p-1 bg-blue-50/40 overflow-hidden shadow-xs shrink-0">
                  <img
                    src={url.trim()}
                    alt="URL Preview"
                    className="w-20 h-20 object-contain rounded-xl bg-white"
                    onError={(e) => { e.target.src = "/Placeholder2.png"; }}
                  />
                  <button
                    type="button"
                    onClick={() => removeUrlImage(idx)}
                    className="absolute top-1.5 right-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-full p-1 shadow-md transition-colors cursor-pointer"
                    title="Xóa URL này"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                  <div className="absolute bottom-1 left-1 right-1 text-[9px] font-bold bg-blue-800/80 text-white px-1 py-0.5 rounded text-center truncate">
                    URL #{idx + 1}
                  </div>
                </div>
              ))}

              {/* 4. Nút bấm + Thêm ảnh dạng ô card ở cuối hàng */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-20 h-20 border-2 border-dashed border-slate-300 hover:border-emerald-500 rounded-2xl flex flex-col items-center justify-center text-slate-400 hover:text-emerald-600 bg-slate-50/50 hover:bg-emerald-50/30 transition-all cursor-pointer shrink-0"
                title="Tải thêm ảnh từ máy tính"
              >
                <Plus className="w-6 h-6 mb-0.5" />
                <span className="text-[10px] font-bold">Thêm ảnh</span>
              </button>

            </div>
          </div>

          {/* Section 3: Cấu hình biến thể (Variants) */}
          <div className="space-y-4 border-t border-slate-100 pt-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-800 font-bold text-base">
                <Tag className="w-5 h-5 text-emerald-600" />
                <span>Danh sách biến thể (Variants) <span className="text-rose-500">*</span></span>
              </div>
              <button
                type="button"
                onClick={() => set("variants", [...form.variants, emptyVariant()])}
                className="px-3 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-bold text-xs rounded-xl flex items-center gap-1 transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Thêm Cấu hình</span>
              </button>
            </div>

            <div className="space-y-3">
              {form.variants.map((variant, index) => (
                <div key={index} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl relative space-y-3 md:space-y-0 md:flex md:items-center md:gap-3">
                  <div className="grid grid-cols-2 sm:grid-cols-4 md:flex-1 gap-3 items-center">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 mb-1">Mã SKU</label>
                      <input
                        type="text"
                        placeholder="SKU..."
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 outline-none focus:border-emerald-600"
                        value={variant.sku}
                        onChange={e => updateRow("variants", index, "sku", e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 mb-1">Tên cấu hình</label>
                      <input
                        type="text"
                        placeholder="RAM 16GB / SSD 512GB..."
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 outline-none focus:border-emerald-600"
                        value={variant.variantName}
                        onChange={e => updateRow("variants", index, "variantName", e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 mb-1">Giá bán (VND)</label>
                      <input
                        type="number"
                        min="0"
                        placeholder="0"
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 outline-none focus:border-emerald-600"
                        value={variant.price}
                        onChange={e => updateRow("variants", index, "price", e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 mb-1">Kho (Stock)</label>
                      <input
                        type="number"
                        min="0"
                        placeholder="0"
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 outline-none focus:border-emerald-600"
                        value={variant.stock}
                        onChange={e => updateRow("variants", index, "stock", e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between md:justify-end gap-3 shrink-0 pt-2 md:pt-4">
                    <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={variant.active}
                        onChange={e => updateRow("variants", index, "active", e.target.checked)}
                        className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
                      />
                      <span>Active</span>
                    </label>

                    {form.variants.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeVariant(index)}
                        className="p-2 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                        title="Xoá cấu hình này"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 4: Thuộc tính chung (Attributes/Specs) */}
          <div className="space-y-4 border-t border-slate-100 pt-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-800 font-bold text-base">
                <FileText className="w-5 h-5 text-emerald-600" />
                <span>Thuộc tính thông số kỹ thuật (Attributes)</span>
              </div>
              <button
                type="button"
                onClick={() => set("attributes", [...form.attributes, emptyAttribute()])}
                className="px-3 py-1.5 bg-slate-100 text-slate-700 hover:bg-slate-200 font-bold text-xs rounded-xl flex items-center gap-1 transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Thêm Thuộc tính</span>
              </button>
            </div>

            <div className="space-y-2.5">
              {form.attributes.map((attr, index) => (
                <div key={index} className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Màn hình, CPU, GPU..."
                    className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 outline-none focus:bg-white focus:border-emerald-600"
                    value={attr.name}
                    onChange={e => updateRow("attributes", index, "name", e.target.value)}
                  />
                  <input
                    type="text"
                    placeholder="15.6 inch 144Hz..."
                    className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 outline-none focus:bg-white focus:border-emerald-600"
                    value={attr.value}
                    onChange={e => updateRow("attributes", index, "value", e.target.value)}
                  />
                  <input
                    type="text"
                    placeholder="Đơn vị (GB, inch, W...)"
                    className="w-28 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 outline-none focus:bg-white focus:border-emerald-600"
                    value={attr.unit || ""}
                    onChange={e => updateRow("attributes", index, "unit", e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => removeAttribute(index)}
                    className="p-2 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer shrink-0"
                    title="Xoá thuộc tính"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
              {form.attributes.length === 0 && (
                <p className="text-xs text-slate-400 italic">Chưa có thuộc tính bổ sung. Bấm "+ Thêm Thuộc tính" nếu muốn thêm thông số kỹ thuật.</p>
              )}
            </div>
          </div>

        </form>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 text-sm font-bold transition-all cursor-pointer"
          >
            Hủy bỏ
          </button>
          <button
            type="button"
            onClick={submit}
            disabled={saving}
            className="px-6 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-sm font-bold shadow-lg shadow-emerald-200 transition-all cursor-pointer flex items-center gap-2 disabled:opacity-50"
          >
            {saving ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Đang lưu dữ liệu...</span>
              </>
            ) : (
              <>
                <Check className="w-4 h-4" />
                <span>{product ? "Cập nhật sản phẩm" : "Lưu sản phẩm"}</span>
              </>
            ) }
          </button>
        </div>

      </div>
    </div>
  );
};

export default ProductFormModal;
