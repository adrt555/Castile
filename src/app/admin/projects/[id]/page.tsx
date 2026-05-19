"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { getProjectById, updateProject } from "@/app/actions/projectActions";
import SpecbooksQuoteTemplate from "@/app/components/SpecbooksQuoteTemplate";

export default function EditProjectPage() {
    const params = useParams();
    const id = params.id as string;
    
    const [project, setProject] = useState<any>(null);
    const [clients, setClients] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            try {
                const [projectData, clientsData] = await Promise.all([
                    getProjectById(id),
                    fetch('/api/clients').then(r => r.json())
                ]);
                setProject(projectData);
                setClients(clientsData);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [id]);

    const handleSave = async (data: any) => {
        try {
            await updateProject(id, data);
            alert("Project saved successfully!");
        } catch (error) {
            console.error(error);
            alert("Failed to save project.");
        }
    };

    if (loading) return <div className="p-8 text-center text-zinc-500 font-semibold animate-pulse">Loading Project...</div>;
    if (!project) return <div className="p-8 text-center text-red-500">Project not found</div>;

    return (
        <SpecbooksQuoteTemplate 
            initialData={project}
            clients={clients} 
            onSave={handleSave} 
        />
    );
}
