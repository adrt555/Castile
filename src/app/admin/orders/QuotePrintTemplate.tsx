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
    room?: string;
    unit?: 'sqft' | 'PC';
    discount?: string;
    discountType?: string;
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
    documentType?: 'QUOTE' | 'INVOICE' | 'PURCHASE ORDER';
    isPresentation?: boolean;
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
    documentType,
    isPresentation = false,
}: QuotePrintProps) {
    const orderDate = new Date(createdAt);
    const dueDate = new Date(createdAt);
    dueDate.setDate(dueDate.getDate() + 30);

    const fmt = (d: Date) =>
        d.toLocaleDateString("en-US", { year: "numeric", month: "2-digit", day: "2-digit" });

    // Fallback if not specifically provided
    const isQuote = status === "Quote" || status === "Invoice Sent";
    const headerTitle = documentType || (isQuote ? "QUOTE" : "INVOICE");

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
                        position: relative;
                        width: 100%;
                        background: white;
                        padding: 0;
                        font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
                        color: #1a1a1a;
                        font-size: 13px;
                        box-sizing: border-box;
                    }
                    .print-container {
                        padding: 40px;
                    }
                    tr {
                        page-break-inside: avoid;
                    }
                    .page-footer-counter {
                        position: fixed;
                        bottom: 10px;
                        right: 10px;
                        font-size: 10px;
                        color: #999;
                    }
                    .page-footer-counter:after {
                        content: "Page " counter(page);
                    }
                    @page {
                        margin: 1.5cm;
                        counter-increment: page;
                    }
                    .print-header {
                        display: flex;
                        justify-content: space-between;
                        align-items: flex-start;
                        margin-bottom: 32px;
                    }
                    .company-block { text-align: right; }
                    .company-name {
                        font-size: 12px; color: #1a1a1a; margin-bottom: 2px;
                    }
                    .company-sub { font-size: 11px; color: #555; line-height: 1.5; }
                    .logo-block { text-align: left; }
                    .logo-img { width: 180px; height: auto; object-fit: contain; mix-blend-mode: multiply; }
                    .doc-title {
                        font-size: 28px; font-weight: 900; letter-spacing: 0.05em;
                        color: #1a1a1a; text-align: right; margin-bottom: 12px; line-height: 1;
                    }
                    .meta-grid {
                        display: flex;
                        justify-content: space-between;
                        align-items: flex-start;
                        margin-bottom: 20px;
                        padding-bottom: 15px;
                        border-bottom: 1px solid #e5e7eb;
                    }
                    .bill-to-label { font-size: 11px; color: #888; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 4px; }
                    .bill-name { font-size: 14px; font-weight: 700; color: #1a1a1a; margin-bottom: 2px; }
                    .bill-detail { font-size: 12px; color: #555; line-height: 1.5; }
                    .meta-table { text-align: right; }
                    .meta-row { display: flex; justify-content: flex-end; gap: 15px; margin-bottom: 3px; }
                    .meta-label { font-size: 11px; text-transform: uppercase; letter-spacing: 0.07em; color: #888; width: 80px; text-align: right; }
                    .meta-value { font-size: 11px; font-weight: 600; color: #1a1a1a; width: 100px; text-align: right; }
                    
                    .room-header {
                        background: #f8fafc;
                        padding: 6px 12px;
                        border-left: 4px solid #2d7a6a;
                        margin: 20px 0 10px 0;
                        font-size: 11px;
                        font-weight: 800;
                        text-transform: uppercase;
                        letter-spacing: 0.05em;
                        color: #475569;
                    }

                    .items-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; page-break-inside: auto; }
                    .items-table thead { display: table-header-group; }
                    .items-table thead tr {
                        background: #2d7a6a; color: white;
                    }
                    .items-table thead th {
                        padding: 8px 12px; font-size: 11px;
                        font-weight: 700; text-transform: uppercase;
                        letter-spacing: 0.06em; text-align: left;
                    }
                    .items-table thead th.right { text-align: right; }
                    .items-table tbody tr { border-bottom: 1px solid #f0f0f0; page-break-inside: avoid; page-break-after: auto; }
                    .items-table tbody tr:last-child { border-bottom: none; }
                    .items-table tbody td {
                        padding: 8px 12px; font-size: 11px; color: #333;
                        vertical-align: top;
                    }
                    .items-table tbody td.right { text-align: right; }
                    .item-name { font-weight: 600; margin-bottom: 1px; }
                    .item-sub { font-size: 10px; color: #888; text-transform: uppercase; }
                    
                    .financials { display: flex; justify-content: flex-end; margin-top: 10px; border-top: 1px solid #e5e7eb; page-break-inside: avoid; }
                    .financials-box { width: 280px; padding: 12px 0; }
                    .fin-row { display: flex; justify-content: space-between; padding: 3px 12px; font-size: 12px; color: #444; }
                    .fin-row.discount { color: #2d7a6a; font-weight: 600; }
                    .fin-row.total {
                        background: #2d7a6a; color: white;
                        font-weight: 800; font-size: 14px;
                        margin-top: 4px; border-radius: 4px;
                        padding: 8px 12px;
                    }
                    .terms-block { margin-top: 30px; border-top: 1px solid #e5e7eb; padding-top: 15px; page-break-inside: avoid; }
                    .terms-title { font-weight: 700; font-size: 12px; margin-bottom: 4px; }
                    .terms-text { font-size: 11px; color: #666; line-height: 1.6; }
                    .sig-block { margin-top: 40px; display: flex; justify-content: flex-end; page-break-inside: avoid; }
                    .sig-line { border-top: 1px solid #999; width: 200px; padding-top: 6px; text-align: center; font-size: 11px; color: #888; }
                    @page { 
                        margin: 0.5in; 
                        size: letter; 
                    }
                }
            `}</style>

            {/* Header */}
            <div className="print-header">
                <div className="logo-block">
                    <img
                        src="/castile_white.png"
                        alt="Castile Logo"
                        className="logo-img"
                    />
                </div>
                <div className="company-block">
                    <div className="doc-title">{headerTitle}</div>
                    <div className="company-name">Castile Studio Inc</div>
                    <div className="company-sub">
                        <span style={{ color: "blue", textDecoration: "underline" }}>Adrian@castileusa.com</span> &middot;<br />
                        (786)-781-4383
                    </div>
                </div>
            </div>

            {/* Meta: Bill To + Order Info */}
            <div className="meta-grid">
                <div style={{ display: 'flex', gap: '56px' }}>
                    <div>
                        <div className="bill-to-label">{documentType === 'PURCHASE ORDER' ? "Vendor" : "Ship To"}</div>
                        <div className="bill-name">{clientName}</div>
                        <div className="bill-detail" style={{ whiteSpace: "pre-line" }}>
                            {shippingAddress || billingAddress || (documentType === 'PURCHASE ORDER' ? "Factory Direct" : "No shipping address provided")}
                        </div>
                    </div>
                    {documentType !== 'PURCHASE ORDER' && (
                        <div>
                            <div className="bill-to-label">Bill To</div>
                            <div className="bill-name">{clientName}</div>
                            <div className="bill-detail">
                                {clientCompany && <>{clientCompany}<br /></>}
                                {billingAddress && <span style={{ whiteSpace: "pre-line" }}>{billingAddress}<br /></span>}
                                {clientEmail && <>{clientEmail}<br /></>}
                                {clientPhone && <>{clientPhone}</>}
                            </div>
                        </div>
                    )}
                </div>
                <div className="meta-table">
                    <div className="meta-row">
                        <span className="meta-label">
                            {documentType === 'PURCHASE ORDER' ? "PO #" : isQuote ? "Quote #" : "Invoice #"}
                        </span>
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
                </div>
            </div>

            {/* Items Table */}
            <div className="print-container">
                {Array.from(new Set(items.map(i => i.room || 'General'))).map((roomName) => (
                    <div key={roomName} className="room-section">
                        <div className="room-header">Room: {roomName}</div>
                        <table className="items-table">
                            <thead>
                                <tr>
                                    <th style={{ width: 30 }}>#</th>
                                    <th>Description</th>
                                    <th className="right" style={{ width: 80 }}>Qty</th>
                                    {!isPresentation && <th className="right" style={{ width: 80 }}>Unit Price</th>}
                                    {!isPresentation && discount > 0 && <th className="right" style={{ width: 70 }}>Discount</th>}
                                    {!isPresentation && <th className="right" style={{ width: 90 }}>Amount</th>}
                                </tr>
                            </thead>
                            <tbody>
                                {items.filter(i => (i.room || 'General') === roomName).map((item, idx) => (
                                    <tr key={idx}>
                                        <td style={{ color: "#888" }}>{idx + 1}</td>
                                        <td>
                                            <div className="item-name">{item.productName}</div>
                                            {(item.colorName || item.size) && (
                                                <div className="item-sub">{[item.colorName, item.size].filter(Boolean).join(" • ")}</div>
                                            )}
                                        </td>
                                        <td className="right">
                                            {item.quantitySqft.toLocaleString()}
                                            <span style={{ fontSize: '9px', marginLeft: '4px', fontWeight: 700, color: '#666' }}>{item.unit || 'sqft'}</span>
                                        </td>
                                        {!isPresentation && <td className="right">${item.unitPrice.toFixed(2)}</td>}
                                        {!isPresentation && discount > 0 && (
                                            <td className="right" style={{ color: "#2d7a6a" }}>
                                                {item.discount && parseFloat(item.discount) > 0
                                                    ? `${item.discountType}${item.discount}`
                                                    : "—"}
                                            </td>
                                        )}
                                        {!isPresentation && (
                                        <td className="right" style={{ fontWeight: 600 }}>
                                            ${item.totalPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                        </td>
                                        )}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ))}
            </div>

            {/* Financials */}
            {!isPresentation && (
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
                    {tax > 0 && (
                        <div className="fin-row">
                            <span>Sales Tax (7%)</span>
                            <span>${tax.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                        </div>
                    )}
                    <div className="fin-row total">
                        <span>Total (USD)</span>
                        <span>${total.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                    </div>
                </div>
            </div>
            )}

            {/* Terms */}
            <div className="terms-block">
                <div className="terms-title">Terms and Conditions</div>
                <div className="terms-text">
                    Please make checks payable to: Castile Studio Inc.<br />
                    This quote is valid for 30 days from the date above. Prices subject to change thereafter.<br />
                    All sales final, otherwise 25% restocking fee could be applied.<br />
                    Product availability confirmed at time of order.<br />
                    Broken material must be reported maximum of 3 days after delivery date, installation means acceptance.
                </div>
            </div>

            {/* Signature */}
            <div className="sig-block">
                <div className="sig-line">customer signature</div>
            </div>

            <div className="page-footer-counter" />
        </div>
    );
}
