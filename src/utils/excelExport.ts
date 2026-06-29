import ExcelJS from 'exceljs';

interface ExportColumn {
  header: string;
  key: string;
  width?: number;
  type?: 'text' | 'number' | 'date' | 'formula';
  numFormat?: string;
  alignment?: 'left' | 'center' | 'right';
}

interface ExportOptions {
  filename: string;
  sheetName: string;
  title: string;
  subtitle?: string;
  columns: ExportColumn[];
  data: any[];
  // If we need a custom summary row or manual formulas
  summaryRow?: {
    [key: string]: string | { formula: string };
  };
}

export async function exportToExcel({
  filename,
  sheetName,
  title,
  subtitle,
  columns,
  data,
  summaryRow
}: ExportOptions) {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet(sheetName);

  // Enable grid lines
  worksheet.views = [{ showGridLines: true }];

  // 1. Add Title & Subtitle
  const titleCell = worksheet.getCell('A1');
  titleCell.value = title;
  titleCell.font = { name: 'Arial', size: 16, bold: true, color: { argb: 'FFFFFFFF' } };
  titleCell.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF3453B7' } // Brand blue
  };
  titleCell.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 };
  
  // Merge title across columns
  const colCount = columns.length;
  worksheet.mergeCells(1, 1, 1, colCount);
  worksheet.getRow(1).height = 40;

  let startRow = 3;
  if (subtitle) {
    const subtitleCell = worksheet.getCell('A2');
    subtitleCell.value = subtitle;
    subtitleCell.font = { name: 'Arial', size: 10, italic: true, color: { argb: 'FF4B5563' } };
    worksheet.mergeCells(2, 1, 2, colCount);
    worksheet.getRow(2).height = 20;
    startRow = 4;
  }

  // 3. Format Headers (Header Row is at startRow)
  const headerRow = worksheet.getRow(startRow);
  headerRow.height = 28;
  
  columns.forEach((col, idx) => {
    const cell = headerRow.getCell(idx + 1);
    cell.value = col.header.toUpperCase();
    cell.font = { name: 'Arial', size: 10, bold: true, color: { argb: 'FFFFFFFF' } };
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF233A85' } // Darker blue for header
    };
    cell.alignment = {
      vertical: 'middle',
      horizontal: col.alignment || (col.type === 'number' || col.type === 'formula' ? 'right' : 'left')
    };
    cell.border = {
      top: { style: 'thin', color: { argb: 'FFD1D5DB' } },
      bottom: { style: 'medium', color: { argb: 'FF111827' } },
      left: { style: 'thin', color: { argb: 'FFD1D5DB' } },
      right: { style: 'thin', color: { argb: 'FFD1D5DB' } }
    };
  });

  // 4. Add Data Rows
  let currentRowNum = startRow + 1;
  data.forEach((item, dataIdx) => {
    const row = worksheet.getRow(currentRowNum);
    row.height = 22;

    columns.forEach((col, colIdx) => {
      const cell = row.getCell(colIdx + 1);
      const val = item[col.key];
      
      if (col.type === 'formula' && val && typeof val === 'object' && 'formula' in val) {
        cell.value = { formula: val.formula.replace(/{row}/g, String(currentRowNum)) };
      } else {
        cell.value = val;
      }

      // Formatting
      cell.font = { name: 'Arial', size: 10 };
      
      // Zebra striping
      if (dataIdx % 2 === 1) {
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFF9FAFB' }
        };
      }

      cell.alignment = {
        vertical: 'middle',
        horizontal: col.alignment || (col.type === 'number' || col.type === 'formula' ? 'right' : 'left')
      };

      if (col.type === 'number' || col.type === 'formula') {
        cell.numFmt = col.numFormat || '#,##0';
      } else if (col.type === 'date' && val) {
        cell.value = new Date(val);
        cell.numFmt = 'yyyy-mm-dd';
      }

      cell.border = {
        top: { style: 'thin', color: { argb: 'FFE5E7EB' } },
        bottom: { style: 'thin', color: { argb: 'FFE5E7EB' } },
        left: { style: 'thin', color: { argb: 'FFE5E7EB' } },
        right: { style: 'thin', color: { argb: 'FFE5E7EB' } }
      };
    });
    
    currentRowNum++;
  });

  // 5. Add Summary Row (if provided)
  if (summaryRow) {
    const summaryRowObj = worksheet.getRow(currentRowNum);
    summaryRowObj.height = 24;

    columns.forEach((col, colIdx) => {
      const cell = summaryRowObj.getCell(colIdx + 1);
      const val = summaryRow[col.key];

      if (val !== undefined) {
        if (typeof val === 'object' && 'formula' in val) {
          // Replace placeholders like {start} and {end} with actual data row numbers
          const formulaStr = val.formula
            .replace(/{start}/g, String(startRow + 1))
            .replace(/{end}/g, String(currentRowNum - 1));
          cell.value = { formula: formulaStr };
        } else {
          cell.value = val;
        }
      }

      cell.font = { name: 'Arial', size: 10, bold: true };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFF3F4F6' } // Light gray
      };
      
      cell.alignment = {
        vertical: 'middle',
        horizontal: col.alignment || (col.type === 'number' || col.type === 'formula' ? 'right' : 'left')
      };

      if (col.type === 'number' || col.type === 'formula') {
        cell.numFmt = col.numFormat || '#,##0';
      }

      // Accounting borders (single top, double bottom)
      cell.border = {
        top: { style: 'thin', color: { argb: 'FF9CA3AF' } },
        bottom: { style: 'double', color: { argb: 'FF111827' } },
        left: { style: 'thin', color: { argb: 'FFE5E7EB' } },
        right: { style: 'thin', color: { argb: 'FFE5E7EB' } }
      };
    });
  }

  // 6. Auto-fit columns
  columns.forEach((col, idx) => {
    const column = worksheet.getColumn(idx + 1);
    let maxLen = col.header.length;
    column.eachCell({ includeEmpty: true }, (cell, rowNumber) => {
      // Don't size columns based on merged title rows
      if (rowNumber < startRow) return;
      const cellVal = cell.value;
      if (cellVal) {
        let textLen = 0;
        if (typeof cellVal === 'object' && 'formula' in cellVal) {
          textLen = 12; // default guess for formulas
        } else if (cellVal instanceof Date) {
          textLen = 10;
        } else {
          textLen = String(cellVal).length;
        }
        if (textLen > maxLen) {
          maxLen = textLen;
        }
      }
    });
    column.width = Math.max(maxLen + 4, 12);
  });

  // 7. Trigger download
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${filename}.xlsx`;
  a.click();
  window.URL.revokeObjectURL(url);
}
