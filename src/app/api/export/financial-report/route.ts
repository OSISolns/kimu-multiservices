import { NextResponse } from 'next/server';
import ExcelJS from 'exceljs';

export async function POST(request: Request) {
    try {
        const { reportData, format } = await request.json();

        if (format === 'excel') {
            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet('Financial Report');

            // Set columns
            worksheet.columns = [
                { header: 'Item', key: 'item', width: 30 },
                { header: 'Value', key: 'value', width: 20 },
            ];

            // Add header info
            worksheet.addRow({ item: 'Report Type', value: reportData.reportType });
            worksheet.addRow({ item: 'Period', value: reportData.period });
            worksheet.addRow({ item: 'Generated At', value: reportData.generatedAt });
            worksheet.addRow({}); // Empty row

            // Add summary data
            if (reportData.summary) {
                worksheet.addRow({ item: 'Summary', value: '' });
                Object.entries(reportData.summary).forEach(([key, value]) => {
                    // Format numbers
                    const formattedValue = typeof value === 'number'
                        ? value.toLocaleString()
                        : value;
                    worksheet.addRow({ item: key, value: formattedValue });
                });
            }

            // Generate buffer
            const buffer = await workbook.xlsx.writeBuffer();

            return new NextResponse(buffer, {
                headers: {
                    'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                    'Content-Disposition': `attachment; filename=financial_report_${Date.now()}.xlsx`
                }
            });
        }

        return NextResponse.json({ error: 'Unsupported format' }, { status: 400 });
    } catch (error) {
        console.error('Export error:', error);
        return NextResponse.json({ error: 'Export failed' }, { status: 500 });
    }
}
