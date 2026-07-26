# Phân Tích Cấu Trúc Sơ Đồ Cây Frontend (d:\TTTN\Frontend)

## 1. Tổng Quan Dự Án
Dự án Frontend được xây dựng dựa trên **React 19** kết hợp với **Vite 6** làm công cụ đóng gói và phát triển. Dự án áp dụng kiến trúc phân chia theo tính năng (**Feature-based Architecture**) kết hợp phân tách vai trò rõ ràng giữa hai phân vùng người dùng chính: **User (Khách hàng)** và **Admin (Quản trị viên)**.

### Công nghệ chính (Tech Stack):
* **Core & Build Tool:** React 19, React DOM 19, Vite 6
* **Styling & UI:** Tailwind CSS v4, Bootstrap / React-Bootstrap, Lucide React, Heroicons, Material UI Icons, Emotion
* **Routing:** React Router DOM v7
* **Form & Validation:** React Hook Form, Zod
* **State Management:** React Context API (AuthContext, CartContext, OrderContext, ToastContext, FilterContext)
* **HTTP Client & Service:** Axios, JS Cookie
* **Data Visualization:** Recharts (Báo cáo & Thống kê Admin)

---

## 2. Sơ Đồ Cây Cấu Trúc Thư Mục (Directory Tree)

