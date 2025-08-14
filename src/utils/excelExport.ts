/* eslint-disable @typescript-eslint/no-explicit-any */
import * as XLSX from 'xlsx';
import { TableColumn } from '@/hooks/useDataTable';

export const exportToExcel = (
  data: any[],
  columns: TableColumn[],
  filename: string = 'data'
) => {
  // Get visible columns
  const visibleColumns = columns
    .filter(col => col.visible)
    .sort((a, b) => a.order_no - b.order_no);

  // Prepare data for export
  const exportData = data.map(item => {
    const row: any = {};
    visibleColumns.forEach(column => {
      let value = item[column.key];
      
      // Format different data types for Excel
      switch (column.type) {
        case 'date':
          if (value) {
            value = new Date(value).toLocaleDateString();
          }
          break;
        case 'cost':
          if (value) {
            value = Number(value);
          }
          break;
        case 'progress':
        case 'progresscount':
          if (value) {
            value = Number(value);
          }
          break;
        default:
          value = value || '';
      }
      
      row[column.label] = value;
    });
    return row;
  });

  // Create workbook and worksheet
  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.json_to_sheet(exportData);

  // Add the worksheet to the workbook
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Data');

  // Save the file
  const timestamp = new Date().toISOString().split('T')[0];
  XLSX.writeFile(workbook, `${filename}_${timestamp}.xlsx`);
};