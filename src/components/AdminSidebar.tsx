"use client";
import { useUser } from "../app/UserContext";
import Link from "next/link";
import Image from "next/image";
import {
  FaTachometerAlt,
  FaUsersCog,
  FaDatabase,
  FaFileAlt,
  FaSignOutAlt,
} from "react-icons/fa";

export default function AdminSidebar() {
  const { user } = useUser();

  if (!user || user.role !== "admin") return null;

  const links = [
    { href: "/admin", label: "Dashboard", icon: <FaTachometerAlt /> },
    { href: "/admin/system-logs", label: "System Logs", icon: <FaDatabase /> },
    // Admin-specific pages to avoid layout conflicts
    { href: "/admin/users", label: "Users", icon: <FaUsersCog /> },
    { href: "/admin/reports", label: "Reports", icon: <FaFileAlt /> },
  ];

  return (
    <aside className="w-64 bg-white border-r flex flex-col py-8 px-6 min-h-screen">
      <div className="flex items-center gap-3 mb-10">
        <Image src="/logo.png" alt="KIMU Logo" width={48} height={48} className="w-12 h-12" />
        <span className="font-bold text-xl text-orange-700">Admin</span>
      </div>
      <nav className="flex-1 flex flex-col justify-between">
        <ul className="space-y-2">
          {links.map((l) => (
            <li key={l.href}>
              <Link
                href={l.href}
                className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 transition-all duration-300 hover:scale-105 font-semibold"
              >
                {l.icon}
                {l.label}
              </Link>
            </li>
          ))}
        </ul>
        <div className="mt-auto pt-8 flex flex-col gap-2">
          <Link
            href="/admin/logout"
            className="flex items-center gap-3 text-red-500 font-semibold hover:underline transition-all duration-300 hover:scale-105"
          >
            <FaSignOutAlt /> Logout
          </Link>
        </div>
      </nav>
    </aside>
  );
}


