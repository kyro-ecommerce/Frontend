// src/pages/UserAccount/UserAccount.jsx
import React from "react";
import BreadcrumbNav from "../../components/layout/BreadcrumbNav";
import AccountSidebar from "../../components/features/user/AccountSidebar";
import AccountForm from "../../components/features/user/AccountForm";


function UserAccount() {
  return (
    <div className="flex flex-col pt-3 bg-white min-h-screen">
      <main className="flex flex-col px-10 py-6 max-sm:px-5">
        <div className="flex gap-10 mt-10 max-md:flex-col">
          <AccountSidebar />
          <AccountForm />
        </div>
      </main>
    </div>
  );
}

export default UserAccount;