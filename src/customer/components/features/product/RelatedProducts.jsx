import React from "react";
const RelatedProducts = () => {
  return (
    <section className="px-64 py-10 max-md:p-5">
      <h2>Sản phẩm đã xem</h2>
      <div className="flex gap-5 mt-5 max-sm:flex-col">
        <article className="w-[calc(33%_-_14px)]">
          <img src="product1.jpg" alt="Product 1" />
          <div>
            <h3>Laptop ASUS Vivobook 5 14</h3>
            <p>22.990.000đ</p>
          </div>
        </article>
        <article className="w-[calc(33%_-_14px)]">
          <img src="product2.jpg" alt="Product 2" />
          <div>
            <h3>Card màn hình MSI RTX 3060</h3>
            <p>29.490.000đ</p>
          </div>
        </article>
        <article className="w-[calc(33%_-_14px)]">
          <img src="product3.jpg" alt="Product 3" />
          <div>
            <h3>MacBook Pro 14 M2 Pro</h3>
            <p>48.800.000đ</p>
          </div>
        </article>
      </div>
    </section>
  );
};

export default RelatedProducts;
