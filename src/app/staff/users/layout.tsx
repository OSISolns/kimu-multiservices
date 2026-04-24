"use client";
import React from "react";
import AdminSidebar from "../../../components/AdminSidebar";
import "../../globals.css";
import { useUser } from "../../UserContext";

import StaffSidebar from "../../../components/StaffSidebar";

export default function UsersLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { user, isLoading } = useUser();

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50/50 bg-[url('/subtle-prism.svg')] bg-cover bg-fixed flex-col flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading...</p>
                </div>
            </div>
        );
    }

    if (!user || (user.role !== "admin" && user.role !== "manager")) {
        return (
            <div className="min-h-screen bg-gray-50/50 bg-[url('/subtle-prism.svg')] bg-cover bg-fixed flex-col flex items-center justify-center">
                <p className="text-gray-700">Not authorized</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50/50 bg-[url('/subtle-prism.svg')] bg-cover bg-fixed flex">
            {user.role === "admin" ? <AdminSidebar /> : <StaffSidebar />}
            <main className="flex-1 max-w-full mx-auto p-8 flex flex-col gap-8">
                {children}
            </main>
        </div>
    );
}
