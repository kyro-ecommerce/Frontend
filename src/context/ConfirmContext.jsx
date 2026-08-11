import React, { createContext, useContext, useState, useCallback } from "react";

const ConfirmContext = createContext();

export const ConfirmProvider = ({ children }) => {
    const [confirmState, setConfirmState] = useState({
        isOpen: false,
        title: "Xác nhận",
        message: "Bạn có chắc chắn muốn thực hiện thao tác này?",
        confirmText: "Xác nhận",
        cancelText: "Hủy",
        type: "danger", // 'danger', 'warning', 'info'
        resolve: null
    });

    const confirm = useCallback(({
        title = "Xác nhận",
        message = "Bạn có chắc chắn muốn thực hiện thao tác này?",
        confirmText = "Xác nhận",
        cancelText = "Hủy",
        type = "danger"
    }) => {
        return new Promise((resolve) => {
            setConfirmState({
                isOpen: true,
                title,
                message,
                confirmText,
                cancelText,
                type,
                resolve
            });
        });
    }, []);

    const handleConfirm = () => {
        if (confirmState.resolve) confirmState.resolve(true);
        setConfirmState(prev => ({ ...prev, isOpen: false }));
    };

    const handleCancel = () => {
        if (confirmState.resolve) confirmState.resolve(false);
        setConfirmState(prev => ({ ...prev, isOpen: false }));
    };

    return (
        <ConfirmContext.Provider value={confirm}>
            {children}
            {confirmState.isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200">
                    <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-100 overflow-hidden text-center transform scale-100 transition-all">
                        {/* Icon by Type */}
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 border ${
                            confirmState.type === 'danger'
                                ? 'bg-red-50 text-red-500 border-red-100'
                                : confirmState.type === 'warning'
                                ? 'bg-amber-50 text-amber-500 border-amber-100'
                                : 'bg-blue-50 text-blue-500 border-blue-100'
                        }`}>
                            {confirmState.type === 'danger' ? (
                                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                            ) : confirmState.type === 'warning' ? (
                                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                            ) : (
                                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            )}
                        </div>

                        {/* Title and Message */}
                        <h3 className="text-base font-black text-slate-900 mb-1.5">
                            {confirmState.title}
                        </h3>
                        <p className="text-xs text-slate-600 mb-6 leading-relaxed">
                            {confirmState.message}
                        </p>

                        {/* Action Buttons */}
                        <div className="flex items-center justify-center gap-3">
                            <button
                                onClick={handleCancel}
                                className="w-1/2 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 text-xs font-bold transition-all cursor-pointer"
                            >
                                {confirmState.cancelText}
                            </button>
                            <button
                                onClick={handleConfirm}
                                className={`w-1/2 py-2.5 rounded-xl text-white text-xs font-bold shadow-md transition-all cursor-pointer border-none ${
                                    confirmState.type === 'danger'
                                        ? 'bg-red-600 hover:bg-red-700 shadow-red-600/20'
                                        : confirmState.type === 'warning'
                                        ? 'bg-amber-600 hover:bg-amber-700 shadow-amber-600/20'
                                        : 'bg-[#1D7461] hover:bg-[#155a4b] shadow-[#1D7461]/20'
                                }`}
                            >
                                {confirmState.confirmText}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </ConfirmContext.Provider>
    );
};

export const useConfirm = () => {
    const context = useContext(ConfirmContext);
    if (!context) {
        throw new Error("useConfirm must be used within a ConfirmProvider");
    }
    return context;
};
