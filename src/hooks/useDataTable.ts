/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useMemo, useEffect } from 'react';

export interface TableColumn {
  label: string;
  key: string;
  visible: boolean;
  type: string;
  column_width: string;
  url: string;
  order_no: number;
  sortable?: boolean;
}

export interface UseDataTableProps {
  data: any[];
  columns: TableColumn[];
  pageSize?: number;
}

export const useDataTable = ({ data, columns, pageSize = 10 }: UseDataTableProps) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: 'asc' | 'desc';
  } | null>(null);
  const [pageSizeState, setPageSizeState] = useState(pageSize);

  // Update internal state if props.pageSize changes
  useEffect(() => {
    setPageSizeState(pageSize);
  }, [pageSize]);

  // Visible columns
  const visibleColumns = useMemo(() => {
    return columns
      .filter(col => col.visible)
      .sort((a, b) => a.order_no - b.order_no);
  }, [columns]);

  // Filtered data based on search
  const filteredData = useMemo(() => {
    if (!searchTerm) return data;

    return data.filter(item =>
      visibleColumns.some(column =>
        String(item[column.key] || '')
          .toLowerCase()
          .includes(searchTerm.toLowerCase())
      )
    );
  }, [data, searchTerm, visibleColumns]);

  // Sorted data
  const sortedData = useMemo(() => {
    if (!sortConfig) return filteredData;

    return [...filteredData].sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];

      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }, [filteredData, sortConfig]);

  // Paginated data
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSizeState;
    return sortedData.slice(startIndex, startIndex + pageSizeState);
  }, [sortedData, currentPage, pageSizeState]);

  // Total pages
  const totalPages = Math.ceil(sortedData.length / pageSizeState);

  const handleSort = (key: string) => {
    setSortConfig(current => ({
      key,
      direction: current?.key === key && current.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    setCurrentPage(1); // Reset to first page when searching
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const setPageSize = (size: number) => {
    setPageSizeState(size);
    setCurrentPage(1); // Reset to first page when page size changes
  };

  return {
    paginatedData,
    visibleColumns,
    totalPages,
    currentPage,
    searchTerm,
    sortConfig,
    handleSort,
    handleSearch,
    handlePageChange,
    totalItems: sortedData.length,
    setPageSize, // expose for dropdown control
  };
};
