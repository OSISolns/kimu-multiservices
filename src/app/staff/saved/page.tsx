"use client";

import { useState, useEffect } from "react";
import { FaTrash, FaCar, FaFilter, FaExternalLinkAlt } from "react-icons/fa";
import LoadingSpinner from "@/components/LoadingSpinner";
import Link from "next/link";
import Image from "next/image";

interface SavedItem {
  id: number;
  itemType: string;
  itemId: number;
  itemData: any;
  notes: string | null;
  createdAt: string;
}

export default function SavedPage() {
  const [savedItems, setSavedItems] = useState<SavedItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");

  useEffect(() => {
    fetchSavedItems();
  }, []);

  const fetchSavedItems = async () => {
    try {
      const response = await fetch("/api/saved-items");
      if (response.ok) {
        const data = await response.json();
        setSavedItems(data);
      }
    } catch (error) {
      console.error("Error fetching saved items:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemove = async (id: number) => {
    if (!confirm("Are you sure you want to remove this item?")) return;

    try {
      const response = await fetch(`/api/saved-items/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setSavedItems(savedItems.filter((item) => item.id !== id));
      } else {
        alert("Failed to remove item");
      }
    } catch (error) {
      console.error("Error removing item:", error);
      alert("An error occurred");
    }
  };

  const filteredItems = filter === "all"
    ? savedItems
    : savedItems.filter(item => item.itemType === filter);

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="p-6 h-full overflow-y-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Saved Items</h1>
          <p className="text-gray-500">Manage your bookmarked vehicles and items.</p>
        </div>

        {/* Filter */}
        <div className="flex items-center gap-2 bg-white border border-gray-100/80 rounded-lg p-1">
          <button
            onClick={() => setFilter("all")}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${filter === "all" ? "bg-blue-50 text-blue-600" : "text-gray-600 hover:bg-blue-50/50 transition-colors"}`}
          >
            All
          </button>
          <button
            onClick={() => setFilter("vehicle")}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${filter === "vehicle" ? "bg-blue-50 text-blue-600" : "text-gray-600 hover:bg-blue-50/50 transition-colors"}`}
          >
            Vehicles
          </button>
        </div>
      </div>

      {savedItems.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-100/80">
          <FaCar className="mx-auto h-12 w-12 text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900">No saved items yet</h3>
          <p className="text-gray-500 mt-1">Items you save will appear here for quick access.</p>
          <Link href="/staff/sales-dashboard/inventory" className="inline-block mt-4 text-blue-600 hover:text-blue-700 font-medium">
            Browse Inventory &rarr;
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => (
            <div key={item.id} className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-xl shadow-gray-200/50 border border-white/60-sm border border-gray-100/80 overflow-hidden hover:shadow-md transition-shadow group">
              {/* Card Content based on itemType */}
              {item.itemType === 'vehicle' && (
                <>
                  <div className="relative h-48 bg-gray-100">
                    {item.itemData.image ? (
                      <div className="relative w-full h-full">
                        <Image
                          src={item.itemData.image}
                          alt={item.itemData.name}
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                      </div>
                    ) : (
                      <div className="flex items-center justify-center h-full text-gray-400">
                        <FaCar className="w-12 h-12" />
                      </div>
                    )}
                    <div className="absolute top-2 right-2 z-10">
                      <span className="bg-white/90 backdrop-blur-sm px-2 py-1 rounded text-xs font-semibold text-gray-900 shadow-sm">
                        {item.itemData.price}
                      </span>
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <span className="inline-block px-2 py-0.5 rounded text-[10px] font-medium bg-blue-50 text-blue-600 mb-1 uppercase tracking-wide">
                          Vehicle
                        </span>
                        <h3 className="font-semibold text-gray-900 line-clamp-1">{item.itemData.name}</h3>
                      </div>
                    </div>

                    <div className="text-sm text-gray-500 mb-4 space-y-1">
                      <p>{item.itemData.year} • {item.itemData.transmission} • {item.itemData.fuel}</p>
                      <p className="line-clamp-1">{item.itemData.category}</p>
                    </div>

                    <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
                      <button
                        onClick={() => handleRemove(item.id)}
                        className="flex-1 px-3 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors flex items-center justify-center gap-2"
                      >
                        <FaTrash className="w-3.5 h-3.5" />
                        Remove
                      </button>
                      <Link
                        href="/staff/sales-dashboard/inventory"
                        className="flex-1 px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors flex items-center justify-center gap-2"
                      >
                        View in Inventory
                      </Link>
                    </div>
                  </div>
                </>
              )}

              {/* Fallback for other types */}
              {item.itemType !== 'vehicle' && (
                <div className="p-6">
                  <h3 className="font-semibold text-gray-900 mb-2">Unknown Item Type</h3>
                  <pre className="text-xs bg-gray-50 p-2 rounded overflow-auto max-h-32">
                    {JSON.stringify(item.itemData, null, 2)}
                  </pre>
                  <button
                    onClick={() => handleRemove(item.id)}
                    className="mt-4 w-full px-3 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                  >
                    Remove
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}