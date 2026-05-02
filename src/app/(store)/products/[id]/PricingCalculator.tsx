"use client";

import { useState } from "react";

export default function PricingCalculator({ basePrice = 12.99 }: { basePrice?: number }) {
    const [discount, setDiscount] = useState<number>(0);

    // Ensure we have a valid base price
    const actualPrice = basePrice || 12.99;
    
    // Calculate final discounted price per sqft
    const finalPrice = actualPrice * (1 - discount / 100);

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8 mb-8">
            {/* Actual Price Square */}
            <div className="bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 rounded-xl p-6 flex flex-col justify-center items-center text-center aspect-auto sm:aspect-square">
                <span className="text-zinc-500 dark:text-white/50 text-xs font-bold uppercase tracking-widest mb-2">List Price / SqFt</span>
                <span className="text-4xl lg:text-5xl font-playfair text-zinc-900 dark:text-white">${actualPrice.toFixed(2)}</span>
            </div>

            {/* Final/Discount Price Interactive Square */}
            <div className="bg-white dark:bg-black border-2 border-amber-500 rounded-xl p-6 flex flex-col justify-center items-center text-center aspect-auto sm:aspect-square relative overflow-hidden">
                <span className="text-amber-600 dark:text-amber-500 text-xs font-bold uppercase tracking-widest mb-4">Final Discounted Price</span>
                
                <div className="flex items-center space-x-2 mb-4 w-full px-4">
                    <label className="text-xs text-zinc-500 font-medium whitespace-nowrap">Discount %</label>
                    <input 
                        type="number" 
                        min="0" 
                        max="100" 
                        value={discount === 0 ? '' : discount} 
                        onChange={(e) => setDiscount(Number(e.target.value) || 0)}
                        placeholder="0"
                        className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-white/10 rounded-md px-3 py-2 text-center text-zinc-900 dark:text-white font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                </div>

                <span className="text-4xl lg:text-5xl font-playfair text-amber-600 dark:text-amber-400">
                    ${finalPrice.toFixed(2)}
                </span>
                
                {discount > 0 && (
                    <div className="absolute top-3 right-3 bg-red-100 text-red-600 text-[10px] font-black uppercase px-2 py-1 rounded-full shadow-sm">
                        -{discount}% OFF
                    </div>
                )}
            </div>
        </div>
    );
}
