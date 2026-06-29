'use client';

import React, { useState } from 'react';
import { DocumentData } from '@/lib/document-generator';
import { FaExclamationTriangle } from 'react-icons/fa';

interface DocumentPreviewProps {
    documentId?: string;
    documentType?: 'invoice' | 'quote' | 'receipt';
    documentData?: DocumentData;
    onClose?: () => void;
}

export default function DocumentPreview({
    documentId,
    documentType,
    documentData,
    onClose,
}: DocumentPreviewProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [htmlContent, setHtmlContent] = useState<string>('');

    React.useEffect(() => {
        loadDocument();
    }, [documentId, documentType, documentData]);

    const loadDocument = async () => {
        setIsLoading(true);
        setError(null);

        try {
            let response: Response;

            if (documentId && documentType) {
                // Load from database
                response = await fetch(`/api/documents/generate?type=${documentType}&id=${documentId}`);
            } else if (documentData) {
                // Generate from provided data
                response = await fetch('/api/documents/generate', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(documentData),
                });

                if (response.ok) {
                    const result = await response.json();
                    setHtmlContent(result.html);
                    setIsLoading(false);
                    return;
                }
            } else {
                throw new Error('Either documentId/documentType or documentData must be provided');
            }

            if (!response.ok) {
                throw new Error(`Failed to load document: ${response.statusText}`);
            }

            const html = await response.text();
            setHtmlContent(html);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load document');
            console.error('Error loading document:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const handlePrint = () => {
        const printWindow = window.open('', '_blank');
        if (printWindow) {
            printWindow.document.write(htmlContent);
            printWindow.document.close();
            printWindow.onload = () => {
                printWindow.print();
            };
        }
    };

    const handleDownload = () => {
        const blob = new Blob([htmlContent], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${documentData?.documentNumber || 'document'}.html`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const handleEmail = async () => {
        const email = prompt('Enter recipient email address:');

        if (!email) return;

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            alert('Please enter a valid email address');
            return;
        }

        try {
            setIsLoading(true);

            const response = await fetch('/api/documents/send-email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    to: email,
                    documentHtml: htmlContent,
                    documentNumber: documentData?.documentNumber || 'document',
                    documentType: documentData?.type || documentType || 'document',
                }),
            });

            const result = await response.json();

            if (result.success) {
                alert(`Document sent successfully to ${email}`);
            } else {
                alert(`Failed to send email: ${result.error}`);
            }
        } catch (error) {
            console.error('Error sending email:', error);
            alert('Failed to send email. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4">
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-6xl h-[90vh] flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b">
                    <h2 className="text-xl font-semibold text-gray-800">
                        Document Preview
                    </h2>
                    <div className="flex items-center gap-2">
                        {!isLoading && !error && (
                            <>
                                <button
                                    onClick={handlePrint}
                                    className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors flex items-center gap-2"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                                    </svg>
                                    Print
                                </button>
                                <button
                                    onClick={handleDownload}
                                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                    </svg>
                                    Download
                                </button>
                                <button
                                    onClick={handleEmail}
                                    className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                    Email
                                </button>
                            </>
                        )}
                        {onClose && (
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        )}
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-auto bg-gray-100 p-4">
                    {isLoading && (
                        <div className="flex items-center justify-center h-full">
                            <div className="text-center">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
                                <p className="text-gray-600">Loading document...</p>
                            </div>
                        </div>
                    )}

                    {error && (
                        <div className="flex items-center justify-center h-full">
                            <div className="text-center">
                                <div className="text-red-500 text-5xl mb-4 flex justify-center"><FaExclamationTriangle /></div>
                                <h3 className="text-xl font-semibold text-gray-800 mb-2">Error Loading Document</h3>
                                <p className="text-gray-600 mb-4">{error}</p>
                                <button
                                    onClick={loadDocument}
                                    className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                                >
                                    Try Again
                                </button>
                            </div>
                        </div>
                    )}

                    {!isLoading && !error && htmlContent && (
                        <div className="bg-white shadow-lg mx-auto" style={{ maxWidth: '900px' }}>
                            <iframe
                                srcDoc={htmlContent.replace('<head>', `<head><base href="${typeof window !== 'undefined' ? window.location.origin : ''}/" />`)}
                                className="w-full border-0"
                                style={{ height: 'calc(90vh - 120px)', minHeight: '800px' }}
                                title="Document Preview"
                            />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
