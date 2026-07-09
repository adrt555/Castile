"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { getClients, createClient } from "@/app/actions/clientActions";
import { Client } from "@/lib/types";

export default function ClientDirectory() {
    const [clients, setClients] = useState<Client[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showCreateClient, setShowCreateClient] = useState(false);
    const [newClientFirstName, setNewClientFirstName] = useState("");
    const [newClientLastName, setNewClientLastName] = useState("");
    const [newClientPhone, setNewClientPhone] = useState("");
    const [newClientCompany, setNewClientCompany] = useState("");
    const [newClientEmail, setNewClientEmail] = useState("");
    const [newClientType, setNewClientType] = useState("Homeowner");
    const [newClientAddress, setNewClientAddress] = useState("");
    const [newClientBilling, setNewClientBilling] = useState("");
    const [addressSuggestions, setAddressSuggestions] = useState<any[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [createError, setCreateError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const loadClients = () => {
        setIsLoading(true);
        getClients().then(data => {
            setClients(data as any);
            setIsLoading(false);
        });
    };

    useEffect(() => { loadClients(); }, []);

    const handleAddressChange = async (val: string) => {
        setNewClientAddress(val);
        if (val.length > 3) {
            try {
                const res = await fetch(`https://photon.komoot.io/api/?q=${encodeURIComponent(val)}&limit=5`);
                const data = await res.json();
                setAddressSuggestions(data.features || []);
                setShowSuggestions(true);
            } catch (err) {
                console.error("Error fetching addresses:", err);
            }
        } else {
            setAddressSuggestions([]);
            setShowSuggestions(false);
        }
    };

    const selectAddress = (feature: any) => {
        const props = feature.properties;
        const street = props.name || "";
        const city = props.city || props.town || "";
        const state = props.state || "";
        const postCode = props.postcode || "";
        
        // Format: Street, City, State Zip
        const fullAddress = `${street}${city ? ', ' + city : ''}${state ? ', ' + state : ''}${postCode ? ' ' + postCode : ''}`;
        setNewClientAddress(fullAddress);
        setShowSuggestions(false);
    };

    const handleCreateClient = async () => {
        setCreateError("");
        const fullName = `${newClientFirstName} ${newClientLastName}`.trim();
        
        if (!fullName) {
            setCreateError("First name or last name is required.");
            return;
        }

        setIsSubmitting(true);
        try {
            await createClient({
                name: fullName,
                company: newClientCompany || "",
                email: newClientEmail || `client${Date.now()}@castileusa.com`,
                phone: newClientPhone || "",
                type: newClientType,
                address: newClientAddress || undefined,
                billingAddress: newClientBilling || undefined,
            });
            setShowCreateClient(false);
            setNewClientFirstName(''); setNewClientLastName(''); setNewClientPhone('');
            setNewClientCompany(''); setNewClientEmail(''); setNewClientAddress(''); setNewClientBilling('');
            loadClients();
        } catch (err: any) {
            console.error("Error creating client:", err);
            setCreateError(err.message || "Failed to create client. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return <div className="text-zinc-500 font-medium">Loading clients...</div>;
    }

    return (
        <div className="max-w-6xl mx-auto space-y-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-end px-1 sm:px-0">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900">Client Directory</h1>
                    <p className="text-zinc-500 mt-1 text-xs sm:text-sm">Manage relationships with designers, contractors, and consumers.</p>
                </div>
                <button onClick={() => setShowCreateClient(true)} className="w-full sm:w-auto bg-zinc-900 text-white px-6 py-3 sm:py-2 rounded-xl text-sm font-bold hover:bg-zinc-800 transition-all shadow-lg active:scale-95">
                    + Add Client
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 px-1 sm:px-0">
                {clients.map(client => (
                    <div key={client.id} className="bg-white border border-zinc-200 p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow relative group">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="font-bold text-zinc-900 text-lg">{client.name}</h3>
                                <p className="text-zinc-500 text-sm font-medium">{client.company}</p>
                            </div>
                            <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider
                  ${client.type === 'Designer' ? 'bg-fuchsia-100 text-fuchsia-700' : ''}
                  ${client.type === 'Contractor' ? 'bg-amber-100 text-amber-700' : ''}
                  ${client.type === 'Homeowner' ? 'bg-emerald-100 text-emerald-700' : ''}
                  ${client.type === 'Architect' ? 'bg-indigo-100 text-indigo-700' : ''}
               `}>
                                {client.type}
                            </span>
                        </div>

                        <div className="space-y-2 mb-6">
                            <div className="flex items-center text-sm text-zinc-600">
                                <span className="w-5 text-zinc-400">📧</span>
                                <a href={`mailto:${client.email}`} className="hover:text-blue-600 transition-colors">{client.email}</a>
                            </div>
                            <div className="flex items-center text-sm text-zinc-600">
                                <span className="w-5 text-zinc-400">📞</span>
                                <a href={`tel:${client.phone}`} className="hover:text-blue-600 transition-colors">{client.phone}</a>
                            </div>
                        </div>

                        <div className="pt-4 border-t border-zinc-100 grid grid-cols-2 gap-4">
                            <div>
                                <div className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Lifetime Value</div>
                                <div className="font-bold text-zinc-900 text-sm">${client.totalSpent.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
                            </div>
                            <div>
                                <div className="text-[10px] text-amber-500 font-bold uppercase tracking-wider">Available Credit</div>
                                <div className="font-bold text-amber-600 text-sm">${(client.commissionCredits || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
                            </div>
                        </div>

                        <div className="mt-4 flex gap-2">
                            <Link 
                                href={`/admin/clients/${client.id}/commissions`}
                                className="flex-1 text-center text-xs font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 py-2 rounded-lg transition-colors border border-amber-100"
                            >
                                💰 Commission
                            </Link>
                            <button className="flex-1 text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 py-2 rounded-lg transition-colors border border-blue-100">
                                View History
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Create New Client Modal */}
            {showCreateClient && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
                    onClick={(e) => { if (e.target === e.currentTarget) setShowCreateClient(false); }}>
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden">
                        <div className="bg-zinc-900 px-8 py-5 flex justify-between items-center">
                            <div>
                                <h2 className="text-white font-bold text-lg tracking-tight">Create New Client</h2>
                                <p className="text-zinc-400 text-xs mt-0.5">All fields are optional except email</p>
                            </div>
                            <button type="button" onClick={() => setShowCreateClient(false)} className="text-zinc-400 hover:text-white transition-colors text-xl leading-none">✕</button>
                        </div>
                        <div className="p-8 space-y-5">
                            {createError && (
                                <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 text-xs font-bold rounded-lg">
                                    ⚠️ {createError}
                                </div>
                            )}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wide text-zinc-500 mb-1.5">First Name</label>
                                    <input type="text" value={newClientFirstName} onChange={(e) => setNewClientFirstName(e.target.value)} placeholder="John" className="w-full bg-zinc-50 border border-zinc-200 text-zinc-900 text-sm rounded-lg focus:ring-amber-500 focus:border-amber-500 block p-3 outline-none" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wide text-zinc-500 mb-1.5">Last Name</label>
                                    <input type="text" value={newClientLastName} onChange={(e) => setNewClientLastName(e.target.value)} placeholder="Smith" className="w-full bg-zinc-50 border border-zinc-200 text-zinc-900 text-sm rounded-lg focus:ring-amber-500 focus:border-amber-500 block p-3 outline-none" />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wide text-zinc-500 mb-1.5">Phone Number</label>
                                    <input type="tel" value={newClientPhone} onChange={(e) => setNewClientPhone(e.target.value)} placeholder="305-555-0100" className="w-full bg-zinc-50 border border-zinc-200 text-zinc-900 text-sm rounded-lg focus:ring-amber-500 focus:border-amber-500 block p-3 outline-none" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wide text-zinc-500 mb-1.5">Company Name</label>
                                    <input type="text" value={newClientCompany} onChange={(e) => setNewClientCompany(e.target.value)} placeholder="Acme Corp" className="w-full bg-zinc-50 border border-zinc-200 text-zinc-900 text-sm rounded-lg focus:ring-amber-500 focus:border-amber-500 block p-3 outline-none" />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wide text-zinc-500 mb-1.5">Email Address</label>
                                    <input type="email" value={newClientEmail} onChange={(e) => setNewClientEmail(e.target.value)} placeholder="john@example.com" className="w-full bg-zinc-50 border border-zinc-200 text-zinc-900 text-sm rounded-lg focus:ring-amber-500 focus:border-amber-500 block p-3 outline-none" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wide text-zinc-500 mb-1.5">Client Type</label>
                                    <select value={newClientType} onChange={(e) => setNewClientType(e.target.value)} className="w-full bg-zinc-50 border border-zinc-200 text-zinc-900 text-sm rounded-lg focus:ring-amber-500 focus:border-amber-500 block p-3 outline-none">
                                        <option value="Homeowner">Homeowner</option>
                                        <option value="Contractor">Contractor</option>
                                        <option value="Designer">Designer</option>
                                        <option value="Architect">Architect</option>
                                    </select>
                                </div>
                            </div>
                            <div className="relative">
                                <label className="block text-xs font-bold uppercase tracking-wide text-zinc-500 mb-1.5">Delivery Address</label>
                                <textarea 
                                    value={newClientAddress} 
                                    onChange={(e) => handleAddressChange(e.target.value)} 
                                    onFocus={() => { if (addressSuggestions.length > 0) setShowSuggestions(true); }}
                                    placeholder="Start typing an address (e.g. 123 Main St, Miami...)" 
                                    rows={2} 
                                    className="w-full bg-zinc-50 border border-zinc-200 text-zinc-900 text-sm rounded-lg focus:ring-amber-500 focus:border-amber-500 block p-3 outline-none resize-none" 
                                />
                                
                                {showSuggestions && addressSuggestions.length > 0 && (
                                    <div className="absolute z-[60] left-0 right-0 mt-1 bg-white border border-zinc-200 rounded-xl shadow-xl overflow-hidden max-h-60 overflow-y-auto">
                                        {addressSuggestions.map((s, i) => (
                                            <div 
                                                key={i} 
                                                onClick={() => selectAddress(s)}
                                                className="p-3 hover:bg-zinc-50 cursor-pointer border-bottom border-zinc-100 last:border-0 transition-colors"
                                            >
                                                <div className="text-sm font-bold text-zinc-900">{s.properties.name}</div>
                                                <div className="text-xs text-zinc-500">
                                                    {[s.properties.city, s.properties.state, s.properties.postcode, s.properties.country].filter(Boolean).join(", ")}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wide text-zinc-500 mb-1.5">Billing Address <span className="text-zinc-400 normal-case font-normal">(leave blank to use delivery)</span></label>
                                <textarea value={newClientBilling} onChange={(e) => setNewClientBilling(e.target.value)} placeholder="Same as delivery address..." rows={2} className="w-full bg-zinc-50 border border-zinc-200 text-zinc-900 text-sm rounded-lg focus:ring-amber-500 focus:border-amber-500 block p-3 outline-none resize-none" />
                            </div>
                        </div>
                        <div className="px-8 py-5 bg-zinc-50 border-t border-zinc-100 flex justify-end gap-3">
                            <button type="button" disabled={isSubmitting} onClick={() => { setShowCreateClient(false); setCreateError(""); }} className="px-5 py-2.5 border border-zinc-200 text-zinc-700 bg-white rounded-lg text-sm font-semibold hover:bg-zinc-50 transition-colors disabled:opacity-50">Cancel</button>
                            <button type="button" disabled={isSubmitting} onClick={handleCreateClient} className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-amber-950 rounded-lg text-sm font-bold transition-colors shadow-sm disabled:opacity-50">
                                {isSubmitting ? "Creating..." : "✓ Create Client"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
