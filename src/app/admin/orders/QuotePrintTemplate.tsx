"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { QRCodeSVG } from 'qrcode.react';

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
    dbOrderId?: string;
    documentType?: 'QUOTE' | 'INVOICE' | 'PURCHASE ORDER';
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
    dbOrderId,
    documentType,
}: QuotePrintProps) {
    const [checkoutUrl, setCheckoutUrl] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        // Only generate for Quotes or Invoices that are NOT paid
        if (status !== 'Paid' && total > 0) {
            const fetchCheckoutUrl = async () => {
                setIsLoading(true);
                try {
                    const res = await fetch('/api/create-checkout', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            quoteId: dbOrderId || orderId,
                            amount: total,
                            clientName: clientName
                        })
                    });
                    const data = await res.json();
                    if (data.url) setCheckoutUrl(data.url);
                } catch (err) {
                    console.error('Error fetching checkout URL:', err);
                } finally {
                    setIsLoading(false);
                }
            };
            fetchCheckoutUrl();
        }
    }, [orderId, total, status, clientName]);

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
                        position: fixed;
                        top: 0; left: 0;
                        width: 100%; height: 100%;
                        background: white;
                        z-index: 9999;
                        padding: 40px 48px;
                        font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
                        color: #1a1a1a;
                        font-size: 14px;
                        box-sizing: border-box;
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
                    .company-sub { font-size: 12px; color: #555; line-height: 1.5; }
                    .logo-block { text-align: left; }
                    .logo-img { width: 220px; height: auto; object-fit: contain; mix-blend-mode: multiply; filter: contrast(1.1); }
                    .doc-title {
                        font-size: 36px; font-weight: 900; letter-spacing: 0.05em;
                        color: #1a1a1a; text-align: right; margin-bottom: 16px; line-height: 1;
                    }
                    .meta-grid {
                        display: flex;
                        justify-content: space-between;
                        align-items: flex-start;
                        margin-bottom: 24px;
                        padding-bottom: 20px;
                        border-bottom: 1px solid #e5e7eb;
                    }
                    .bill-to-label { font-size: 14px; color: #888; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 6px; }
                    .bill-name { font-size: 16px; font-weight: 700; color: #1a1a1a; margin-bottom: 2px; }
                    .bill-detail { font-size: 14px; color: #555; line-height: 1.6; }
                    .meta-table { text-align: right; }
                    .meta-row { display: flex; justify-content: flex-end; gap: 20px; margin-bottom: 4px; }
                    .meta-label { font-size: 14px; text-transform: uppercase; letter-spacing: 0.07em; color: #888; width: 70px; text-align: right; }
                    .meta-value { font-size: 14px; font-weight: 600; color: #1a1a1a; width: 90px; text-align: right; }
                    .items-table { width: 100%; border-collapse: collapse; margin-bottom: 0; }
                    .items-table thead tr {
                        background: #2d7a6a; color: white;
                    }
                    .items-table thead th {
                        padding: 10px 12px; font-size: 14px;
                        font-weight: 700; text-transform: uppercase;
                        letter-spacing: 0.06em; text-align: left;
                    }
                    .items-table thead th.right { text-align: right; }
                    .items-table tbody tr { border-bottom: 1px solid #f0f0f0; }
                    .items-table tbody tr:last-child { border-bottom: none; }
                    .items-table tbody td {
                        padding: 9px 12px; font-size: 14px; color: #333;
                        vertical-align: top;
                    }
                    .items-table tbody td.right { text-align: right; }
                    .item-name { font-weight: 600; margin-bottom: 2px; }
                    .item-sub { font-size: 14px; color: #888; text-transform: uppercase; letter-spacing: 0.04em; }
                    .financials { display: flex; justify-content: flex-end; margin-top: 0; border-top: 1px solid #e5e7eb; }
                    .financials-box { width: 320px; padding: 16px 0; }
                    .fin-row { display: flex; justify-content: space-between; padding: 5px 12px; font-size: 14px; color: #444; }
                    .fin-row.discount { color: #2d7a6a; font-weight: 600; }
                    .fin-row.total {
                        background: #2d7a6a; color: white;
                        font-weight: 800; font-size: 16px;
                        margin-top: 4px; border-radius: 4px;
                        padding: 10px 12px;
                    }
                    .terms-block { margin-top: 28px; border-top: 1px solid #e5e7eb; padding-top: 16px; }
                    .terms-title { font-weight: 700; font-size: 14px; margin-bottom: 6px; }
                    .terms-text { font-size: 14px; color: #666; line-height: 1.7; }
                    .sig-block { margin-top: 40px; display: flex; justify-content: flex-end; }
                    .sig-line { border-top: 1px solid #999; width: 220px; padding-top: 6px; text-align: center; font-size: 14px; color: #888; }
                    .payment-qr-container {
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        margin-top: 10px;
                        padding: 10px;
                        border: 1px solid #e5e7eb;
                        border-radius: 8px;
                        width: fit-content;
                        background: white;
                    }
                    .payment-qr-label {
                        font-size: 10px;
                        font-weight: 700;
                        text-transform: uppercase;
                        letter-spacing: 0.05em;
                        color: #2d7a6a;
                        margin-bottom: 4px;
                    }
                    .payment-qr-help {
                        font-size: 8px;
                        color: #888;
                        margin-top: 4px;
                    }
                    @page { margin: 0; size: letter; }
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
                    {/* QR Code in Header */}
                    {checkoutUrl && (
                        <div className="payment-qr-container" style={{ marginTop: '8px', marginLeft: 'auto' }}>
                            <div className="payment-qr-label">Scan to Pay Online</div>
                            <QRCodeSVG 
                                value={checkoutUrl} 
                                size={100} 
                                level="M"
                                includeMargin={false}
                            />
                            <div className="payment-qr-help">Secure payment via Stripe</div>
                        </div>
                    )}
                </div>
            </div>

            {/* Meta: Bill To + Order Info */}
            <div className="meta-grid">
                <div style={{ display: 'flex', gap: '56px' }}>
                    <div>
                        <div className="bill-to-label">Ship To</div>
                        <div className="bill-name">{clientName}</div>
                        <div className="bill-detail" style={{ whiteSpace: "pre-line" }}>
                            {shippingAddress || billingAddress || "No shipping address provided"}
                        </div>
                    </div>
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
                    Please make checks payable to: Castile Studio Inc.<br />
                    This quote is valid for 30 days from the date above. Prices subject to change thereafter.<br />
                    All sales final, otherwise 25% restocking fee could be applied.<br />
                    Product availability confirmed at time of order.<br />
                    Broken material must be reported maximum of 3 days after delivery date, installation means acceptance.
                </div>
            </div>

            {/* Signature */}
            <div className="sig-block" style={{ marginTop: '60px', display: 'flex', justifyContent: 'flex-end' }}>
                <div className="sig-line">customer signature</div>
            </div>
        </div>
    );
}
