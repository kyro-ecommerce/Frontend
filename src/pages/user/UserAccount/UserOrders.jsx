import React from "react";
import BreadcrumbNav from "../../../layouts/user/BreadcrumbNav";
import AccountSidebar from "../../../features/user/user/AccountSidebar";
import OrderManagement from "./OrderManagement";

function UserOrders() {
  return (
    <div className="flex flex-col pt-3 bg-white min-h-screen">
      <main className="flex flex-col px-10 py-6 max-sm:px-5">
          {/* <BreadcrumbNav /> */}
        <div className="flex gap-10 mt-10 max-md:flex-col">
          <AccountSidebar />
          <OrderManagement />
        </div>
      </main>
    </div>
  );
}

export default UserOrders;