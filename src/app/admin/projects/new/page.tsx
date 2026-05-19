"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createProject } from "@/app/actions/projectActions";
import SpecbooksQuoteTemplate from "@/app/components/SpecbooksQuoteTemplate";

export default function NewProjectPage() {
    const router = useRouter();
    const [clients, setClients] = useState<any[]>([]);

    useEffect(() => {
        // Fetch clients
        fetch('/api/clients')
            .then(res => res.json())
            .then(data => setClients(data))
            .catch(console.error);
    }, []);

    const handleSave = async (data: any) => {
        try {
            const project = await createProject(data);
            router.push(`/admin/projects/${project.id}`);
        } catch (error) {
            console.error(error);
            alert("Failed to save project.");
        }
    };

    return (
        <SpecbooksQuoteTemplate 
            clients={clients} 
            onSave={handleSave} 
        />
    );
}
