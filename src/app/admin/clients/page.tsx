"use client";
import { useState, useEffect } from "react";
import { getClients } from "@/app/actions/clientActions";
import { Client } from "@/lib/types";

export default function ClientDirectory() {
    const [clients, setClients] = useState<Client[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        getClients().then(data => {
            setClients(data as any);
            setIsLoading(false);
        });
    }, []);

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
                <button className="bg-zinc-900 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-zinc-800 transition-colors shadow-sm">
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
        </div>
    );
}
