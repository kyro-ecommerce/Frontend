import React from "react";

const TextArea = ({ value, onChange }) => {
  return (
    <div className="mb-5">
      <textarea
        value={value}
        onChange={onChange}
        placeholder="Ví dụ: Tôi đã mua sản phẩm cách đây 1 tháng và rất hài lòng về nó ..."
        className="p-2.5 w-full rounded border border-solid resize-none border-zinc-300 h-[100px]"
        aria-label="Product review"
      />
    </div>
  );
};

export default TextArea;
