'use client';

import { useState, useEffect } from 'react';

interface Table {
    name: string;
    count: number;
    error?: string;
}

interface Column {
    name: string;
    type: string;
}

interface TableData {
    table: string;
    columns: Column[];
    data: any[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

export default function DatabaseViewer() {
    const [tables, setTables] = useState<Table[]>([]);
    const [selectedTable, setSelectedTable] = useState<string | null>(null);
    const [tableData, setTableData] = useState<TableData | null>(null);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);

    useEffect(() => {
        fetchTables();
    }, []);

    useEffect(() => {
        if (selectedTable) {
            fetchTableData(selectedTable, page);
        }
    }, [selectedTable, page]);

    const fetchTables = async () => {
        try {
            const response = await fetch('/api/db-viewer/tables');
            const data = await response.json();
            setTables(data.tables || []);
        } catch (error) {
            console.error('Error fetching tables:', error);
        }
    };

    const fetchTableData = async (table: string, currentPage: number) => {
        setLoading(true);
        try {
            const response = await fetch(
                `/api/db-viewer/data?table=${table}&page=${currentPage}&limit=50`
            );
            const data = await response.json();
            setTableData(data);
        } catch (error) {
            console.error('Error fetching table data:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatValue = (value: any): string => {
        if (value === null) return 'NULL';
        if (typeof value === 'boolean') return value ? 'true' : 'false';
        if (typeof value === 'object') return JSON.stringify(value);
        return String(value);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8">
            <div className="max-w-7xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-white mb-2">
                        🗄️ Database Viewer
                    </h1>
                    <p className="text-purple-200">
                        Browse your Turso database tables and data
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Sidebar - Tables List */}
                    <div className="lg:col-span-1">
                        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
                            <h2 className="text-xl font-semibold text-white mb-4">
                                Tables ({tables.length})
                            </h2>
                            <div className="space-y-2">
                                {tables.map((table) => (
                                    <button
                                        key={table.name}
                                        onClick={() => {
                                            setSelectedTable(table.name);
                                            setPage(1);
                                        }}
                                        className={`w-full text-left px-4 py-3 rounded-lg transition-all ${selectedTable === table.name
                                                ? 'bg-purple-500 text-white shadow-lg'
                                                : 'bg-white/5 text-purple-100 hover:bg-white/10'
                                            }`}
                                    >
                                        <div className="font-medium">{table.name}</div>
                                        <div className="text-sm opacity-75">
                                            {table.error || `${table.count} rows`}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Main Content - Table Data */}
                    <div className="lg:col-span-3">
                        {!selectedTable ? (
                            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-12 border border-white/20 text-center">
                                <div className="text-6xl mb-4">📊</div>
                                <h3 className="text-2xl font-semibold text-white mb-2">
                                    Select a Table
                                </h3>
                                <p className="text-purple-200">
                                    Choose a table from the sidebar to view its data
                                </p>
                            </div>
                        ) : loading ? (
                            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-12 border border-white/20 text-center">
                                <div className="animate-spin text-6xl mb-4">⏳</div>
                                <p className="text-white">Loading data...</p>
                            </div>
                        ) : tableData ? (
                            <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 overflow-hidden">
                                {/* Header */}
                                <div className="p-6 border-b border-white/20">
                                    <h2 className="text-2xl font-bold text-white mb-2">
                                        {tableData.table}
                                    </h2>
                                    <p className="text-purple-200">
                                        {tableData.pagination.total} total rows
                                    </p>
                                </div>

                                {/* Table */}
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="bg-white/5">
                                            <tr>
                                                {tableData.columns.map((col) => (
                                                    <th
                                                        key={col.name}
                                                        className="px-6 py-4 text-left text-sm font-semibold text-purple-200 border-b border-white/10"
                                                    >
                                                        <div>{col.name}</div>
                                                        <div className="text-xs opacity-75 font-normal">
                                                            {col.type}
                                                        </div>
                                                    </th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {tableData.data.map((row, idx) => (
                                                <tr
                                                    key={idx}
                                                    className="border-b border-white/5 hover:bg-white/5 transition-colors"
                                                >
                                                    {tableData.columns.map((col) => (
                                                        <td
                                                            key={col.name}
                                                            className="px-6 py-4 text-sm text-white/90"
                                                        >
                                                            <div className="max-w-xs truncate">
                                                                {formatValue(row[col.name])}
                                                            </div>
                                                        </td>
                                                    ))}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Pagination */}
                                {tableData.pagination.totalPages > 1 && (
                                    <div className="p-6 border-t border-white/20 flex items-center justify-between">
                                        <div className="text-purple-200">
                                            Page {tableData.pagination.page} of{' '}
                                            {tableData.pagination.totalPages}
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => setPage((p) => Math.max(1, p - 1))}
                                                disabled={page === 1}
                                                className="px-4 py-2 bg-purple-500 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-purple-600 transition-colors"
                                            >
                                                Previous
                                            </button>
                                            <button
                                                onClick={() =>
                                                    setPage((p) =>
                                                        Math.min(tableData.pagination.totalPages, p + 1)
                                                    )
                                                }
                                                disabled={page === tableData.pagination.totalPages}
                                                className="px-4 py-2 bg-purple-500 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-purple-600 transition-colors"
                                            >
                                                Next
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : null}
                    </div>
                </div>
            </div>
        </div>
    );
}
