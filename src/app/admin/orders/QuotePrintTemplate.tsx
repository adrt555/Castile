"use client";
import React from "react";
import Image from "next/image";

interface PrintItem {
    productName: string;
    colorName?: string;
    size?: string;
    quantitySqft: number;
    unitPrice: number;
    totalPrice: number;
    discount?: string;
    discountType?: '$' | '%';
}

interface QuotePrintProps {
    orderId: string;
    status: string;
    createdAt: string;
    clientName: string;
    clientCompany?: string;
    clientEmail?: string;
    clientPhone?: string;
    shippingAddress?: string;
    billingAddress?: string;
    items: PrintItem[];
    subtotal: number;
    discount: number;
    freight: number;
    tax: number;
    total: number;
}

export default function QuotePrintTemplate({
    orderId,
    status,
    createdAt,
    clientName,
    clientCompany,
    clientEmail,
    clientPhone,
    shippingAddress,
    billingAddress,
    items,
    subtotal,
    discount,
    freight,
    tax,
    total,
}: QuotePrintProps) {
    const orderDate = new Date(createdAt);
    const dueDate = new Date(createdAt);
    dueDate.setDate(dueDate.getDate() + 30);

    const fmt = (d: Date) =>
        d.toLocaleDateString("en-US", { year: "numeric", month: "2-digit", day: "2-digit" });

    const isQuote = status === "Quote" || status === "Invoice Sent";

    return (
        <div id="quote-print-template" className="quote-print-only">
            <style>{`
                @media screen {
                    .quote-print-only { display: none; }
                }
                @media print {
                    body * { visibility: hidden; }
                    .quote-print-only,
                    .quote-print-only * { visibility: visible; }
                    .quote-print-only {
                        display: block !important;
                        position: fixed;
                        top: 0; left: 0;
                        width: 100%; height: 100%;
                        background: white;
                        z-index: 9999;
                        padding: 40px 48px;
                        font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
                        color: #1a1a1a;
                        font-size: 12px;
                        box-sizing: border-box;
                    }
                    .print-header {
                        display: flex;
                        justify-content: space-between;
                        align-items: flex-start;
                        margin-bottom: 32px;
                    }
                    .company-block { max-width: 220px; }
                    .company-name {
                        font-size: 16px; font-weight: 700; letter-spacing: 0.08em;
                        text-transform: uppercase; color: #1a1a1a; margin-bottom: 4px;
                    }
                    .company-sub { font-size: 11px; color: #555; line-height: 1.5; }
                    .logo-block { text-align: right; }
                    .logo-img { width: 80px; height: auto; object-fit: contain; }
                    .doc-title {
                        font-size: 38px; font-weight: 900; letter-spacing: 0.1em;
                        color: #2d7a6a; text-align: right; margin-bottom: 28px;
                    }
                    .meta-grid {
                        display: flex;
                        justify-content: space-between;
                        align-items: flex-start;
                        margin-bottom: 24px;
                        padding-bottom: 20px;
                        border-bottom: 1px solid #e5e7eb;
                    }
                    .bill-to-label { font-size: 10px; color: #888; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 6px; }
                    .bill-name { font-size: 14px; font-weight: 700; color: #1a1a1a; margin-bottom: 2px; }
                    .bill-detail { font-size: 11px; color: #555; line-height: 1.6; }
                    .meta-table { text-align: right; }
                    .meta-row { display: flex; justify-content: flex-end; gap: 20px; margin-bottom: 4px; }
                    .meta-label { font-size: 10px; text-transform: uppercase; letter-spacing: 0.07em; color: #888; width: 70px; text-align: right; }
                    .meta-value { font-size: 11px; font-weight: 600; color: #1a1a1a; width: 90px; text-align: right; }
                    .items-table { width: 100%; border-collapse: collapse; margin-bottom: 0; }
                    .items-table thead tr {
                        background: #2d7a6a; color: white;
                    }
                    .items-table thead th {
                        padding: 10px 12px; font-size: 10px;
                        font-weight: 700; text-transform: uppercase;
                        letter-spacing: 0.06em; text-align: left;
                    }
                    .items-table thead th.right { text-align: right; }
                    .items-table tbody tr { border-bottom: 1px solid #f0f0f0; }
                    .items-table tbody tr:last-child { border-bottom: none; }
                    .items-table tbody td {
                        padding: 9px 12px; font-size: 11px; color: #333;
                        vertical-align: top;
                    }
                    .items-table tbody td.right { text-align: right; }
                    .item-name { font-weight: 600; margin-bottom: 2px; }
                    .item-sub { font-size: 10px; color: #888; text-transform: uppercase; letter-spacing: 0.04em; }
                    .financials { display: flex; justify-content: flex-end; margin-top: 0; border-top: 1px solid #e5e7eb; }
                    .financials-box { width: 280px; padding: 16px 0; }
                    .fin-row { display: flex; justify-content: space-between; padding: 5px 12px; font-size: 11px; color: #444; }
                    .fin-row.discount { color: #2d7a6a; font-weight: 600; }
                    .fin-row.total {
                        background: #2d7a6a; color: white;
                        font-weight: 800; font-size: 13px;
                        margin-top: 4px; border-radius: 4px;
                        padding: 10px 12px;
                    }
                    .terms-block { margin-top: 28px; border-top: 1px solid #e5e7eb; padding-top: 16px; }
                    .terms-title { font-weight: 700; font-size: 11px; margin-bottom: 6px; }
                    .terms-text { font-size: 10px; color: #666; line-height: 1.7; }
                    .sig-block { margin-top: 40px; display: flex; justify-content: flex-end; }
                    .sig-line { border-top: 1px solid #999; width: 220px; padding-top: 6px; text-align: center; font-size: 10px; color: #888; }
                    @page { margin: 0; size: letter; }
                }
            `}</style>

            {/* Header */}
            <div className="print-header">
                <div className="company-block">
                    <div className="company-name">Castile</div>
                    <div className="company-sub">
                        Luxury Stone & Porcelain<br />
                        Miami, FL<br />
                        sales@castile.com · (305) 555-0100
                    </div>
                </div>
                <div className="logo-block">
                    <img
                        src="/new_castile_logo.png"
                        alt="Castile Logo"
                        className="logo-img"
                        style={{ width: 72, height: "auto" }}
                    />
                </div>
            </div>

            {/* Doc Title */}
            <div className="doc-title">{isQuote ? "QUOTE" : "INVOICE"}</div>

            {/* Meta: Bill To + Order Info */}
            <div className="meta-grid">
                <div>
                    <div className="bill-to-label">Bill To</div>
                    <div className="bill-name">{clientName}</div>
                    <div className="bill-detail">
                        {clientCompany && <>{clientCompany}<br /></>}
                        {(billingAddress || shippingAddress) && <>{billingAddress || shippingAddress}<br /></>}
                        {clientEmail && <>{clientEmail}<br /></>}
                        {clientPhone && <>{clientPhone}</>}
                    </div>
                </div>
                <div className="meta-table">
                    <div className="meta-row">
                        <span className="meta-label">{isQuote ? "Quote #" : "Invoice #"}</span>
                        <span className="meta-value">{orderId}</span>
                    </div>
                    <div className="meta-row">
                        <span className="meta-label">Date</span>
                        <span className="meta-value">{fmt(orderDate)}</span>
                    </div>
                    <div className="meta-row">
                        <span className="meta-label">Due Date</span>
                        <span className="meta-value">{fmt(dueDate)}</span>
                    </div>
                    {shippingAddress && (
                        <div className="meta-row" style={{ marginTop: 8 }}>
                            <span className="meta-label" style={{ width: 90 }}>Ship To</span>
                            <span className="meta-value" style={{ width: 160, textAlign: "right", whiteSpace: "pre-line" }}>
                                {shippingAddress}
                            </span>
                        </div>
                    )}
                </div>
            </div>

            {/* Items Table */}
            <table className="items-table">
                <thead>
                    <tr>
                        <th style={{ width: 36 }}>#</th>
                        <th>Description</th>
                        <th className="right" style={{ width: 80 }}>Qty (sqft)</th>
                        <th className="right" style={{ width: 80 }}>Unit Price</th>
                        {discount > 0 && <th className="right" style={{ width: 70 }}>Discount</th>}
                        <th className="right" style={{ width: 90 }}>Amount</th>
                    </tr>
                </thead>
                <tbody>
                    {items.map((item, idx) => (
                        <tr key={idx}>
                            <td style={{ color: "#888" }}>{idx + 1}</td>
                            <td>
                                <div className="item-name">{item.productName}</div>
                                {(item.colorName || item.size) && (
                                    <div className="item-sub">{[item.colorName, item.size].filter(Boolean).join(" • ")}</div>
                                )}
                            </td>
                            <td className="right">{item.quantitySqft.toLocaleString()}</td>
                            <td className="right">${item.unitPrice.toFixed(2)}</td>
                            {discount > 0 && (
                                <td className="right" style={{ color: "#2d7a6a" }}>
                                    {item.discount && parseFloat(item.discount) > 0
                                        ? `${item.discountType}${item.discount}`
                                        : "—"}
                                </td>
                            )}
                            <td className="right" style={{ fontWeight: 600 }}>
                                ${item.totalPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* Financials */}
            <div className="financials">
                <div className="financials-box">
                    <div className="fin-row">
                        <span>Subtotal</span>
                        <span>${subtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                    </div>
                    {discount > 0 && (
                        <div className="fin-row discount">
                            <span>Discount</span>
                            <span>-${discount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                        </div>
                    )}
                    {freight > 0 && (
                        <div className="fin-row">
                            <span>Freight</span>
                            <span>${freight.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                        </div>
                    )}
                    <div className="fin-row">
                        <span>Sales Tax (7%)</span>
                        <span>${tax.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                    </div>
                    <div className="fin-row total">
                        <span>Total (USD)</span>
                        <span>${total.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                    </div>
                </div>
            </div>

            {/* Terms */}
            <div className="terms-block">
                <div className="terms-title">Terms and Conditions</div>
                <div className="terms-text">
                    Payment is due within 30 days of the quote date.<br />
                    Please make checks payable to: Castile Luxury Stone & Porcelain.<br />
                    This quote is valid for 30 days from the date above. Prices subject to change thereafter.<br />
                    All sales final. Product availability confirmed at time of order.
                </div>
            </div>

            {/* Signature */}
            <div className="sig-block">
                <div className="sig-line">customer signature</div>
            </div>
        </div>
    );
}