```text
Frontend/
├── .env                              # Biến môi trường local (VD: VITE_API_BASE_URL)
├── .gitignore                        # Cấu hình bỏ qua tệp tin trong Git
├── eslint.config.js                  # Cấu hình kiểm tra lỗi mã nguồn ESLint
├── index.html                        # Tệp HTML đầu vào chính
├── migrate.cjs                       # Script tiện ích chuyển đổi / migrate
├── package.json                      # Danh sách dependencies & lệnh chạy dự án
├── package-lock.json                 # Lockfile phiên bản thư viện
├── README.md                         # Tài liệu hướng dẫn dự án
├── tailwind.config.js                # Cấu hình Tailwind CSS
├── tsconfig.json / tsconfig.app.json # Cấu hình TypeScript (nếu có bổ sung kiểu dữ liệu)
├── vite.config.ts                    # Cấu hình cho Vite Bundler
│
├── public/                           # Tài nguyên hình ảnh, biểu tượng tĩnh
│   ├── Banner1.jpg, Banner2.jpg...   # Ảnh banner trang chủ
│   ├── VNPayIcon.png, CartIcon.png   # Biểu tượng thanh toán & giỏ hàng
│   ├── icons.svg, favicon.svg        # Tệp SVG icons
│   └── Placeholder*.png              # Ảnh đại diện mẫu cho sản phẩm / danh mục
│
└── src/                              # Toàn bộ mã nguồn chính của ứng dụng
    ├── main.jsx                      # Entrypoint khởi tạo React App & Providers
    ├── index.css / App.css           # File định dạng CSS toàn cục
    │
    ├── config/                       # Cấu hình ứng dụng & API endpoints
    │   └── user/
    │       └── ApiConfig.js          # Khai báo URLs và cấu hình kết nối API User
    │
    ├── utils/                        # Các hàm tiện ích (Helpers/Formatters)
    │   └── admin/
    │       ├── format.js             # Định dạng tiền tệ, ngày tháng
    │       ├── formatters.js         # Chuẩn hóa dữ liệu bảng biểu
    │       └── validators.js         # Validation các biểu mẫu Admin
    │
    ├── store/                        # Quản lý Trạng thái Toàn cục (Global State / Context API)
    │   ├── admin/
    │   │   └── ToastContext.jsx      # Quản lý thông báo Toast phía Admin
    │   └── user/
    │       ├── AuthContext.jsx       # Quản lý đăng nhập/đăng xuất/User Profile
    │       ├── CartContext.jsx       # Quản lý giỏ hàng & sản phẩm đã chọn
    │       ├── OrderContext.jsx      # Quản lý đơn hàng & quy trình đặt hàng
    │       └── ToastContext.jsx      # Quản lý thông báo Toast phía User
    │
    ├── services/                     # Tầng kết nối API (Axios Service layer)
    │   ├── admin/
    │   │   ├── api.js                # Instance Axios cấu hình riêng cho Admin
    │   │   ├── authService.js        # API xác thực Admin
    │   │   ├── dashboardService.js   # API thống kê báo cáo Dashboard
    │   │   ├── orderService.js       # API quản lý đơn hàng
    │   │   ├── productService.js     # API quản lý sản phẩm
    │   │   └── userService.js        # API quản lý người dùng
    │   └── user/
    │       ├── auth.service.js       # API Đăng ký / Đăng nhập / OAuth
    │       ├── cart.service.js       # API Giỏ hàng
    │       ├── order.service.js      # API Đặt hàng & Đơn hàng
    │       ├── product.service.js    # API Lấy sản phẩm & danh mục
    │       ├── review.service.js     # API Đánh giá sản phẩm
    │       └── util.js               # Utility kết nối API User
    │
    ├── hooks/                        # Custom React Hooks
    │   ├── admin/
    │   │   ├── useAnalytics.jsx      # Custom hook phân tích dữ liệu
    │   │   ├── useAuth.jsx           # Custom hook xác thực Admin
    │   │   ├── useDashboard.jsx      # Custom hook lấy dữ liệu Dashboard
    │   │   ├── useFilters.jsx        # Custom hook lọc dữ liệu
    │   │   ├── useOrders.jsx         # Custom hook xử lý logic đơn hàng
    │   │   ├── useProducts.jsx       # Custom hook xử lý sản phẩm
    │   │   └── useUsers.jsx          # Custom hook quản lý tài khoản người dùng
    │   └── user/
    │       ├── useAuth.js            # Hook hỗ trợ Auth User
    │       ├── useFilter.js          # Hook lọc sản phẩm
    │       └── useSimpleCart.js      # Hook xử lý giỏ hàng đơn giản
    │
    ├── components/                   # Các UI Component tái sử dụng (Shared Components)
    │   ├── admin/
    │   │   └── common/
    │   │       ├── ErrorAlert.jsx         # Cảnh báo lỗi UI
    │   │       ├── LoadingSpinner.jsx     # Hiệu ứng nạp dữ liệu
    │   │       ├── ToastContainer.jsx     # Container chứa thông báo
    │   │       └── ToastNotification.jsx  # Chi tiết item thông báo
    │   └── user/
    │       ├── checkout/
    │       │   └── AddressSelection.jsx   # Component lựa chọn địa chỉ giao hàng
    │       └── common/
    │           ├── GlobalToast.jsx        # Thông báo toàn trang
    │           ├── ImageUpload.jsx        # Component tải ảnh lên
    │           ├── Pagination.jsx         # Phân trang UI
    │           ├── StarRating.jsx         # Đánh giá số sao
    │           └── TextArea.jsx           # Khung nhập liệu văn bản
    │
    ├── layouts/                      # Khung giao diện chuẩn (Layout Wrapper)
    │   ├── admin/
    │   │   ├── Header.jsx            # Thanh điều hướng phía trên Admin
    │   │   ├── Sidebar.jsx           # Thanh menu điều hướng bên trái Admin
    │   │   └── Layout.jsx            # Wrapper tích hợp Header + Sidebar + Content Admin
    │   └── user/
    │       ├── AppLayout.jsx         # Wrapper tổng quan phía User
    │       ├── Header.jsx            # Header trang khách hàng (Logo, Search, Nav, Cart, User)
    │       ├── Footer.jsx            # Chân trang thông tin liên hệ & chính sách
    │       ├── Features.jsx          # Thanh giới thiệu ưu điểm (Free Ship, Support...)
    │       └── BreadcrumbNav.jsx     # Thanh điều hướng vị trí trang (Breadcrumb)
    │
    ├── features/                     # Tầng xử lý nghiệp vụ theo tính năng (Feature Modules)
    │   ├── admin/
    │   │   ├── dashboard/            # Các biểu đồ & thống kê Dashboard Admin
    │   │   ├── orders/               # Modal chi tiết, Bộ lọc & Bảng danh sách Đơn hàng
    │   │   ├── products/             # Modal Form thêm/sửa, Chi tiết, Thêm danh mục & Bộ lọc
    │   │   └── users/                # Quản lý danh sách, Chi tiết & Bộ lọc người dùng
    │   └── user/
    │       ├── cart/                 # CartItem, CartSummary, CartProgress
    │       ├── catalog/              # FilterSidebar, ProductControls, TabMenu
    │       ├── chatbot/              # ChatBot hỗ trợ khách hàng tư vấn tự động
    │       ├── product/              # ProductCard, ProductGallery, ProductInfo, ProductReviews, FlashSale, TopSale...
    │       ├── search/               # SearchBar gợi ý tìm kiếm
    │       └── user/                 # AccountForm, AccountSidebar
    │
    ├── pages/                        # Các trang hoàn chỉnh tương ứng với từng Route
    │   ├── admin/
    │   │   ├── admin/
    │   │   │   ├── Dashboard.jsx            # Trang Dashboard tổng quan
    │   │   │   ├── OrdersManagement.jsx     # Trang Quản lý Đơn hàng
    │   │   │   ├── ProductManagement.jsx    # Trang Quản lý Sản phẩm
    │   │   │   └── UserManagement.jsx       # Trang Quản lý Người dùng
    │   │   └── auth/
    │   │       ├── Login.jsx                # Trang Đăng nhập Admin
    │   │       └── NotFound.jsx             # Trang 404 Không tìm thấy
    │   └── user/
    │       ├── Auth/                 # AuthForm (Đăng nhập/Đăng ký), ForgotPassword, OAuthRedirect
    │       ├── Cart/                 # Cart.jsx (Trang giỏ hàng)
    │       ├── Catalog/              # Catalog.jsx (Trang danh mục & tìm kiếm sản phẩm)
    │       ├── Checkout/             # Checkout.jsx & AddressStep.jsx (Trang thanh toán)
    │       ├── Home/                 # Home.jsx (Trang chủ)
    │       ├── ProductDetail/        # ProductDetail.jsx (Trang chi tiết sản phẩm)
    │       ├── UserAccount/          # UserAccount, UserOrders, OrderDetail, OrderManagement
    │       └── NavigatePage.jsx      # Điều hướng chuyển trang
    │
    └── routes/                       # Định tuyến ứng dụng (App Routing)
        ├── admin/
        │   └── AppRouter.jsx         # Cấu hình Routes cho vùng Admin
        └── user/
            ├── AppUser.jsx           # Root Router phía User
            ├── CustomerRouters.jsx   # Cấu hình danh sách Routes của khách hàng
            └── ProtectedRoute.jsx    # Bọc các Route cần xác thực (yêu cầu Đăng nhập)
```

