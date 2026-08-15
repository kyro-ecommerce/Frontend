import React, { useState } from "react";

const emptyVariant = () => ({ sku: "", variantName: "", price: 0, stock: 0, active: true });
const emptyAttribute = () => ({ name: "", value: "", unit: "" });

const ProductFormModal = ({ product, categories = [], onClose, onSave }) => {
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
  const parents = categories.filter(c => !c.parentId && (c.level === 1 || c.isParent));
  const parent = categories.find(c => c.name === form.topLevelCategory);
  const children = parent?.subCategories || categories.filter(c => c.parentId === parent?.categoryId);
  const set = (key, value) => setForm(current => ({ ...current, [key]: value }));
  const updateRow = (key, index, field, value) => set(key, form[key].map((row, i) => i === index ? { ...row, [field]: value } : row));

  const submit = async event => {
    event.preventDefault(); setError("");
    if (!form.title.trim() || !form.brand.trim() || !form.topLevelCategory || !form.secondLevelCategory) return setError("Vui lòng nhập đủ thông tin sản phẩm và danh mục.");
    if (!form.variants.some(v => v.active) || form.variants.some(v => !v.sku.trim() || !v.variantName.trim() || Number(v.price) < 0 || Number(v.stock) < 0)) return setError("Cần ít nhất một variant active; SKU, tên, giá và stock phải hợp lệ.");
    const urls = newImageUrl.split('\n').map(value => value.trim()).filter(Boolean);
    const remainingImages = (product?.imageUrls?.length || 0) - removedImageIds.length + newImageFiles.length + urls.length;
    if (remainingImages > 10) return setError("Một sản phẩm có tối đa 10 ảnh.");
    if (newImageFiles.some(file => file.size > 10 * 1024 * 1024 || !['image/jpeg', 'image/png', 'image/webp'].includes(file.type))) return setError("Ảnh phải là JPEG, PNG hoặc WebP và không quá 10 MB.");
    setSaving(true);
    const result = await onSave({ ...form,
      variants: form.variants.map(v => ({ ...v, price: Number(v.price), stock: Number(v.stock) })),
      attributes: form.attributes.filter(a => a.name.trim() && a.value.trim()),
      discountPercent: Number(form.discountPercent),
      newImageFiles,
      newImageUrls: urls,
      removedImageIds,
    });
    setSaving(false); if (!result?.success) setError(result?.error || "Không thể lưu sản phẩm"); else onClose();
  };

  return <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
    <form onSubmit={submit} className="bg-white rounded-2xl w-full max-w-4xl max-h-[92vh] overflow-y-auto p-6 space-y-5">
      <div className="flex justify-between"><h2 className="text-xl font-bold">{product ? "Sửa sản phẩm" : "Thêm sản phẩm"}</h2><button type="button" onClick={onClose}>✕</button></div>
      {error && <p className="text-red-600">{error}</p>}
      <div className="grid md:grid-cols-2 gap-3">
        <input className="border rounded-lg p-2" placeholder="Tên sản phẩm" value={form.title} onChange={e=>set("title",e.target.value)} />
        <input className="border rounded-lg p-2" placeholder="Thương hiệu" value={form.brand} onChange={e=>set("brand",e.target.value)} />
        <select className="border rounded-lg p-2" value={form.topLevelCategory} onChange={e=>{set("topLevelCategory",e.target.value);set("secondLevelCategory","");}}><option value="">Danh mục chính</option>{parents.map(c=><option key={c.categoryId} value={c.name}>{c.name}</option>)}</select>
        <select className="border rounded-lg p-2" value={form.secondLevelCategory} onChange={e=>set("secondLevelCategory",e.target.value)}><option value="">Danh mục con</option>{children.map(c=><option key={c.categoryId} value={c.name}>{c.name}</option>)}</select>
        <input className="border rounded-lg p-2" type="number" min="0" max="100" placeholder="Giảm giá %" value={form.discountPercent} onChange={e=>set("discountPercent",e.target.value)} />
      </div>
      <textarea className="border rounded-lg p-2 w-full" placeholder="Mô tả" value={form.description} onChange={e=>set("description",e.target.value)} />
      {product && <section className="space-y-2"><h3 className="font-bold">Ảnh sản phẩm</h3>
        <div className="flex flex-wrap gap-3">{(product.imageUrls || []).map(image => {
          const id = image.imageId ?? image.id;
          const removed = removedImageIds.includes(id);
          return <button type="button" key={id} onClick={()=>setRemovedImageIds(current=>removed?current.filter(value=>value!==id):[...current,id])} className={`relative border rounded-lg p-1 ${removed?'opacity-40 border-red-500':'border-slate-200'}`}>
            <img src={image.downloadUrl} alt="Ảnh sản phẩm" className="w-20 h-20 object-cover rounded" />
            <span className="text-xs">{removed?'Hoàn tác':'Xóa'}</span>
          </button>;
        })}</div>
        <input type="file" multiple accept="image/jpeg,image/png,image/webp" onChange={event=>setNewImageFiles([...event.target.files])} />
        <textarea className="border rounded-lg p-2 w-full" placeholder="URL ảnh mới, mỗi dòng một URL" value={newImageUrl} onChange={event=>setNewImageUrl(event.target.value)} />
      </section>}
      <section><div className="flex justify-between mb-2"><h3 className="font-bold">Variants</h3><button type="button" onClick={()=>set("variants",[...form.variants,emptyVariant()])}>+ Variant</button></div>
        {form.variants.map((v,i)=><div key={i} className="grid grid-cols-2 md:grid-cols-6 gap-2 mb-2">
          <input className="border p-2" placeholder="SKU" value={v.sku} onChange={e=>updateRow("variants",i,"sku",e.target.value)} />
          <input className="border p-2 md:col-span-2" placeholder="Tên cấu hình" value={v.variantName} onChange={e=>updateRow("variants",i,"variantName",e.target.value)} />
          <input className="border p-2" type="number" min="0" placeholder="Giá" value={v.price} onChange={e=>updateRow("variants",i,"price",e.target.value)} />
          <input className="border p-2" type="number" min="0" placeholder="Stock" value={v.stock} onChange={e=>updateRow("variants",i,"stock",e.target.value)} />
          <label className="flex gap-1 items-center"><input type="checkbox" checked={v.active} onChange={e=>updateRow("variants",i,"active",e.target.checked)} />Active</label>
        </div>)}</section>
      <section><div className="flex justify-between mb-2"><h3 className="font-bold">Thuộc tính chung</h3><button type="button" onClick={()=>set("attributes",[...form.attributes,emptyAttribute()])}>+ Thuộc tính</button></div>
        {form.attributes.map((a,i)=><div key={i} className="grid grid-cols-3 gap-2 mb-2"><input className="border p-2" placeholder="Tên" value={a.name} onChange={e=>updateRow("attributes",i,"name",e.target.value)} /><input className="border p-2" placeholder="Giá trị atomic" value={a.value} onChange={e=>updateRow("attributes",i,"value",e.target.value)} /><input className="border p-2" placeholder="Đơn vị" value={a.unit||""} onChange={e=>updateRow("attributes",i,"unit",e.target.value)} /></div>)}</section>
      <div className="flex justify-end gap-3"><button type="button" onClick={onClose}>Hủy</button><button disabled={saving} className="bg-emerald-700 text-white rounded-lg px-5 py-2">{saving?"Đang lưu...":"Lưu"}</button></div>
    </form>
  </div>;
};
export default ProductFormModal;
