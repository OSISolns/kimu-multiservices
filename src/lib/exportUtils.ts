import ExcelJS from 'exceljs';

// Generic export to CSV
export const exportToCSV = (data: any[], filename: string, columns?: string[]) => {
    if (data.length === 0) {
        alert('No data to export');
        return;
    }

    // Get columns from first object if not provided
    const headers = columns || Object.keys(data[0]);

    // Create CSV content
    const csvContent = [
        headers.join(','), // Header row
        ...data.map(row =>
            headers.map(header => {
                const value = row[header];
                // Handle values with commas, quotes, or newlines
                if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
                    return `"${value.replace(/"/g, '""')}"`;
                }
                return value ?? '';
            }).join(',')
        )
    ].join('\n');

    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

// Generic export to Excel
export const exportToExcel = async (
    data: any[],
    filename: string,
    sheetName: string = 'Sheet1',
    columns?: Array<{ header: string; key: string; width?: number }>
) => {
    if (data.length === 0) {
        alert('No data to export');
        return;
    }

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet(sheetName);

    // Set columns
    if (columns) {
        worksheet.columns = columns;
    } else {
        // Auto-generate columns from first object
        const headers = Object.keys(data[0]);
        worksheet.columns = headers.map(header => ({
            header: header.charAt(0).toUpperCase() + header.slice(1).replace(/([A-Z])/g, ' $1'),
            key: header,
            width: 15
        }));
    }

    // Style header row
    worksheet.getRow(1).font = { bold: true, size: 12 };
    worksheet.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF4B5563' }
    };
    worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    worksheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' };
    worksheet.getRow(1).height = 25;

    // Add data
    data.forEach(item => {
        worksheet.addRow(item);
    });

    // Auto-fit columns (with max width)
    worksheet.columns.forEach(column => {
        if (!column.width) {
            let maxLength = 10;
            column.eachCell?.({ includeEmpty: true }, (cell) => {
                const cellValue = cell.value?.toString() || '';
                maxLength = Math.max(maxLength, cellValue.length);
            });
            column.width = Math.min(maxLength + 2, 50);
        }
    });

    // Add borders to all cells
    worksheet.eachRow((row, rowNumber) => {
        row.eachCell((cell) => {
            cell.border = {
                top: { style: 'thin', color: { argb: 'FFD1D5DB' } },
                left: { style: 'thin', color: { argb: 'FFD1D5DB' } },
                bottom: { style: 'thin', color: { argb: 'FFD1D5DB' } },
                right: { style: 'thin', color: { argb: 'FFD1D5DB' } }
            };
        });

        // Alternate row colors (except header)
        if (rowNumber > 1 && rowNumber % 2 === 0) {
            row.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FFF9FAFB' }
            };
        }
    });

    // Generate buffer and download
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    });

    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.xlsx`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

// Export leads/customers
export const exportLeads = async (leads: any[], format: 'csv' | 'excel' = 'excel') => {
    const filename = `leads_export_${new Date().toISOString().split('T')[0]}`;

    const columns = [
        { header: 'Name', key: 'name', width: 20 },
        { header: 'Company', key: 'company', width: 20 },
        { header: 'Email', key: 'email', width: 25 },
        { header: 'Phone', key: 'contact', width: 15 },
        { header: 'Location', key: 'location', width: 20 },
        { header: 'Stage', key: 'stage', width: 15 },
        { header: 'Value (RWF)', key: 'value', width: 15 },
        { header: 'Last Contact', key: 'lastContact', width: 15 },
        { header: 'Next Follow Up', key: 'nextFollowUp', width: 15 }
    ];

    if (format === 'csv') {
        exportToCSV(leads, filename, columns.map(c => c.key));
    } else {
        await exportToExcel(leads, filename, 'Leads', columns);
    }
};

// Export campaigns
export const exportCampaigns = async (campaigns: any[], format: 'csv' | 'excel' = 'excel') => {
    const filename = `campaigns_export_${new Date().toISOString().split('T')[0]}`;

    const columns = [
        { header: 'Campaign Name', key: 'name', width: 25 },
        { header: 'Type', key: 'type', width: 12 },
        { header: 'Status', key: 'status', width: 12 },
        { header: 'Start Date', key: 'startDate', width: 15 },
        { header: 'End Date', key: 'endDate', width: 15 },
        { header: 'Budget (RWF)', key: 'budget', width: 15 },
        { header: 'Spent (RWF)', key: 'spent', width: 15 },
        { header: 'Reach', key: 'reach', width: 12 },
        { header: 'Engagement', key: 'engagement', width: 12 },
        { header: 'Conversions', key: 'conversion', width: 12 }
    ];

    if (format === 'csv') {
        exportToCSV(campaigns, filename, columns.map(c => c.key));
    } else {
        await exportToExcel(campaigns, filename, 'Campaigns', columns);
    }
};

// Export activities
export const exportActivities = async (activities: any[], format: 'csv' | 'excel' = 'excel') => {
    const filename = `activities_export_${new Date().toISOString().split('T')[0]}`;

    const columns = [
        { header: 'Type', key: 'type', width: 12 },
        { header: 'Title', key: 'title', width: 25 },
        { header: 'Description', key: 'description', width: 30 },
        { header: 'Related To', key: 'relatedTo', width: 20 },
        { header: 'Date', key: 'date', width: 15 },
        { header: 'Time', key: 'time', width: 10 },
        { header: 'Status', key: 'status', width: 12 }
    ];

    if (format === 'csv') {
        exportToCSV(activities, filename, columns.map(c => c.key));
    } else {
        await exportToExcel(activities, filename, 'Activities', columns);
    }
};

// Export financials (invoices and quotes)
export const exportFinancials = async (docs: any[], format: 'csv' | 'excel' = 'excel') => {
    const filename = `financials_export_${new Date().toISOString().split('T')[0]}`;

    const columns = [
        { header: 'Document Type', key: 'type', width: 12 },
        { header: 'Document Number', key: 'number', width: 18 },
        { header: 'Client', key: 'client', width: 20 },
        { header: 'Amount (RWF)', key: 'amount', width: 15 },
        { header: 'Status', key: 'status', width: 12 },
        { header: 'Date', key: 'date', width: 15 },
        { header: 'Due Date', key: 'dueDate', width: 15 }
    ];

    if (format === 'csv') {
        exportToCSV(docs, filename, columns.map(c => c.key));
    } else {
        await exportToExcel(docs, filename, 'Financial Documents', columns);
    }
};

// Export vehicles
export const exportVehicles = async (vehicles: any[], format: 'csv' | 'excel' = 'excel') => {
    const filename = `vehicles_export_${new Date().toISOString().split('T')[0]}`;

    const columns = [
        { header: 'Vehicle Name', key: 'name', width: 25 },
        { header: 'Category', key: 'category', width: 15 },
        { header: 'Year', key: 'year', width: 10 },
        { header: 'Transmission', key: 'transmission', width: 12 },
        { header: 'Fuel Type', key: 'fuel', width: 12 },
        { header: 'Price/Day', key: 'price', width: 15 },
        { header: 'Status', key: 'status', width: 12 },
        { header: 'Available', key: 'isAvailable', width: 10 }
    ];

    if (format === 'csv') {
        exportToCSV(vehicles, filename, columns.map(c => c.key));
    } else {
        await exportToExcel(vehicles, filename, 'Vehicles', columns);
    }
};
