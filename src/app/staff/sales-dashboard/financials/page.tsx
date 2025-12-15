"use client";

import { useState, useEffect } from "react";
import { useUser } from "../../../UserContext";
import {
    FaFileInvoiceDollar,
    FaFileAlt,
    FaPlus,
    FaDownload,
    FaSearch,
    FaEllipsisV,
    FaTimes,
    FaFileExport,
    FaEdit,
    FaTrash,
    FaEnvelope,
    FaCheck
} from "react-icons/fa";
import LoadingSpinner from "@/components/LoadingSpinner";
import { generateInvoicePDF, generateQuotePDF, downloadPDF, getPDFBase64 } from "@/lib/pdfGenerator";
import { exportFinancials } from "@/lib/exportUtils";
import DocumentPreview from "@/components/documents/DocumentPreview";

interface FinancialDoc {
    id: string;
    type: 'Invoice' | 'Quote';
    number: string;
    client: string;
    amount: number;
    status: 'Paid' | 'Pending' | 'Overdue' | 'Draft' | 'Sent' | 'Accepted' | 'Rejected';
    date: string;
    dueDate?: string;
}

interface Lead {
    id: number;
    name: string;
    email: string;
}

export default function FinancialsPage() {
    const { user, isLoading } = useUser();
    const [docs, setDocs] = useState<FinancialDoc[]>([]);
    const [leads, setLeads] = useState<Lead[]>([]);
    const [isLoadingData, setIsLoadingData] = useState(true);
    const [filterType, setFilterType] = useState<'All' | 'Invoice' | 'Quote'>('All');
    const [searchTerm, setSearchTerm] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalType, setModalType] = useState<'Invoice' | 'Quote'>('Invoice');
    const [newDoc, setNewDoc] = useState<{
        clientId: string;
        clientName: string; // For Invoice manual entry if needed
        clientEmail: string;
        amount: number;
        description: string;
    }>({
        clientId: '',
        clientName: '',
        clientEmail: '',
        amount: 0,
        description: ''
    });
    const [editingDocId, setEditingDocId] = useState<string | null>(null);
    const [activeMenuDocId, setActiveMenuDocId] = useState<string | null>(null);
    const [previewDoc, setPreviewDoc] = useState<{ id: string, type: 'invoice' | 'quote' } | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setIsLoadingData(true);

                // Fetch Leads for dropdown
                const leadsRes = await fetch('/api/leads?limit=100');
                if (leadsRes.ok) {
                    const data = await leadsRes.json();
                    setLeads(data.data || data);
                }

                // Fetch Quotes
                const quotesRes = await fetch('/api/quotes?limit=50');
                let fetchedQuotes: FinancialDoc[] = [];
                if (quotesRes.ok) {
                    const responseData = await quotesRes.json();
                    const quotesArray = responseData.data?.quotes || responseData.quotes || [];
                    fetchedQuotes = quotesArray.map((q: any) => ({
                        id: `q-${q.id}`,
                        type: 'Quote',
                        number: `QT-${q.id}`,
                        client: q.customer?.name || 'Unknown',
                        amount: q.amount,
                        status: q.status.charAt(0).toUpperCase() + q.status.slice(1),
                        date: new Date(q.createdAt).toISOString().split('T')[0],
                        dueDate: new Date(q.validUntil).toISOString().split('T')[0]
                    }));
                }

                // Fetch Invoices
                const invoicesRes = await fetch('/api/accounting/invoices');
                let fetchedInvoices: FinancialDoc[] = [];
                if (invoicesRes.ok) {
                    const data = await invoicesRes.json();
                    fetchedInvoices = data.map((inv: any) => ({
                        id: `i-${inv.id}`,
                        type: 'Invoice',
                        number: inv.invoiceNumber,
                        client: inv.clientName,
                        amount: inv.grandTotal,
                        status: inv.status.charAt(0).toUpperCase() + inv.status.slice(1),
                        date: new Date(inv.createdAt).toISOString().split('T')[0],
                        dueDate: new Date(inv.dueDate).toISOString().split('T')[0]
                    }));
                }

                setDocs([...fetchedQuotes, ...fetchedInvoices].sort((a, b) =>
                    new Date(b.date).getTime() - new Date(a.date).getTime()
                ));

            } catch (error) {
                console.error('Error fetching financials:', error);
            } finally {
                setIsLoadingData(false);
            }
        };

        if (user && !isLoading) {
            fetchData();
        }
    }, [user, isLoading]);

    const filteredDocs = docs.filter(doc => {
        const matchesType = filterType === 'All' || doc.type === filterType;
        const matchesSearch = doc.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
            doc.number.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesType && matchesSearch;
    });

    const handleCreateDoc = async () => {
        if (!newDoc.amount) {
            alert("Please enter an amount.");
            return;
        }

        try {
            if (modalType === 'Quote') {
                if (!newDoc.clientId) {
                    alert("Please select a client.");
                    return;
                }

                const payload = {
                    customerId: parseInt(newDoc.clientId),
                    serviceType: newDoc.description || 'General Service',
                    amount: newDoc.amount,
                    currency: 'RWF',
                    validUntil: new Date(Date.now() + 14 * 86400000).toISOString(), // 14 days validity
                    notes: newDoc.description,
                    createdBy: user?.id
                };

                let response;
                if (editingDocId) {
                    // Update Quote
                    const quoteId = editingDocId.replace('q-', '');
                    response = await fetch('/api/quotes', {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ id: quoteId, ...payload })
                    });
                } else {
                    // Create Quote
                    response = await fetch('/api/quotes', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(payload)
                    });
                }

                if (response.ok) {
                    const responseData = await response.json();
                    const q = responseData.data?.quote || responseData.quote;
                    const updatedQuote: FinancialDoc = {
                        id: `q-${q.id}`,
                        type: 'Quote',
                        number: `QT-${q.id}`,
                        client: q.customer?.name || 'Unknown',
                        amount: q.amount,
                        status: q.status ? (q.status.charAt(0).toUpperCase() + q.status.slice(1)) : 'Draft',
                        date: new Date(q.createdAt).toISOString().split('T')[0],
                        dueDate: new Date(q.validUntil).toISOString().split('T')[0]
                    };

                    if (editingDocId) {
                        setDocs(docs.map(d => d.id === editingDocId ? updatedQuote : d));
                        alert('Quote updated successfully!');
                    } else {
                        setDocs([updatedQuote, ...docs]);
                        alert('Quote created successfully!');
                    }
                    setIsModalOpen(false);
                    setEditingDocId(null);
                } else {
                    const err = await response.json();
                    alert(`Failed to save quote: ${err.error}`);
                }

            } else {
                // Invoice
                const clientName = newDoc.clientId
                    ? leads.find(l => l.id.toString() === newDoc.clientId)?.name
                    : newDoc.clientName;

                const clientEmail = newDoc.clientId
                    ? leads.find(l => l.id.toString() === newDoc.clientId)?.email
                    : newDoc.clientEmail;

                if (!clientName || !clientEmail) {
                    alert("Client Name and Email are required.");
                    return;
                }

                const payload = {
                    invoiceNumber: editingDocId ? undefined : `INV-${Date.now().toString().slice(-6)}`, // Don't update invoice number
                    clientName: clientName,
                    clientEmail: clientEmail,
                    amount: newDoc.amount,
                    description: newDoc.description || 'Service Charge',
                    dueDate: new Date(Date.now() + 30 * 86400000).toISOString(),
                    items: [
                        {
                            description: newDoc.description || 'Service Charge',
                            quantity: 1,
                            unitPrice: newDoc.amount,
                            total: newDoc.amount
                        }
                    ],
                    status: 'pending'
                };

                let response;
                if (editingDocId) {
                    // Update Invoice
                    const invoiceId = editingDocId.replace('i-', '');
                    response = await fetch('/api/accounting/invoices', {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ id: invoiceId, ...payload })
                    });
                } else {
                    // Create Invoice
                    response = await fetch('/api/accounting/invoices', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(payload)
                    });
                }

                if (response.ok) {
                    const inv = await response.json();
                    const updatedInvoice: FinancialDoc = {
                        id: `i-${inv.id}`,
                        type: 'Invoice',
                        number: inv.invoiceNumber,
                        client: inv.clientName,
                        amount: inv.grandTotal,
                        status: inv.status ? (inv.status.charAt(0).toUpperCase() + inv.status.slice(1)) : 'Pending',
                        date: new Date(inv.createdAt || Date.now()).toISOString().split('T')[0],
                        dueDate: new Date(inv.dueDate).toISOString().split('T')[0]
                    };

                    if (editingDocId) {
                        setDocs(docs.map(d => d.id === editingDocId ? updatedInvoice : d));
                        alert('Invoice updated successfully!');
                    } else {
                        setDocs([updatedInvoice, ...docs]);
                        alert('Invoice created successfully!');
                    }
                    setIsModalOpen(false);
                    setEditingDocId(null);
                } else {
                    const err = await response.json();
                    alert(`Failed to save invoice: ${err.error}`);
                }
            }

            // Reset form
            setNewDoc({ clientId: '', clientName: '', clientEmail: '', amount: 0, description: '' });

        } catch (error) {
            console.error('Error creating document:', error);
            alert('An error occurred.');
        }
    };

    const openModal = (type: 'Invoice' | 'Quote') => {
        setModalType(type);
        setEditingDocId(null);
        setNewDoc({ clientId: '', clientName: '', clientEmail: '', amount: 0, description: '' });
        setIsModalOpen(true);
    };

    const handleEditDoc = (doc: FinancialDoc) => {
        setModalType(doc.type);
        setEditingDocId(doc.id);

        // Find client ID if possible
        const client = leads.find(l => l.name === doc.client);

        setNewDoc({
            clientId: client ? client.id.toString() : '',
            clientName: doc.client,
            clientEmail: '', // We might not have this easily available in the list view
            amount: doc.amount,
            description: '' // We might not have this easily available in the list view
        });

        setIsModalOpen(true);
        setActiveMenuDocId(null);
    };

    const handleDeleteDoc = async (doc: FinancialDoc) => {
        if (!confirm(`Are you sure you want to delete this ${doc.type}?`)) return;

        try {
            let response;
            if (doc.type === 'Quote') {
                const id = doc.id.replace('q-', '');
                response = await fetch(`/api/quotes?id=${id}`, { method: 'DELETE' });
            } else {
                const id = doc.id.replace('i-', '');
                response = await fetch(`/api/accounting/invoices?id=${id}`, { method: 'DELETE' });
            }

            if (response.ok) {
                setDocs(docs.filter(d => d.id !== doc.id));
                alert(`${doc.type} deleted successfully.`);
            } else {
                alert(`Failed to delete ${doc.type}.`);
            }
        } catch (error) {
            console.error('Error deleting document:', error);
            alert('An error occurred.');
        }
        setActiveMenuDocId(null);
    };

    const handleMarkAsPaid = async (doc: FinancialDoc) => {
        if (doc.type !== 'Invoice') return;

        try {
            const id = doc.id.replace('i-', '');
            const response = await fetch('/api/accounting/invoices', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, status: 'paid' })
            });

            if (response.ok) {
                setDocs(docs.map(d => d.id === doc.id ? { ...d, status: 'Paid' } : d));
                alert('Invoice marked as paid.');
            } else {
                alert('Failed to update invoice status.');
            }
        } catch (error) {
            console.error('Error updating invoice:', error);
            alert('An error occurred.');
        }
        setActiveMenuDocId(null);
    };

    const handleSendToClient = async (doc: FinancialDoc) => {
        if (!confirm(`Are you sure you want to send this ${doc.type} to the client?`)) return;

        try {
            let pdfBase64 = '';
            let recipientEmail = '';
            let recipientName = '';

            if (doc.type === 'Invoice') {
                const response = await fetch(`/api/accounting/invoices?invoiceNumber=${doc.number}`);
                if (response.ok) {
                    const invoices = await response.json();
                    const invoice = invoices.find((inv: any) => inv.invoiceNumber === doc.number);
                    if (invoice) {
                        recipientEmail = invoice.clientEmail;
                        recipientName = invoice.clientName;
                        const pdfData = {
                            invoiceNumber: invoice.invoiceNumber,
                            clientName: invoice.clientName,
                            clientEmail: invoice.clientEmail,
                            date: new Date(invoice.createdAt).toLocaleDateString(),
                            dueDate: new Date(invoice.dueDate).toLocaleDateString(),
                            items: invoice.items || [{
                                description: 'Service Charge',
                                quantity: 1,
                                unitPrice: invoice.grandTotal,
                                total: invoice.grandTotal
                            }],
                            subtotal: invoice.grandTotal,
                            total: invoice.grandTotal,
                            status: invoice.status
                        };
                        const pdf = generateInvoicePDF(pdfData);
                        pdfBase64 = getPDFBase64(pdf);
                    }
                }
            } else {
                const response = await fetch(`/api/quotes`);
                if (response.ok) {
                    const responseData = await response.json();
                    const quotesArray = responseData.data?.quotes || responseData.quotes || [];
                    const quote = quotesArray.find((q: any) => `QT-${q.id}` === doc.number);
                    if (quote) {
                        recipientEmail = quote.customer?.email;
                        recipientName = quote.customer?.name;
                        const pdfData = {
                            quoteNumber: doc.number,
                            customerName: quote.customer?.name || doc.client,
                            customerEmail: quote.customer?.email || '',
                            date: new Date(quote.createdAt).toLocaleDateString(),
                            validUntil: new Date(quote.validUntil).toLocaleDateString(),
                            serviceType: quote.serviceType,
                            amount: quote.amount,
                            notes: quote.notes,
                            status: quote.status
                        };
                        const pdf = generateQuotePDF(pdfData);
                        pdfBase64 = getPDFBase64(pdf);
                    }
                }
            }

            if (!recipientEmail) {
                alert('Client email not found.');
                return;
            }

            const response = await fetch('/api/email/send-document', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    documentId: doc.number,
                    documentType: doc.type,
                    recipientEmail,
                    recipientName,
                    pdfBase64
                })
            });

            if (response.ok) {
                alert(`Email sent successfully to ${recipientEmail}`);
                // Update status to 'Sent' if it's Draft or Pending
                if (doc.status === 'Draft' || doc.status === 'Pending') {
                    // Ideally call API to update status
                    // For now just update local state
                    setDocs(docs.map(d => d.id === doc.id ? { ...d, status: 'Sent' } : d));
                }
            } else {
                const errorData = await response.json();
                alert(`Failed to send email: ${errorData.error}`);
            }

        } catch (error) {
            console.error('Error sending email:', error);
            alert('An error occurred while sending the email.');
        }
        setActiveMenuDocId(null);
    };

    const handleDownloadPDF = async (doc: FinancialDoc) => {
        try {
            if (doc.type === 'Invoice') {
                // Fetch full invoice data
                const response = await fetch(`/api/accounting/invoices?invoiceNumber=${doc.number}`);
                if (response.ok) {
                    const invoices = await response.json();
                    const invoice = invoices.find((inv: any) => inv.invoiceNumber === doc.number);

                    if (invoice) {
                        const pdfData = {
                            invoiceNumber: invoice.invoiceNumber,
                            clientName: invoice.clientName,
                            clientEmail: invoice.clientEmail,
                            date: new Date(invoice.createdAt).toLocaleDateString(),
                            dueDate: new Date(invoice.dueDate).toLocaleDateString(),
                            items: invoice.items || [{
                                description: 'Service Charge',
                                quantity: 1,
                                unitPrice: invoice.grandTotal,
                                total: invoice.grandTotal
                            }],
                            subtotal: invoice.grandTotal,
                            total: invoice.grandTotal,
                            status: invoice.status
                        };

                        const pdf = generateInvoicePDF(pdfData);
                        downloadPDF(pdf, `Invoice_${doc.number}.pdf`);
                    }
                }
            } else {
                // Fetch full quote data
                const response = await fetch(`/api/quotes`);
                if (response.ok) {
                    const responseData = await response.json();
                    const quotesArray = responseData.data?.quotes || responseData.quotes || [];
                    const quote = quotesArray.find((q: any) => `QT-${q.id}` === doc.number);

                    if (quote) {
                        const pdfData = {
                            quoteNumber: doc.number,
                            customerName: quote.customer?.name || doc.client,
                            customerEmail: quote.customer?.email || '',
                            date: new Date(quote.createdAt).toLocaleDateString(),
                            validUntil: new Date(quote.validUntil).toLocaleDateString(),
                            serviceType: quote.serviceType,
                            amount: quote.amount,
                            notes: quote.notes,
                            status: quote.status
                        };

                        const pdf = generateQuotePDF(pdfData);
                        downloadPDF(pdf, `Quote_${doc.number}.pdf`);
                    }
                }
            }
        } catch (error) {
            console.error('Error generating PDF:', error);
            alert('Failed to generate PDF. Please try again.');
        }
    };

    const handleExport = async (format: 'csv' | 'excel') => {
        await exportFinancials(filteredDocs, format);
    };

    if (isLoading || isLoadingData) {
        return <LoadingSpinner size="lg" message="Loading Financials..." />;
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Financials</h2>
                    <p className="text-gray-500">Manage quotes, invoices, and payments.</p>
                </div>
                <div className="flex gap-3">
                    <div className="relative group">
                        <button
                            className="bg-white text-gray-700 border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2 font-medium shadow-sm"
                        >
                            <FaFileExport className="text-gray-500" />
                            <span>Export</span>
                        </button>
                        <div className="absolute right-0 mt-2 w-40 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                            <button
                                onClick={() => handleExport('excel')}
                                className="w-full text-left px-4 py-2 hover:bg-gray-50 rounded-t-lg text-sm"
                            >
                                Export to Excel
                            </button>
                            <button
                                onClick={() => handleExport('csv')}
                                className="w-full text-left px-4 py-2 hover:bg-gray-50 rounded-b-lg text-sm"
                            >
                                Export to CSV
                            </button>
                        </div>
                    </div>
                    <button
                        onClick={() => openModal('Quote')}
                        className="bg-white text-gray-700 border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2 font-medium shadow-sm"
                    >
                        <FaFileAlt className="text-gray-500" />
                        <span>Create Quote</span>
                    </button>
                    <button
                        onClick={() => openModal('Invoice')}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 font-medium shadow-sm"
                    >
                        <FaPlus className="w-4 h-4" />
                        <span>Create Invoice</span>
                    </button>
                </div>
            </div>

            {/* Filters & Search */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                <div className="flex gap-2">
                    {['All', 'Invoice', 'Quote'].map(type => (
                        <button
                            key={type}
                            onClick={() => setFilterType(type as any)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors
                                ${filterType === type
                                    ? 'bg-gray-900 text-white'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                        >
                            {type}s
                        </button>
                    ))}
                </div>
                <div className="relative w-full sm:w-64">
                    <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search client or number..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                </div>
            </div>

            {/* Documents List */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Document</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {filteredDocs.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="px-6 py-10 text-center text-gray-500">
                                    No documents found.
                                </td>
                            </tr>
                        ) : (
                            filteredDocs.map((doc) => (
                                <tr key={doc.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className={`p-2 rounded-lg mr-3 
                                                ${doc.type === 'Invoice' ? 'bg-blue-100 text-blue-600' : 'bg-purple-100 text-purple-600'}`}>
                                                {doc.type === 'Invoice' ? <FaFileInvoiceDollar /> : <FaFileAlt />}
                                            </div>
                                            <div>
                                                <div className="text-sm font-medium text-gray-900">{doc.number}</div>
                                                <div className="text-xs text-gray-500">{doc.type}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {doc.client}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                        RWF {doc.amount.toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                            ${doc.status === 'Paid' || doc.status === 'Accepted' ? 'bg-green-100 text-green-800' :
                                                doc.status === 'Overdue' || doc.status === 'Rejected' ? 'bg-red-100 text-red-800' :
                                                    doc.status === 'Sent' ? 'bg-blue-100 text-blue-800' :
                                                        'bg-gray-100 text-gray-800'}`}>
                                            {doc.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {doc.date}
                                        <div className="text-xs text-gray-400">Due: {doc.dueDate}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium relative">
                                        <button
                                            onClick={() => handleDownloadPDF(doc)}
                                            className="text-blue-600 hover:text-blue-900 mx-2"
                                            title="Download PDF"
                                        >
                                            <FaDownload />
                                        </button>
                                        <div className="inline-block relative">
                                            <button
                                                onClick={() => setActiveMenuDocId(activeMenuDocId === doc.id ? null : doc.id)}
                                                className="text-gray-400 hover:text-gray-600 p-1"
                                            >
                                                <FaEllipsisV />
                                            </button>

                                            {activeMenuDocId === doc.id && (
                                                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-20 py-1">
                                                    <button
                                                        onClick={() => {
                                                            const id = doc.id.replace(/^[iq]-/, '');
                                                            setPreviewDoc({
                                                                id,
                                                                type: doc.type.toLowerCase() as 'invoice' | 'quote'
                                                            });
                                                            setActiveMenuDocId(null);
                                                        }}
                                                        className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm flex items-center gap-2 text-gray-700"
                                                    >
                                                        <FaFileInvoiceDollar className="text-gray-400" /> Preview
                                                    </button>
                                                    <button
                                                        onClick={() => handleEditDoc(doc)}
                                                        className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm flex items-center gap-2 text-gray-700"
                                                    >
                                                        <FaEdit className="text-gray-400" /> Edit {doc.type}
                                                    </button>
                                                    <button
                                                        onClick={() => handleSendToClient(doc)}
                                                        className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm flex items-center gap-2 text-gray-700"
                                                    >
                                                        <FaEnvelope className="text-gray-400" /> Send to Client
                                                    </button>
                                                    {doc.type === 'Invoice' && doc.status !== 'Paid' && (
                                                        <button
                                                            onClick={() => handleMarkAsPaid(doc)}
                                                            className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm flex items-center gap-2 text-green-600"
                                                        >
                                                            <FaCheck className="text-green-500" /> Mark as Paid
                                                        </button>
                                                    )}
                                                    <div className="border-t border-gray-100 my-1"></div>
                                                    <button
                                                        onClick={() => handleDeleteDoc(doc)}
                                                        className="w-full text-left px-4 py-2 hover:bg-red-50 text-sm flex items-center gap-2 text-red-600"
                                                    >
                                                        <FaTrash className="text-red-500" /> Delete
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Create Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 m-4">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-gray-900">{editingDocId ? 'Edit' : 'Create'} {modalType}</h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                <FaTimes />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Client</label>
                                <select
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    value={newDoc.clientId}
                                    onChange={e => setNewDoc({ ...newDoc, clientId: e.target.value })}
                                >
                                    <option value="">Select a client...</option>
                                    {leads.map(lead => (
                                        <option key={lead.id} value={lead.id}>{lead.name}</option>
                                    ))}
                                </select>
                            </div>

                            {modalType === 'Invoice' && !newDoc.clientId && (
                                <>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Client Name (Manual)</label>
                                        <input
                                            type="text"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            value={newDoc.clientName}
                                            onChange={e => setNewDoc({ ...newDoc, clientName: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Client Email</label>
                                        <input
                                            type="email"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            value={newDoc.clientEmail}
                                            onChange={e => setNewDoc({ ...newDoc, clientEmail: e.target.value })}
                                        />
                                    </div>
                                </>
                            )}

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                <input
                                    type="text"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="e.g., Service Fee"
                                    value={newDoc.description}
                                    onChange={e => setNewDoc({ ...newDoc, description: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Amount (RWF)</label>
                                <input
                                    type="number"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="0.00"
                                    value={newDoc.amount || ''}
                                    onChange={e => setNewDoc({ ...newDoc, amount: parseFloat(e.target.value) })}
                                />
                            </div>

                            <div className="bg-gray-50 p-4 rounded-lg text-sm text-gray-500">
                                <p>Document number and dates will be generated automatically.</p>
                            </div>
                        </div>

                        <div className="flex gap-3 mt-8">
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleCreateDoc}
                                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                            >
                                {editingDocId ? 'Save Changes' : `Create ${modalType}`}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Document Preview Modal */}
            {previewDoc && (
                <DocumentPreview
                    documentId={previewDoc.id}
                    documentType={previewDoc.type}
                    onClose={() => setPreviewDoc(null)}
                />
            )}
        </div>
    );
}
