"use client";
import { useState, useEffect } from "react";
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

    const loadClients = () => {
        setIsLoading(true);
        getClients().then(data => {
            setClients(data as any);
            setIsLoading(false);
        });
    };

    useEffect(() => { loadClients(); }, []);

    const handleCreateClient = async () => {
        const fullName = `${newClientFirstName} ${newClientLastName}`.trim() || 'New Client';
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
    };

    if (isLoading) {
        return <div className="text-zinc-500 font-medium">Loading clients...</div>;
    }

    return (
        <div className="max-w-6xl mx-auto space-y-8">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-zinc-900">Client Directory</h1>
                    <p className="text-zinc-500 mt-2">Manage relationships with designers, contractors, and consumers.</p>
                </div>
                <button onClick={() => setShowCreateClient(true)} className="bg-zinc-900 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-zinc-800 transition-colors shadow-sm">
                    + Add Client
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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

                        <div className="pt-4 border-t border-zinc-100 flex justify-between items-center">
                            <div>
                                <div className="text-xs text-zinc-500 font-medium">LIFETIME VALUE</div>
                                <div className="font-bold text-zinc-900">${client.totalSpent.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
                            </div>
                            <button className="text-sm font-medium text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors">
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
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wide text-zinc-500 mb-1.5">Delivery Address</label>
                                <textarea value={newClientAddress} onChange={(e) => setNewClientAddress(e.target.value)} placeholder="123 Main St, Miami FL 33101" rows={2} className="w-full bg-zinc-50 border border-zinc-200 text-zinc-900 text-sm rounded-lg focus:ring-amber-500 focus:border-amber-500 block p-3 outline-none resize-none" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wide text-zinc-500 mb-1.5">Billing Address <span className="text-zinc-400 normal-case font-normal">(leave blank to use delivery)</span></label>
                                <textarea value={newClientBilling} onChange={(e) => setNewClientBilling(e.target.value)} placeholder="Same as delivery address..." rows={2} className="w-full bg-zinc-50 border border-zinc-200 text-zinc-900 text-sm rounded-lg focus:ring-amber-500 focus:border-amber-500 block p-3 outline-none resize-none" />
                            </div>
                        </div>
                        <div className="px-8 py-5 bg-zinc-50 border-t border-zinc-100 flex justify-end gap-3">
                            <button type="button" onClick={() => setShowCreateClient(false)} className="px-5 py-2.5 border border-zinc-200 text-zinc-700 bg-white rounded-lg text-sm font-semibold hover:bg-zinc-50 transition-colors">Cancel</button>
                            <button type="button" onClick={handleCreateClient} className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-amber-950 rounded-lg text-sm font-bold transition-colors shadow-sm">✓ Create Client</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
