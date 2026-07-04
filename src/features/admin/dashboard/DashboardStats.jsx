import React from 'react';

const DashboardStats = ({ stats = {} }) => {
    const {
        totalProducts = 0,
        inStock = 0,
        soldItems = 0
    } = stats;

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
            <div className="bg-white rounded-md p-2.5 shadow-sm flex items-center">
                <div className="w-12.5 h-12.5 flex items-center justify-center mr-5 ml-2.5 object-contain">
                    <img
                        src="https://res.cloudinary.com/dgwfnyn86/image/upload/v1746095542/Heart_vn3d8d.png"
                        alt="Products Icon"
                        className="w-10 h-10 object-contain"
                    />
                </div>
                <div className="flex-1 flex flex-col justify-start items-start gap-1">
                    <div className="text-2xl font-bold text-blue-600 leading-none text-left">{totalProducts}+</div>
                    <div className="text-xs text-gray-500 leading-none text-left">Save Products</div>
                </div>
            </div>

            <div className="bg-white rounded-md p-2.5 shadow-sm flex items-center">
                <div className="w-12.5 h-12.5 flex items-center justify-center mr-5 ml-2.5 object-contain">
                    <img
                        src="https://res.cloudinary.com/dgwfnyn86/image/upload/v1746095542/Game_ta9txl.png"
                        alt="Products Icon"
                        className="w-10 h-10 object-contain"
                    />
                </div>
                <div className="flex-1 flex flex-col justify-start items-start gap-1">
                    <div className="text-2xl font-bold text-blue-600 leading-none text-left">{inStock}+</div>
                    <div className="text-xs text-gray-500 leading-none text-left">Stock Products</div>
                </div>
            </div>

            <div className="bg-white rounded-md p-2.5 shadow-sm flex items-center">
                <div className="w-12.5 h-12.5 flex items-center justify-center mr-5 ml-2.5 object-contain">
                    <img
                        src="https://res.cloudinary.com/dgwfnyn86/image/upload/v1746095541/Bag_nuchmh.png"
                        alt="Products Icon"
                        className="w-10 h-10 object-contain"
                    />
                </div>
                <div className="flex-1 flex flex-col justify-start items-start gap-1">
                    <div className="text-2xl font-bold text-blue-600 leading-none text-left">{soldItems}+</div>
                    <div className="text-xs text-gray-500 leading-none text-left">Sold Products</div>
                </div>
            </div>
        </div>
    );
};

export default DashboardStats;