---

## 3. Phân Tích Kiến Trúc Tầng & Luồng Dữ Liệu (Data Flow)

Dự án Frontend tuân theo nguyên lý **Separation of Concerns (Phân tách mối quan tâm)** rõ ràng:

1. **Presentation Layer (Tầng Giao Diện):**
   * `pages/`: Định nghĩa các View/Page hoàn chỉnh.
   * `layouts/`: Định hình bố cục cố định (Header, Sidebar, Footer).
   * `components/`: Chứa các UI thành phần dùng chung nhiều nơi (Alert, Loading, Pagination, Rating,...).

2. **Feature Layer (Tầng Nghiệp Vụ Cụ Thể):**
   * `features/`: Gom nhóm mã nguồn theo mô hình tính năng (Ví dụ: `features/user/product` gom toàn bộ logic hiển thị Gallery, Info, Review, Flash Sale...).

3. **State Management & Business Logic Layer (Tầng Logic & Trạng Thái):**
   * `store/`: Quản lý trạng thái dùng chung toàn bộ ứng dụng qua React Context (`AuthContext` lưu phiên đăng nhập, `CartContext` quản lý giỏ hàng,...).
   * `hooks/`: Chứa Custom Hooks tách rời logic xử lý dữ liệu và hiệu ứng side-effect khỏi UI.

4. **Service & Data Layer (Tầng Kết Nối API):**
   * `services/`: Đóng gói các yêu cầu HTTP gửi tới Backend qua Axios Instance, tích hợp sẵn Interceptors để tự động chèn token và xử lý lỗi response.
   * `config/`: Khai báo URL gốc và các đường dẫn endpoint API backend.

---

## 4. Tóm Tắt Đặc Điểm Nổi Bật

* **Phân định rõ rệt User - Admin:** Mã nguồn ở hầu hết các thư mục (`components`, `layouts`, `pages`, `routes`, `services`, `store`, `hooks`, `features`) đều chia 2 phân nhánh `user` và `admin`, giúp giảm thiểu rủi ro xung đột mã nguồn và dễ dàng bảo trì độc lập.
* **Cơ chế bảo vệ Route (Protected Routes):** Sử dụng `ProtectedRoute.jsx` kết hợp với `AuthContext.jsx` để bảo vệ các tuyến đường đòi hỏi đăng nhập (như trang Checkout, Thông tin cá nhân, Quản trị Admin).
* **Tích hợp ChatBot AI / Tư vấn:** Thư mục `features/user/chatbot` cho thấy ứng dụng có tính năng tư vấn khách hàng tự động.
* **Giao diện hiện đại & tương thích cao:** Sử dụng Tailwind CSS kết hợp với Recharts để dựng bảng điều khiển thống kê đẹp mắt cho Admin.
