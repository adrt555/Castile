"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getProjects, deleteProject } from "@/app/actions/projectActions";

export default function ProjectsPage() {
    const [projects, setProjects] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadProjects();
    }, []);

    const loadProjects = async () => {
        const data = await getProjects();
        setProjects(data);
        setLoading(false);
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this project?")) return;
        await deleteProject(id);
        loadProjects();
    };

    if (loading) return <div className="p-8 text-center text-zinc-500 font-semibold animate-pulse">Loading Projects...</div>;

    return (
        <div className="max-w-6xl mx-auto">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-black text-zinc-900 tracking-tight">Projects Pipeline</h1>
                    <p className="text-sm text-zinc-500 font-medium mt-1">Manage and create specification presentations.</p>
                </div>
                <Link 
                    href="/admin/projects/new" 
                    className="bg-slate-900 text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-slate-800 transition-colors shadow-sm flex items-center gap-2"
                >
                    <span className="text-lg leading-none">+</span> New Project
                </Link>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-zinc-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-zinc-50 border-b border-zinc-200 text-zinc-500 uppercase text-xs font-bold tracking-wider">
                            <tr>
                                <th className="px-6 py-4">Project #</th>
                                <th className="px-6 py-4">Client</th>
                                <th className="px-6 py-4">Name / Address</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Date</th>
                                <th className="px-6 py-4 text-right">Total</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-100">
                            {projects.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center text-zinc-500">
                                        No projects found. Create your first project template!
                                    </td>
                                </tr>
                            ) : projects.map((project) => (
                                <tr key={project.id} className="hover:bg-zinc-50 transition-colors group">
                                    <td className="px-6 py-4 font-bold text-zinc-900">
                                        PRJ-{project.projectNumber}
                                    </td>
                                    <td className="px-6 py-4 font-semibold text-zinc-700">
                                        {project.client?.name || "Unknown"}
                                    </td>
                                    <td className="px-6 py-4 text-zinc-600">
                                        <div className="font-semibold">{project.name || "Unnamed Project"}</div>
                                        <div className="text-xs text-zinc-400 truncate max-w-xs">{project.address}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider ${
                                            project.status === 'Approved' ? 'bg-green-100 text-green-700' :
                                            project.status === 'Sent' ? 'bg-blue-100 text-blue-700' :
                                            'bg-zinc-100 text-zinc-600'
                                        }`}>
                                            {project.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-zinc-500 font-medium">
                                        {new Date(project.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 text-right font-bold text-zinc-900">
                                        ${project.total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </td>
                                    <td className="px-6 py-4 text-right opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Link 
                                            href={`/admin/projects/${project.id}`} 
                                            className="text-amber-600 hover:text-amber-800 font-bold text-xs bg-amber-50 px-3 py-1.5 rounded-md transition-colors mr-2"
                                        >
                                            Edit
                                        </Link>
                                        <button 
                                            onClick={() => handleDelete(project.id)}
                                            className="text-red-600 hover:text-red-800 font-bold text-xs bg-red-50 px-3 py-1.5 rounded-md transition-colors"
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
