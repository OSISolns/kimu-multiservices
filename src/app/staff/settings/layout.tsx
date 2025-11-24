"use client";
import Link from 'next/link';
import Image from 'next/image';
import { FaSave, FaSignOutAlt } from 'react-icons/fa';
import { useUser } from '@/app/UserContext';

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
    const { user } = useUser();
    // Only render for authenticated users
    if (!user) return null;

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 flex">
            <aside className="w-72 bg-white/90 backdrop-blur-lg border-r border-white/50 flex flex-col py-8 px-6 min-h-screen shadow-xl">
                <div className="flex items-center gap-3 mb-10 group cursor-pointer">
                    <div className="relative">
                        <Image
                            src="/logo.png"
                            alt="KIMU Transport Logo"
                            width={56}
                            height={56}
                            className="w-14 h-14 transition-transform group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-xl group-hover:bg-blue-500/30 transition-all"></div>
                    </div>
                    <div>
                        <span className="font-bold text-xl bg-gradient-to-r from-orange-600 to-orange-700 bg-clip-text text-transparent">
                            KIMU Transport
                        </span>
                        <p className="text-xs text-gray-500 font-medium">& Multiservices</p>
                    </div>
                </div>

                <div className="mt-auto pt-8 flex flex-col gap-3">
                    <Link
                        href="/staff/settings"
                        className="flex items-center gap-3 px-5 py-3 rounded-xl text-gray-700 font-semibold hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 hover:text-blue-700 transition-all duration-300 hover:scale-105 hover:shadow-md group"
                    >
                        <FaSave className="text-blue-600 group-hover:scale-110 transition-transform" />
                        <span>Settings</span>
                    </Link>
                    <Link
                        href="/staff/logout"
                        className="flex items-center gap-3 px-5 py-3 rounded-xl text-red-600 font-semibold hover:bg-red-50 transition-all duration-300 hover:scale-105 hover:shadow-md group"
                    >
                        <FaSignOutAlt className="group-hover:scale-110 transition-transform" />
                        <span>Logout</span>
                    </Link>
                </div>
            </aside>
            <main className="flex-1 max-w-full mx-auto">
                {children}
            </main>
        </div>
    );
}
