"use client";
import React from "react";
import { QRCodeSVG } from "qrcode.react";

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
    imageUrl?: string;
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
    templateType?: 'order' | 'project';
    notes?: string;
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
    templateType = 'order',
    notes,
    }: QuotePrintProps) {
    const [stripeUrl, setStripeUrl] = React.useState<string>("");

    const isPaid = status === "Paid" || status === "Delivered";
    const isInvoice = documentType === "INVOICE" || isPaid || status === "Invoice Sent";
    const isQuote = !isInvoice && (status === "Quote");
    const headerTitle = documentType || (isInvoice ? "INVOICE" : "QUOTE");

    React.useEffect(() => {
        // Only fetch Stripe payment link if we have an orderId, we are not in presentation mode, and order is not yet paid
        if (orderId && !isPresentation && !isPaid && documentType !== 'PURCHASE ORDER' && templateType === 'order') {
            fetch("/api/create-checkout", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    quoteId: orderId,
                    displayId: orderId,
                    amount: total,
                    clientName: clientName
                })
            })
            .then(res => res.json())
            .then(data => {
                if (data.url) {
                    setStripeUrl(data.url);
                }
            })
            .catch(err => console.error("Error creating checkout session:", err));
        }
    }, [orderId, total, clientName, isPresentation, documentType, templateType, isPaid]);

    const orderDate = new Date(createdAt);
    const dueDate = new Date(createdAt);
    dueDate.setDate(dueDate.getDate() + 30);

    const fmt = (d: Date) =>
        d.toLocaleDateString("en-US", { year: "numeric", month: "2-digit", day: "2-digit" });

    const uniqueRooms = Array.from(new Set(items.map(i => i.room || 'General')));
    const hasMultipleRooms = uniqueRooms.length > 1;

    return (
        <div id="quote-print-template" className="quote-print-only">
            <style>{`
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
                    counter-increment: page;
                }
                .print-container {
                    padding: 0;
                    min-height: 280px;
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
                    size: auto;
                    margin: 0mm;
                }
                body {
                    margin: 0.8cm !important;
                }
                .print-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    margin-bottom: 24px;
                }
                .company-block { text-align: right; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; }
                .company-name {
                    font-size: 14px; font-weight: 700; color: #1a1a1a; margin-top: 5px; margin-bottom: 2px;
                }
                .company-sub { font-size: 12px; color: #555; line-height: 1.4; }
                .email-link {
                    color: #0066cc !important; text-decoration: underline; font-size: 12px; display: block; margin-bottom: 2px;
                }
                .phone-number {
                    color: #555555; font-size: 12px;
                }
                .logo-block { text-align: left; }
                .logo-img {
                    width: 250px;
                    height: auto;
                    object-fit: contain;
                    mix-blend-mode: multiply;
                }
                .doc-title {
                    font-size: 35px; font-weight: 800; letter-spacing: 0.05em;
                    color: #000000; text-align: right; margin-bottom: 4px; line-height: 1;
                }
                .meta-grid {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    margin-bottom: 24px;
                    padding-bottom: 12px;
                    border-bottom: 1px solid #e5e7eb;
                }
                .bill-to-label { font-size: 11px; color: #888; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 3px; }
                .bill-name { font-size: 16px; font-weight: 700; color: #1a1a1a; margin-bottom: 2px; }
                .bill-detail { font-size: 12px; color: #555; line-height: 1.4; }
                .meta-table { text-align: right; }
                .meta-row { display: flex; justify-content: flex-end; gap: 12px; margin-bottom: 2px; }
                .meta-label { font-size: 11px; text-transform: uppercase; letter-spacing: 0.07em; color: #888; width: 80px; text-align: right; }
                .meta-value { font-size: 13px; font-weight: 600; color: #1a1a1a; width: 100px; text-align: right; }
                
                .room-header {
                    background: #f8fafc;
                    padding: 4px 8px;
                    border-left: 3px solid #2d7a6a;
                    margin: 12px 0 6px 0;
                    font-size: 11px;
                    font-weight: 800;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                    color: #475569;
                }
 
                .items-table { width: 100%; border-collapse: collapse; margin-bottom: 10px; page-break-inside: auto; }
                .items-table thead { display: table-header-group; }
                .items-table thead tr {
                    background: transparent;
                    border-top: 1px solid #e5e7eb;
                    border-bottom: 1px solid #e5e7eb;
                }
                .items-table thead th {
                    padding: 6px 8px; font-size: 11px;
                    font-weight: 700; text-transform: uppercase;
                    letter-spacing: 0.08em; text-align: left;
                    color: #8c8c8c;
                }
                .items-table thead th.right { text-align: right; }
                .items-table tbody tr { border-bottom: 1px solid #f0f0f0; page-break-inside: avoid; page-break-after: auto; }
                .items-table tbody tr:last-child { border-bottom: none; }
                .items-table tbody td {
                    padding: 10px 8px; font-size: 11px; color: #333;
                    vertical-align: top;
                }
                .items-table tbody td.right { text-align: right; }
                .item-name { font-size: 13px; font-weight: 700; margin-bottom: 1px; color: #1a1a1a; }
                .item-sub { font-size: 10px; color: #888; text-transform: uppercase; margin-top: 2px; }
                
                .financials { display: flex; justify-content: space-between; margin-top: 8px; border-top: 1px solid #e5e7eb; page-break-inside: avoid; }
                .financials-box { width: 280px; padding: 6px 0; }
                .fin-row { display: flex; justify-content: space-between; padding: 3px 8px; font-size: 12px; color: #555; }
                .fin-row.discount { color: #2d7a6a; font-weight: 600; }
                .fin-row.total {
                    border-top: 1px solid #e5e7eb;
                    color: #1a1a1a;
                    font-weight: 800; font-size: 16px;
                    margin-top: 4px;
                    padding: 6px 8px 0 8px;
                }
                .terms-block { margin-top: 8px; border-top: 1px solid #e5e7eb; padding-top: 4px; page-break-inside: avoid; }
                .terms-title { font-weight: 700; font-size: 10px; margin-bottom: 2px; text-transform: uppercase; letter-spacing: 0.05em; color: #666; }
                .terms-text { font-size: 9.5px; color: #777; line-height: 1.3; }
                .sig-block { margin-top: 50px; display: flex; justify-content: flex-end; page-break-inside: avoid; }
                .sig-line { border-top: 1px solid #999; width: 180px; padding-top: 4px; text-align: center; font-size: 11px; color: #888; }
                .paid-stamp {
                    border: 3px double #10b981;
                    color: #10b981;
                    font-size: 14px;
                    font-weight: 900;
                    text-transform: uppercase;
                    padding: 3px 10px;
                    border-radius: 4px;
                    transform: rotate(-10deg);
                    opacity: 0.85;
                    letter-spacing: 0.15em;
                    font-family: 'Courier New', Courier, monospace;
                    pointer-events: none;
                    z-index: 10;
                    background: rgba(255, 255, 255, 0.9);
                    box-shadow: 0 0 4px rgba(16, 185, 129, 0.15);
                    display: inline-block;
                }
            `}</style>

            {templateType === 'project' ? (
                /* ==================== PROJECT / SPECBOOKS STYLE ==================== */
                <div className="specbooks-layout-view">
                    {/* Brand Header */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid #0f172a', paddingBottom: '10px', marginBottom: '14px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <img
                                src="/castile_logo_new.png"
                                alt="Castile Logo"
                                style={{ height: '55px', width: 'auto', objectFit: 'contain', mixBlendMode: 'multiply' }}
                            />
                            <div>
                                <div style={{ fontSize: '17px', fontWeight: 900, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '-0.02em' }}>Castile Studio Inc.</div>
                                <div style={{ fontSize: '10px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.15em', marginTop: '1px' }}>Architectural Surfaces</div>
                            </div>
                        </div>
                        <div style={{ textAlign: 'right', position: 'relative' }}>
                            {isPaid && (
                                <div className="paid-stamp" style={{ position: 'absolute', right: '0', top: '-25px' }}>
                                    Paid in Full
                                </div>
                            )}
                            <div style={{ fontSize: '19px', fontWeight: 955, color: '#0f172a', letterSpacing: '0.02em' }}>
                                {isPaid ? "INVOICE & SPECIFICATION" : isInvoice ? "SPECIFICATION & INVOICE" : "SPECIFICATION & ESTIMATE"}
                            </div>
                            <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
                                Date: {fmt(orderDate)} &middot; {(isPaid || isInvoice) ? "Invoice Reference" : "Quote Reference"}: {orderId}
                            </div>
                        </div>
                    </div>

                    {/* Metadata Grid */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '14px', borderBottom: '1px solid #f1f5f9', paddingBottom: '8px' }}>
                        <div>
                            <div style={{ fontSize: '10px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '3px' }}>SHIP TO / CLIENT</div>
                            <div style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a' }}>{clientName}</div>
                            <div style={{ fontSize: '12px', color: '#475569', marginTop: '2px', whiteSpace: 'pre-line' }}>{shippingAddress || billingAddress}</div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '10px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '3px' }}>BILL TO</div>
                            <div style={{ fontSize: '13px', color: '#475569', fontWeight: 600 }}>{clientName}</div>
                            {clientCompany && <div style={{ fontSize: '11px', color: '#64748b' }}>{clientCompany}</div>}
                            <div style={{ fontSize: '11px', color: '#64748b', marginTop: '1px' }}>{clientEmail}</div>
                            <div style={{ fontSize: '11px', color: '#64748b' }}>{clientPhone}</div>
                        </div>
                    </div>

                    {/* Room sections with image thumbnails */}
                    {uniqueRooms.map((roomName) => {
                        const displayRoomHeader = hasMultipleRooms || (roomName !== 'General' && roomName !== '');
                        return (
                            <div key={roomName} style={{ marginBottom: '14px', pageBreakInside: 'avoid' }}>
                                {displayRoomHeader && (
                                    <div style={{ display: 'flex', alignItems: 'center', borderBottom: '2px solid #0f172a', paddingBottom: '4px', marginBottom: '8px' }}>
                                        <div style={{ width: '3px', height: '16px', backgroundColor: '#2d7a6a', marginRight: '8px' }} />
                                        <span style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Room: {roomName}</span>
                                    </div>
                                )}
                                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                    <thead>
                                        <tr style={{ borderBottom: '2px solid #e2e8f0' }}>
                                            <th style={{ padding: '6px 4px', fontSize: '10px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', textAlign: 'left', width: '48px' }}>Image</th>
                                            <th style={{ padding: '6px', fontSize: '10px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', textAlign: 'left' }}>Specification</th>
                                            <th style={{ padding: '6px', fontSize: '10px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', textAlign: 'left', width: '100px' }}>Code</th>
                                            <th style={{ padding: '6px', fontSize: '10px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', textAlign: 'right', width: '70px' }}>QTY</th>
                                            {!isPresentation && <th style={{ padding: '6px', fontSize: '10px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', textAlign: 'right', width: '90px' }}>Unit Price</th>}
                                            {!isPresentation && <th style={{ padding: '6px', fontSize: '10px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', textAlign: 'right', width: '90px' }}>Amount</th>}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {items.filter(i => (i.room || 'General') === roomName).map((item, idx) => (
                                            <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                                <td style={{ padding: '6px 4px', verticalAlign: 'middle' }}>
                                                    <div style={{ width: '36px', height: '36px', borderRadius: '4px', border: '1px solid #e2e8f0', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f8fafc' }}>
                                                        {item.imageUrl ? (
                                                            <img src={item.imageUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                        ) : (
                                                            <svg style={{ width: '16px', height: '16px', color: '#cbd5e1' }} fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" /></svg>
                                                        )}
                                                    </div>
                                                </td>
                                                <td style={{ padding: '6px', verticalAlign: 'middle' }}>
                                                    <div style={{ fontSize: '13px', fontWeight: 700, color: '#1e293b' }}>{item.productName}</div>
                                                    {(item.colorName || item.size) && (
                                                        <div style={{ fontSize: '10px', color: '#64748b', marginTop: '1px', textTransform: 'uppercase' }}>{[item.colorName, item.size].filter(Boolean).join(" • ")}</div>
                                                    )}
                                                </td>
                                                <td style={{ padding: '6px', fontSize: '11px', fontFamily: 'monospace', color: '#475569', verticalAlign: 'middle' }}>
                                                    {item.productName.toUpperCase().includes('BRICK') && !item.colorName ? '2 1/2X10 BRICK' : (item.colorName ? item.productName.split(' ')[0] : 'SPEC')}
                                                </td>
                                                <td style={{ padding: '6px', fontSize: '13px', fontWeight: 700, color: '#1e293b', textAlign: 'right', verticalAlign: 'middle' }}>
                                                    {item.quantitySqft.toLocaleString()}
                                                    <span style={{ fontSize: '9px', fontWeight: 600, color: '#64748b', marginLeft: '3px' }}>{item.unit || 'sqft'}</span>
                                                </td>
                                                {!isPresentation && <td style={{ padding: '6px', fontSize: '12px', color: '#475569', textAlign: 'right', verticalAlign: 'middle' }}>${item.unitPrice.toFixed(2)}</td>}
                                                {!isPresentation && (
                                                    <td style={{ padding: '6px', fontSize: '13px', fontWeight: 700, color: '#1e293b', textAlign: 'right', verticalAlign: 'middle' }}>
                                                        ${item.totalPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                                    </td>
                                                )}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        );
                    })}

                    {/* Dark Footer Summary Block */}
                    {!isPresentation && (
                        <div style={{ backgroundColor: '#0f172a', borderRadius: '6px', padding: '12px', marginTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'white', pageBreakInside: 'avoid' }}>
                            <div style={{ fontSize: '10px', color: '#94a3b8', maxWidth: '380px', lineHeight: '1.3' }}>
                                {documentType === 'PURCHASE ORDER' ? (
                                    <>Please supply the materials specified above under agreed wholesale production terms.</>
                                ) : (
                                    <>
                                        Price valid for 30 days<br />
                                        Any case of brokerage or shortage must be informed within 5 business days from the date of delivery<br />
                                        Returns will have 25% restocking fee, the material must be sealed in box<br />
                                        Installation means acceptance
                                    </>
                                )}
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', minWidth: '220px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#94a3b8' }}>
                                    <span>Subtotal</span>
                                    <span style={{ color: 'white', fontWeight: 600 }}>${subtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#94a3b8', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '4px' }}>
                                    <span>Sales Tax (7%)</span>
                                    <span style={{ color: 'white', fontWeight: 600 }}>${tax.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 800, paddingTop: '2px' }}>
                                    <span>{documentType === 'PURCHASE ORDER' ? "Total Cost" : "Total Estimate"}</span>
                                    <span style={{ fontSize: '18px', fontWeight: 900, color: '#38bdf8' }}>${total.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            ) : (
                /* ==================== STANDARD BILLING / ORDER STYLE ==================== */
                <div className="order-layout-view">
                    {/* Header */}
                    <div className="print-header" style={{ position: "relative" }}>
                        {isPaid && (
                            <div className="paid-stamp" style={{ position: "absolute", left: "40%", top: "10px" }}>
                                Paid in Full
                            </div>
                        )}
                        <div className="logo-block">
                            <img
                                src="/castile_logo_new.png"
                                alt="Castile Logo"
                                className="logo-img"
                            />
                        </div>
                        <div className="company-block">
                            <div className="doc-title">{headerTitle}</div>
                            <div className="company-name">Castile Studio Inc</div>
                            <div className="company-sub">
                                <a href="mailto:Adrian@castileusa.com" className="email-link">Adrian@castileusa.com</a>
                                <div className="phone-number">(786)-781-4383</div>
                            </div>
                        </div>
                    </div>

                    {/* Meta: Bill To + Order Info */}
                    <div className="meta-grid">
                        <div style={{ display: 'flex', gap: '48px' }}>
                            {documentType === 'PURCHASE ORDER' ? (
                                <>
                                    <div>
                                        <div className="bill-to-label">Vendor</div>
                                        <div className="bill-name">{clientName}</div>
                                        <div className="bill-detail">
                                            Factory direct partner
                                        </div>
                                    </div>
                                    <div>
                                        <div className="bill-to-label">Bill To</div>
                                        <div className="bill-name">Castile Studio Inc.</div>
                                        <div className="bill-detail">
                                            Adrian@castileusa.com<br />
                                            (786)-781-4383
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <>
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
                                </>
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
                        {uniqueRooms.map((roomName) => {
                            const displayRoomHeader = hasMultipleRooms || (roomName !== 'General' && roomName !== '');
                            return (
                                <div key={roomName} className="room-section">
                                    {displayRoomHeader && <div className="room-header">Room: {roomName}</div>}
                                    <table className="items-table">
                                        <thead>
                                            <tr>
                                                <th style={{ width: 24 }}>#</th>
                                                <th>Description</th>
                                                <th className="right" style={{ width: 100 }}>QTY (SQFT)</th>
                                                {!isPresentation && <th className="right" style={{ width: 90 }}>Unit Price</th>}
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
                                                        <span style={{ fontSize: '9px', marginLeft: '3px', fontWeight: 700, color: '#666' }}>{item.unit || 'sqft'}</span>
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
                            );
                        })}
                    </div>

                    {/* Financials */}
                    {!isPresentation && (
                    <div className="financials" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginTop: "12px", borderTop: "1px solid #e5e7eb", paddingTop: "8px" }}>
                        {/* Stripe QR Code Block */}
                        {documentType !== 'PURCHASE ORDER' ? (
                            <div className="qr-block" style={{ border: "1px solid #e5e7eb", borderRadius: "8px", padding: "8px", display: "flex", flexDirection: "column", alignItems: "center", background: "#ffffff", width: "calc(3.8cm + 16px)", boxSizing: "border-box" }}>
                                {isPaid ? (
                                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "calc(3.8cm + 28px)", textAlign: "center" }}>
                                        <div style={{ width: "54px", height: "54px", borderRadius: "50%", backgroundColor: "#e6f4ea", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "8px" }}>
                                            <svg style={{ width: "30px", height: "30px", color: "#137333" }} fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                            </svg>
                                        </div>
                                        <div style={{ fontSize: "12px", fontWeight: 800, color: "#137333", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                                            Paid in Full
                                        </div>
                                        <div style={{ fontSize: "9px", color: "#5f6368", marginTop: "4px" }}>
                                            Thank you for your business!
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <div style={{ fontSize: "10px", fontWeight: 800, letterSpacing: "0.06em", color: "#1a1a1a", marginBottom: "6px", textTransform: "uppercase", textAlign: "center" }}>
                                            Scan to Pay
                                        </div>
                                        {stripeUrl ? (
                                            <>
                                                <QRCodeSVG 
                                                    value={stripeUrl} 
                                                    size={380} 
                                                    level="M" 
                                                    includeMargin={true} 
                                                    shapeRendering="crispEdges"
                                                    style={{ width: "3.8cm", height: "3.8cm", display: "block", shapeRendering: "crispEdges" }} 
                                                />
                                                <a 
                                                    href={stripeUrl} 
                                                    target="_blank" 
                                                    rel="noopener noreferrer" 
                                                    style={{ 
                                                        fontSize: "11px", 
                                                        fontWeight: "bold", 
                                                        color: "#0066cc", 
                                                        textDecoration: "underline", 
                                                        marginTop: "8px", 
                                                        textAlign: "center",
                                                        display: "block" 
                                                    }}
                                                >
                                                    Payment link here
                                                </a>
                                            </>
                                        ) : (
                                            <div style={{ width: "3.8cm", height: "3.8cm", display: "flex", alignItems: "center", justifyContent: "center", border: "1px dashed #ccc", borderRadius: "4px" }}>
                                                <span style={{ fontSize: "10px", color: "#888", textAlign: "center" }}>Generating QR...</span>
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        ) : <div />}

                        <div className="financials-box" style={{ width: "320px", padding: "6px 0" }}>
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
                                <span>{documentType === 'PURCHASE ORDER' ? "Total Cost (USD)" : "Total (USD)"}</span>
                                <span>${total.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                            </div>
                        </div>
                    </div>
                    )}
                </div>
            )}

            {/* Terms & Notes (Applies to standard order style) */}
            {documentType === 'PURCHASE ORDER' ? (
                notes ? (
                    <div className="terms-block">
                        <div className="terms-title">Notes / Instructions</div>
                        <div className="terms-text" style={{ whiteSpace: "pre-wrap" }}>
                            {notes}
                        </div>
                    </div>
                ) : null
            ) : (
                <div className="terms-block">
                    <div className="terms-title">Terms and Conditions</div>
                    <div className="terms-text">
                        Price valid for 30 days<br />
                        Any case of brokerage or shortage must be informed within 5 business days from the date of delivery<br />
                        Returns will have 25% restocking fee, the material must be sealed in box<br />
                        Installation means acceptance
                    </div>
                </div>
            )}

            {/* Signature block completely removed per user request */}

            <div className="page-footer-counter" />
        </div>
    );
}
