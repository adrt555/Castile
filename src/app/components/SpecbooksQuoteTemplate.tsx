"use client";

import React, { useState } from "react";
import { Plus, Trash2, Folder, Layers, DollarSign, Image as ImageIcon, MapPin, Calendar, FileText, Hash, Printer, Search } from "lucide-react";
import { crmProducts } from "@/lib/crmProducts";
import laufenProducts from "@/lib/laufenProducts.json";
import bathonomyProducts from "@/lib/bathonomyProducts.json";

const allProducts = [
  ...crmProducts.map(p => ({ ...p, unit: "SQFT" as const })),
  ...(laufenProducts as any[]).map(p => ({ ...p, unit: "PC" as const })),
  ...(bathonomyProducts as any[]).map(p => ({ ...p, unit: "PC" as const }))
];

type Item = {
  id: string;
  code: string;
  description: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  imageUrl?: string;
};

type Area = {
  id: string;
  name: string;
  phase: string;
  items: Item[];
};

interface Props {
  initialData?: any;
  clients?: any[];
  onSave?: (data: any, redirectToProjects?: boolean) => Promise<void> | void;
}

export default function SpecbooksQuoteTemplate({ initialData, clients = [], onSave }: Props = {}) {
  const [isSaving, setIsSaving] = useState(false);
  const [productSearch, setProductSearch] = useState<{ areaId: string, itemId: string, query: string, results: typeof allProducts } | null>(null);

  const [areas, setAreas] = useState<Area[]>(initialData?.areas || [
    {
      id: "area-1",
      name: "Master Bathroom",
      phase: "Phase 1: Wet Areas",
      items: [
        { id: "item-1", code: "RPMARCR2448PO", description: "Marmoris Cream 24x48 Polished", quantity: 310, unit: "SQFT", unitPrice: 2.98 },
        { id: "item-2", code: "DUNE-188464", description: "Theia Satin 35x35", quantity: 150, unit: "SQFT", unitPrice: 7.73 },
      ],
    },
  ]);

  const [metadata, setMetadata] = useState({
    clientId: initialData?.clientId || "",
    clientName: initialData?.client?.name || "John Doe Architecture",
    projectName: initialData?.name || "New Project Spec",
    projectAddress: initialData?.address || "123 Ocean Drive, Miami FL",
    date: initialData ? new Date(initialData.createdAt).toLocaleDateString() : new Date().toLocaleDateString(),
    quoteNumber: initialData?.projectNumber ? `PRJ-${initialData.projectNumber}` : "Draft",
    revision: "Rev 1",
  });

  const handleMetadataChange = (field: keyof typeof metadata, value: string) => {
    setMetadata({ ...metadata, [field]: value });
  };

  const handleAreaChange = (areaId: string, field: keyof Area, value: string) => {
    setAreas((prev) => prev.map((a) => (a.id === areaId ? { ...a, [field]: value } : a)));
  };

  const handleItemChange = (areaId: string, itemId: string, field: keyof Item, value: any) => {
    setAreas((prev) =>
      prev.map((a) => {
        if (a.id === areaId) {
          return {
            ...a,
            items: a.items.map((i) => (i.id === itemId ? { ...i, [field]: value } : i)),
          };
        }
        return a;
      })
    );
  };

  const addItem = (areaId: string) => {
    const newItem: Item = {
      id: `item-${Date.now()}`,
      code: "",
      description: "",
      quantity: 0,
      unit: "SQFT",
      unitPrice: 0,
    };
    setAreas((prev) => prev.map((a) => (a.id === areaId ? { ...a, items: [...a.items, newItem] } : a)));
  };

  const removeItem = (areaId: string, itemId: string) => {
    setAreas((prev) => prev.map((a) => (a.id === areaId ? { ...a, items: a.items.filter((i) => i.id !== itemId) } : a)));
  };

  const addArea = () => {
    const newArea: Area = {
      id: `area-${Date.now()}`,
      name: "New Area",
      phase: "Phase / Scope",
      items: [],
    };
    setAreas((prev) => [...prev, newArea]);
  };

  const removeArea = (areaId: string) => {
    setAreas((prev) => prev.filter((a) => a.id !== areaId));
  };

  const getAreaTotal = (area: Area) => {
    return area.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  };

  const subtotal = areas.reduce((sum, area) => sum + getAreaTotal(area), 0);
  const tax = subtotal * 0.07;
  const grandTotal = subtotal + tax;

  const handlePrint = () => {
    const printContent = document.getElementById("specbooks-template");
    if (!printContent) return;

    const iframe = document.createElement("iframe");
    iframe.style.position = "absolute";
    iframe.style.width = "0px";
    iframe.style.height = "0px";
    iframe.style.border = "none";
    document.body.appendChild(iframe);

    const iframeDoc = iframe.contentWindow?.document;
    if (!iframeDoc) return;

    // Grab the existing styles from the main document to keep Tailwind working
    const styles = Array.from(document.querySelectorAll('style, link[rel="stylesheet"]'))
      .map(s => s.outerHTML)
      .join('\n');

    iframeDoc.open();
    iframeDoc.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Specbooks Presentation</title>
          ${styles}
          <style>
            @page { margin: 0.5in; size: letter; }
            body { background: white !important; margin: 0; padding: 0; }
            * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
            
            /* Inputs look like text in print */
            input { border: none !important; background: transparent !important; box-shadow: none !important; outline: none !important; }
            
            /* Ensure the layout fits within the page */
            #specbooks-template { width: 100% !important; max-width: none !important; border: none !important; box-shadow: none !important; margin: 0 !important; padding: 0 !important; }
            
            /* Hide print controls */
            .print-hide, .print\\:hidden { display: none !important; }
          </style>
        </head>
        <body>
          ${printContent.outerHTML}
        </body>
      </html>
    `);
    iframeDoc.close();

    // Small delay to ensure CSS is parsed inside iframe before printing
    setTimeout(() => {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
      
      // Cleanup after print dialog closes (safeguard)
      setTimeout(() => {
        if (document.body.contains(iframe)) {
          document.body.removeChild(iframe);
        }
      }, 1000);
    }, 250);
  };

  const handleImageUpload = async (areaId: string, itemId: string, code: string, file?: File) => {
    if (!file) return;
    if (!code) {
      alert("Please enter an Item Code first so the image can be saved to the product.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("sku", code);

    try {
      const res = await fetch("/api/upload-product-image", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.url) {
        // Append timestamp to bypass browser cache
        handleItemChange(areaId, itemId, "imageUrl", `${data.url}?t=${Date.now()}`);
      }
    } catch (e) {
      console.error(e);
      alert("Failed to upload image.");
    }
  };

  const handleItemSearch = (areaId: string, itemId: string, query: string) => {
    handleItemChange(areaId, itemId, "code", query);

    if (query.length < 2) {
      setProductSearch(null);
      // Optimistically guess the image path if they just typed a code
      const safeSku = query.replace(/[^a-zA-Z0-9_-]/g, "");
      handleItemChange(areaId, itemId, "imageUrl", query ? `/api/product-image/${safeSku}` : "");
      return;
    }

    const lowerQuery = query.toLowerCase();
    const words = lowerQuery.split(/\s+/).filter(Boolean);
    const results = words.length === 0 ? [] : allProducts.filter(p => {
      const searchStr = `${p.sku || ''} ${p.name || ''} ${p.collection || ''} ${p.category || ''} ${p.size || ''} ${p.description || ''}`.toLowerCase();
      return words.every(word => searchStr.includes(word));
    }).slice(0, 8); // top 8 results

    setProductSearch({ areaId, itemId, query, results });
  };

  const selectProduct = (areaId: string, itemId: string, product: typeof allProducts[0]) => {
    handleItemChange(areaId, itemId, "code", product.sku);
    handleItemChange(areaId, itemId, "description", product.name);
    handleItemChange(areaId, itemId, "unitPrice", product.sellingPricePerSqft);
    handleItemChange(areaId, itemId, "unit", product.unit);
    
    // Guess image
    const safeSku = product.sku.replace(/[^a-zA-Z0-9_-]/g, "");
    handleItemChange(areaId, itemId, "imageUrl", `/api/product-image/${safeSku}`);
    
    setProductSearch(null);
  };

  const handleSaveData = async (redirectToProjects = false) => {
    if (!onSave) return;
    setIsSaving(true);
    const data = {
      clientId: metadata.clientId,
      clientName: metadata.clientName,
      name: metadata.projectName,
      address: metadata.projectAddress,
      total: grandTotal,
      areas: areas.map(a => ({
        ...a,
      })),
    };
    try {
      await onSave(data, redirectToProjects);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f9fafb] p-8 text-slate-800 font-sans print:hidden">
      <div id="specbooks-template" className="max-w-6xl mx-auto bg-white border border-slate-200 shadow-sm rounded-xl overflow-hidden">
        
        {/* BRAND HEADER */}
        <header className="border-b border-slate-200 p-8 lg:p-12 print:p-6 bg-white">
          <div className="flex flex-col lg:flex-row justify-between items-start gap-8 print:flex-row">
            <div className="space-y-6 flex-1">
              {/* Logo Placeholder */}
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-slate-900 rounded flex items-center justify-center">
                  <Layers className="text-white w-6 h-6" />
                </div>
                <div>
                  <h1 className="text-2xl font-black tracking-tight text-slate-900 uppercase">Castile Studio Inc.</h1>
                  <p className="text-xs font-semibold tracking-widest text-slate-400 uppercase">Architectural Surfaces</p>
                </div>
              </div>

              {/* Project Meta Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 print:gap-4">
                <div className="group border-b border-transparent hover:border-slate-200 focus-within:border-slate-400 transition-colors">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                    <Folder className="w-3.5 h-3.5" /> Client Name
                  </div>
                  {metadata.clientId ? (
                    <>
                      <span className="hidden print:inline text-sm font-semibold text-slate-800">
                        {clients.find(c => c.id === metadata.clientId)?.name || metadata.clientName}
                      </span>
                      <select
                        value={metadata.clientId}
                        onChange={(e) => {
                          const selectedClient = clients.find(c => c.id === e.target.value);
                          if (selectedClient) {
                            handleMetadataChange("clientId", selectedClient.id);
                            handleMetadataChange("clientName", selectedClient.name);
                          }
                        }}
                        className="w-full bg-transparent text-sm print:hidden font-semibold text-slate-800 outline-none cursor-pointer"
                      >
                        <option value="" disabled>Select a Client</option>
                        {clients.map(c => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                    </>
                  ) : (
                    <>
                      <span className="hidden print:inline text-sm font-semibold text-slate-800 whitespace-pre-wrap">
                        {metadata.clientName}
                      </span>
                      <textarea
                        value={metadata.clientName}
                        onChange={(e) => handleMetadataChange("clientName", e.target.value)}
                        rows={2}
                        className="w-full bg-transparent text-sm print:hidden font-semibold text-slate-800 outline-none placeholder:text-slate-300 resize-none overflow-hidden"
                        placeholder="Enter Client Name"
                      />
                    </>
                  )}
                </div>
                <div className="group border-b border-transparent hover:border-slate-200 focus-within:border-slate-400 transition-colors">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                    <MapPin className="w-3.5 h-3.5" /> Project Location
                  </div>
                  <span className="hidden print:inline text-sm font-semibold text-slate-800 whitespace-pre-wrap">
                    {metadata.projectAddress}
                  </span>
                  <textarea
                    value={metadata.projectAddress}
                    onChange={(e) => handleMetadataChange("projectAddress", e.target.value)}
                    rows={2}
                    className="w-full bg-transparent text-sm print:hidden font-semibold text-slate-800 outline-none placeholder:text-slate-300 resize-none overflow-hidden"
                    placeholder="Enter Project Address"
                  />
                </div>
              </div>
            </div>

            {/* Document Info */}
            <div className="bg-slate-50 p-6 print:p-4 rounded-lg border border-slate-100 min-w-[280px] print:min-w-[200px]">
              <div className="text-[10px] print:text-[9px] font-black text-slate-400 uppercase tracking-widest mb-4">Specification & Quote</div>
              <div className="space-y-3">
                <div className="flex justify-between items-center group">
                  <span className="flex items-center gap-1.5 text-xs font-bold text-slate-500 uppercase"><FileText className="w-3.5 h-3.5"/> Quote #</span>
                  <span className="hidden print:inline text-right text-sm font-bold text-slate-900">
                    {metadata.quoteNumber}
                  </span>
                  <input 
                    value={metadata.quoteNumber} 
                    onChange={(e) => handleMetadataChange("quoteNumber", e.target.value)}
                    className="text-right bg-transparent text-sm font-bold text-slate-900 outline-none hover:bg-white focus:bg-white rounded px-1 -mr-1 print:hidden" 
                  />
                </div>
                <div className="flex justify-between items-center group">
                  <span className="flex items-center gap-1.5 text-xs font-bold text-slate-500 uppercase"><Calendar className="w-3.5 h-3.5"/> Date</span>
                  <span className="hidden print:inline text-right text-sm font-semibold text-slate-700">
                    {metadata.date}
                  </span>
                  <input 
                    value={metadata.date} 
                    onChange={(e) => handleMetadataChange("date", e.target.value)}
                    className="text-right bg-transparent text-sm font-semibold text-slate-700 outline-none hover:bg-white focus:bg-white rounded px-1 -mr-1 print:hidden" 
                  />
                </div>
                <div className="flex justify-between items-center group">
                  <span className="flex items-center gap-1.5 text-xs font-bold text-slate-500 uppercase"><Layers className="w-3.5 h-3.5"/> Project Name</span>
                  <span className="hidden print:inline text-right text-sm font-semibold text-slate-700">
                    {metadata.projectName}
                  </span>
                  <input 
                    value={metadata.projectName} 
                    onChange={(e) => handleMetadataChange("projectName", e.target.value)}
                    className="text-right bg-transparent text-sm font-semibold text-slate-700 outline-none hover:bg-white focus:bg-white rounded px-1 -mr-1 print:hidden" 
                    placeholder="Enter Project Name"
                  />
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* AREAS AND ITEMS */}
        <div className="p-8 lg:p-12 space-y-12">
          {areas.map((area) => (
            <section key={area.id} className="relative group">
              
              {/* Area Header */}
              <div className="flex justify-between items-end mb-6 border-b-2 border-slate-900 pb-4">
                <div className="flex-1">
                  <div className="inline-flex items-center bg-slate-100 rounded text-slate-500 text-[10px] font-bold uppercase tracking-widest px-2 py-1 mb-2 hover:bg-slate-200 transition-colors focus-within:bg-slate-200">
                    <span className="hidden print:inline">
                      {area.phase}
                    </span>
                    <input
                      value={area.phase}
                      onChange={(e) => handleAreaChange(area.id, "phase", e.target.value)}
                      className="bg-transparent outline-none w-auto min-w-[150px] print:hidden"
                      placeholder="e.g. Phase 1"
                    />
                  </div>
                  <span className="hidden print:block text-2xl font-black text-slate-900 tracking-tight">
                    {area.name}
                  </span>
                  <input
                    value={area.name}
                    onChange={(e) => handleAreaChange(area.id, "name", e.target.value)}
                    className="block w-full bg-transparent text-2xl font-black text-slate-900 tracking-tight outline-none placeholder:text-slate-300 print:hidden"
                    placeholder="Enter Area Name (e.g., Master Bathroom)"
                  />
                </div>
                <div className="text-right">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Area Subtotal</div>
                  <div className="text-xl font-bold text-slate-800">${getAreaTotal(area).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                </div>
              </div>

              {/* Items Grid */}
              <div className="space-y-4 print:space-y-2">
                {/* Headers */}
                <div className="hidden lg:grid print:grid grid-cols-[80px_2fr_1fr_100px_80px_100px_120px_40px] print:grid-cols-[50px_2fr_1.5fr_50px_40px_70px_80px] gap-4 print:gap-4 px-4 print:px-2 text-[10px] print:text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  <div>Image</div>
                  <div>Specification</div>
                  <div>Code</div>
                  <div className="text-right">Qty</div>
                  <div>Unit</div>
                  <div className="text-right">Price</div>
                  <div className="text-right">Total</div>
                  <div></div>
                </div>

                {area.items.map((item) => (
                  <div key={item.id} className="grid grid-cols-1 lg:grid-cols-[80px_2fr_1fr_100px_80px_100px_120px_40px] print:grid-cols-[50px_2fr_1.5fr_50px_40px_70px_80px] gap-4 print:gap-4 items-center bg-white border border-slate-200 rounded-lg p-4 transition-all hover:shadow-md hover:border-slate-300 group/item print:p-2 print:border-b print:border-slate-200 print:rounded-none">
                    {/* Image Spec */}
                    <label className="w-20 h-20 print:w-12 print:h-12 bg-slate-100 rounded border border-slate-200 flex items-center justify-center shrink-0 cursor-pointer overflow-hidden relative group/img">
                      {item.imageUrl ? (
                        <img 
                          src={item.imageUrl} 
                          alt="Product" 
                          className="w-full h-full object-cover" 
                          onError={(e) => {
                            // If the guessed image fails to load, clear it so we show the placeholder
                            handleItemChange(area.id, item.id, "imageUrl", "");
                          }}
                        />
                      ) : (
                        <ImageIcon className="w-6 h-6 print:w-4 print:h-4 text-slate-300" />
                      )}
                      
                      {/* Upload Overlay */}
                      <div className="absolute inset-0 bg-black/40 hidden group-hover/img:flex items-center justify-center print:hidden">
                        <span className="text-white text-[10px] font-bold uppercase tracking-wider text-center">Upload<br/>Image</span>
                      </div>
                      
                      <input 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        onChange={(e) => handleImageUpload(area.id, item.id, item.code, e.target.files?.[0])}
                      />
                    </label>

                    {/* Description */}
                    <div>
                      <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1 lg:hidden print:hidden">Description</div>
                      <span className="hidden print:inline text-sm font-semibold text-slate-800 whitespace-pre-wrap">
                        {item.description}
                      </span>
                      <textarea
                        value={item.description}
                        onChange={(e) => handleItemChange(area.id, item.id, "description", e.target.value)}
                        rows={2}
                        className="w-full bg-transparent text-sm print:hidden font-semibold text-slate-800 outline-none placeholder:text-slate-300 resize-none overflow-hidden"
                        placeholder="Item Description"
                      />
                    </div>

                    {/* Code */}
                    <div className="relative">
                      <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1 lg:hidden print:hidden">Item Code</div>
                      <span className="hidden print:inline text-xs font-mono text-slate-500 uppercase">
                        {item.code}
                      </span>
                      <div className="relative flex items-center group/search print:hidden">
                        <Search className="w-3.5 h-3.5 text-slate-400 absolute left-0" />
                        <input
                          value={item.code}
                          onChange={(e) => handleItemSearch(area.id, item.id, e.target.value)}
                          onFocus={(e) => {
                            if (e.target.value.length >= 2) handleItemSearch(area.id, item.id, e.target.value);
                          }}
                          onBlur={() => setTimeout(() => setProductSearch(null), 200)}
                          className="w-full bg-transparent text-xs font-mono text-slate-500 outline-none placeholder:text-slate-300 uppercase pl-5"
                          placeholder="SEARCH..."
                        />
                      </div>

                      {/* Dropdown Search Results */}
                      {productSearch?.areaId === area.id && productSearch?.itemId === item.id && productSearch.results.length > 0 && (
                        <div className="absolute top-full left-0 mt-1 w-72 bg-white border border-slate-200 shadow-xl rounded-lg z-50 overflow-hidden print:hidden">
                          {productSearch.results.map(product => (
                            <button
                              key={product.id}
                              onClick={() => selectProduct(area.id, item.id, product)}
                              className="w-full text-left px-4 py-2 hover:bg-slate-50 border-b border-slate-100 last:border-0 flex flex-col gap-0.5"
                            >
                              <div className="flex justify-between items-center">
                                <span className="text-xs font-bold text-slate-900">{product.sku}</span>
                                <span className="text-[10px] font-bold text-amber-600">${product.sellingPricePerSqft.toFixed(2)}/{product.unit.toLowerCase()}</span>
                              </div>
                              <div className="text-[10px] text-slate-500 truncate">{product.name}</div>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Qty */}
                    <div>
                      <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1 lg:hidden print:hidden">Qty</div>
                      <span className="hidden print:block text-sm font-semibold text-slate-800 text-right">
                        {item.quantity}
                      </span>
                      <input
                        type="number"
                        value={item.quantity || ""}
                        onChange={(e) => handleItemChange(area.id, item.id, "quantity", parseFloat(e.target.value) || 0)}
                        className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1.5 text-sm font-semibold text-slate-800 text-right outline-none focus:border-slate-400 focus:bg-white transition-colors print:hidden"
                        placeholder="0"
                      />
                    </div>

                    {/* Unit */}
                    <div>
                      <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1 lg:hidden print:hidden">Unit</div>
                      <span className="hidden print:inline text-xs font-bold text-slate-700 uppercase">
                        {item.unit === "PC" ? "pieces" : item.unit}
                      </span>
                      <select
                        value={item.unit}
                        onChange={(e) => handleItemChange(area.id, item.id, "unit", e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1.5 text-xs font-bold text-slate-700 outline-none focus:border-slate-400 focus:bg-white transition-colors cursor-pointer print:hidden"
                      >
                        <option value="SQFT">SQFT</option>
                        <option value="PC">pieces</option>
                      </select>
                    </div>

                    {/* Price */}
                    <div>
                      <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1 lg:hidden print:hidden">Unit Price</div>
                      <span className="hidden print:block text-sm font-semibold text-slate-800 text-right">
                        ${item.unitPrice ? item.unitPrice.toFixed(2) : "0.00"}
                      </span>
                      <div className="relative print:hidden">
                        <span className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400 text-sm">$</span>
                        <input
                          type="number"
                          value={item.unitPrice || ""}
                          onChange={(e) => handleItemChange(area.id, item.id, "unitPrice", parseFloat(e.target.value) || 0)}
                          className="w-full bg-slate-50 border border-slate-200 rounded pl-6 pr-2 py-1.5 text-sm font-semibold text-slate-800 text-right outline-none focus:border-slate-400 focus:bg-white transition-colors"
                          placeholder="0.00"
                        />
                      </div>
                    </div>

                    {/* Line Total */}
                    <div className="text-right lg:pr-4">
                      <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1 lg:hidden print:hidden">Line Total</div>
                      <div className="text-sm print:text-sm font-bold text-slate-900 bg-slate-50 py-1.5 px-3 rounded border border-slate-100 print:bg-transparent print:border-none print:px-0">
                        ${(item.quantity * item.unitPrice).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end print:hidden">
                      <button 
                        onClick={() => removeItem(area.id, item.id)}
                        className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded transition-colors opacity-0 group-hover/item:opacity-100 focus:opacity-100"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Area Controls */}
              <div className="mt-4 flex gap-3 print:hidden opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => addItem(area.id)}
                  className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Specification Line
                </button>
                <button
                  onClick={() => removeArea(area.id)}
                  className="flex items-center gap-1.5 text-xs font-bold text-red-500 hover:text-red-700 hover:bg-red-50 px-3 py-1.5 rounded transition-colors ml-auto"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Remove Area
                </button>
              </div>
            </section>
          ))}

          {/* Add Area Button */}
          <div className="pt-6 border-t border-slate-200 border-dashed print:hidden">
            <button
              onClick={addArea}
              className="flex items-center justify-center gap-2 w-full py-4 rounded-lg border-2 border-dashed border-slate-300 text-slate-500 hover:text-slate-900 hover:border-slate-400 hover:bg-slate-50 transition-all font-bold text-sm"
            >
              <Plus className="w-5 h-5" /> Add New Architectural Area
            </button>
          </div>
        </div>

        {/* GRAND TOTAL SUMMARY */}
        <footer className="bg-slate-900 text-white p-8 lg:p-12 mt-8">
          <div className="flex flex-col lg:flex-row justify-between items-center gap-8 print:flex-row">
            <div className="text-slate-400 text-sm max-w-md">
              <p>Prices are valid for 30 days. Please review all specifications carefully. Lead times vary by product and availability.</p>
            </div>
            <div className="bg-white/10 rounded-xl p-6 min-w-[300px] border border-white/20 space-y-3">
              <div className="flex justify-between items-center text-slate-300 text-xs font-bold uppercase tracking-widest">
                <span>Subtotal</span>
                <span className="font-semibold text-white">${subtotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between items-center text-slate-300 text-xs font-bold uppercase tracking-widest border-b border-white/10 pb-2">
                <span>Sales Tax (7%)</span>
                <span className="font-semibold text-white">${tax.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between items-center text-slate-300 text-xs font-bold uppercase tracking-widest pt-1">
                <span className="flex items-center gap-1.5"><DollarSign className="w-4 h-4" /> Total Estimate</span>
                <span className="text-2xl font-black text-white">${grandTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
            </div>
          </div>
        </footer>

      </div>

      {/* Floating Actions */}
      <div className="fixed bottom-8 right-8 flex gap-4 print:hidden z-50">
        {onSave && (
          <>
            <button
              onClick={() => handleSaveData(true)}
              disabled={isSaving}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-4 rounded-full shadow-xl transition-all active:scale-95 flex items-center justify-center font-bold text-sm disabled:opacity-50 gap-2 border border-emerald-500/20"
            >
              {isSaving ? "Saving..." : "Save & Exit to Projects"}
            </button>
            <button
              onClick={() => handleSaveData(false)}
              disabled={isSaving}
              className="bg-amber-600 hover:bg-amber-700 text-white px-6 py-4 rounded-full shadow-xl transition-all active:scale-95 flex items-center justify-center font-bold text-sm disabled:opacity-50 border border-amber-500/20"
            >
              {isSaving ? "Saving..." : "Save Project"}
            </button>
          </>
        )}
        <button
          onClick={handlePrint}
          className="bg-slate-900 text-white p-4 rounded-full shadow-xl hover:bg-slate-800 transition-colors flex items-center justify-center group"
        >
          <Printer className="w-6 h-6" />
          <span className="max-w-0 overflow-hidden whitespace-nowrap group-hover:max-w-xs transition-all duration-300 ease-in-out pl-0 group-hover:pl-3 font-bold text-sm">
            Print Presentation
          </span>
        </button>
      </div>
    </div>
  );
}
