import React from "react";
import AccountSidebar from "../../../features/user/user/AccountSidebar";
import OrderManagement from "./OrderManagement";

function UserOrders() {
  return (
    <div className="flex flex-col pt-4 bg-gray-50/50 min-h-screen">
      <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8 max-md:flex-col items-start">
          <AccountSidebar />
          <OrderManagement />
        </div>
      </main>
    </div>
  );
}

export default UserOrders;