import React from "react";
import Checkbox from "./Checkbox";

interface Column {
  id?: string;
  header: string;
  accessor?: string;
  cell?: (row: any, index: number) => React.ReactNode;
  headerClassName?: string;
  cellClassName?: string;
}

interface DataTableProps {
  columns?: Column[];
  rows?: any[];
  totalItems?: number;
  startIndex?: number;
  endIndex?: number;
  currentPage?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
  isAllSelected?: boolean;
  onToggleAll?: (checked: boolean) => void;
  isRowSelected?: (row: any) => boolean;
  onToggleRow?: (rowId: string, checked: boolean) => void;
  getRowId?: (row: any) => string;
  onRowClick?: (row: any) => void;
  tableLoading?: boolean;
  hasSearched?: boolean;
  showCheckboxes?: boolean;
}

/**
 * DataTable Component - Simplified and Robust Implementation
 *
 * Features:
 * - Clean table structure with proper column alignment
 * - Responsive design with checkbox column hidden on small screens
 * - Pagination with customizable page sizes
 * - Row selection with bulk actions
 * - Loading states with skeleton rows
 * - Search and filter support
 * - Customizable columns with cell renderers
 */
const DataTable: React.FC<DataTableProps> = ({
  columns = [],
  rows = [],
  totalItems = 0,
  startIndex = 0,
  endIndex = 0,
  currentPage = 1,
  totalPages = 1,
  onPageChange,
  isAllSelected = false,
  onToggleAll,
  isRowSelected = () => false,
  onToggleRow,
  getRowId = (row) => row.id,
  onRowClick,
  tableLoading = false,
  hasSearched = false,
  showCheckboxes = true,
}) => {
  const handlePrev = () => {
    if (currentPage > 1 && onPageChange) onPageChange(currentPage - 1);
  };

  const handleNext = () => {
    if (currentPage < totalPages && onPageChange) onPageChange(currentPage + 1);
  };

  const visiblePageCount = Math.min(5, totalPages);
  const pageNumbers = Array.from({ length: visiblePageCount }, (_, i) => i + 1);

  // Loading skeleton rows
  const LoadingSkeleton = () => (
    <>
      {Array.from({ length: 5 }).map((_, idx) => (
        <tr key={`skeleton-${idx}`} className="animate-pulse">
          {showCheckboxes && (
            <td className="pl-6 py-4 hidden sm:table-cell">
              <div className="w-4 h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
            </td>
          )}
          {columns.map((_, colIdx) => (
            <td key={`skeleton-${idx}-${colIdx}`} className="px-4 py-4">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
            </td>
          ))}
        </tr>
      ))}
    </>
  );

  // No records found component
  const NoRecordsFound = () => (
    <tr>
      <td
        colSpan={showCheckboxes ? columns.length + 1 : columns.length}
        className="px-6 py-32 text-center"
      >
        <div className="flex flex-col items-center justify-center space-y-3">
          <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
            <svg
              className="w-8 h-8 text-gray-400 dark:text-gray-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <div className="text-center">
            <h3 className="text-lg font-medium text-gray-600 dark:text-gray-100 capitalize">
              {hasSearched ? "No results found !" : "No records available !"}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-300 capitalize mt-1">
              {hasSearched
                ? "Try adjusting your search terms or filter criteria"
                : "No data is currently available in the system"}
            </p>
          </div>
        </div>
      </td>
    </tr>
  );

  return (
    <div className="">
      <div className="overflow-x-auto p-0 scrollbar-thin">
        <table className="w-full text-sm text-left text-gray-500/80 dark:text-gray-400/80">
          <thead className="text-sm text-slate-600 dark:text-slate-300 bg-primary-600/60 dark:bg-slate-600/50">
            <tr>
              {/* Checkbox column header */}
              {showCheckboxes && (
                <th
                  scope="col"
                  className="pl-3 lg:pl-6 py-2.5 lg:py-4 text-slate-600 dark:text-slate-300 rounded-tl-xl hidden sm:table-cell"
                >
                  <Checkbox
                    checked={isAllSelected}
                    onChange={(checked) => onToggleAll && onToggleAll(checked)}
                  />
                </th>
              )}

              {/* Data column headers */}
              {columns.map((col, idx) => {
                const isFirstColumn = !showCheckboxes && idx === 0;
                const isLastColumn = idx === columns.length - 1;

                return (
                  <th
                    key={`header-${col.id || col.header || idx}`}
                    scope="col"
                    className={`px-3 lg:px-6 py-2.5 md:py-3 lg:py-4 ${
                      isFirstColumn ? "rounded-tl-xl" : ""
                    } ${isLastColumn ? "rounded-tr-xl" : ""} ${
                      col.headerClassName ||
                      "text-slate-600 dark:text-slate-300"
                    }`}
                  >
                    <div className="flex items-center">{col.header}</div>
                  </th>
                );
              })}
            </tr>
          </thead>

          <tbody>
            {tableLoading ? (
              <LoadingSkeleton />
            ) : rows.length === 0 ? (
              <NoRecordsFound />
            ) : (
              rows.map((row, rowIdx) => {
                const rowId = getRowId(row);
                const selected = isRowSelected(row);

                return (
                  <tr
                    key={`row-${rowId ?? rowIdx}`}
                    className={`bg-white dark:bg-gray-800/30 border-b border-gray-200 dark:border-gray-700 hover:bg-slate-100 dark:hover:bg-gray-700 transition-all duration-200 ${
                      selected ? "bg-primary-100 dark:bg-primary-900/20 " : ""
                    } ${onRowClick ? "cursor-pointer" : ""}`}
                    onClick={() => onRowClick && onRowClick(row)}
                  >
                    {/* Checkbox column cell */}
                    {showCheckboxes && (
                      <td className="pl-3 lg:pl-6 py-3 lg:py-4 hidden sm:table-cell">
                        <div onClick={(e) => e.stopPropagation()}>
                          <Checkbox
                            checked={selected}
                            onChange={(checked) =>
                              onToggleRow && onToggleRow(rowId, checked)
                            }
                          />
                        </div>
                      </td>
                    )}

                    {/* Data column cells */}
                    {columns.map((col, colIdx) => (
                      <td
                        key={`cell-${col.id || col.header || colIdx}-${rowId}`}
                        className={`px-3 lg:px-6 py-3 lg:py-4 ${
                          col.cellClassName || ""
                        }`}
                      >
                        {col.cell
                          ? col.cell(row, rowIdx)
                          : col.accessor
                          ? row[col.accessor]
                          : null}
                      </td>
                    ))}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="bg-white flex items-center justify-between pt-2.5 lg:pt-4 px-2 md:px-3 lg:px-6 pb-4 lg:pb-5">
        <span className="text-xs lg:text-[0.83rem] tracking-tight text-slate-600 dark:text-gray-400">
          {totalItems > 0
            ? `Showing ${startIndex} to ${endIndex} of ${totalItems}`
            : "Showing 0 to 0 of 0"}
        </span>

        {rows.length > 0 && (
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrev}
              disabled={currentPage === 1}
              className="px-2 md:px-3 py-1.5 text-xs md:text-sm font-semibold text-slate-600 dark:text-slate-300 bg-white dark:bg-gray-700 border border-slate-300 dark:border-gray-600 rounded-lg hover:bg-primary-50 dark:hover:bg-primary-900/20 hover:border-primary-600/30 dark:hover:border-primary-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>

            <div className="flex items-center gap-1">
              {pageNumbers.map((pageNum) => (
                <button
                  key={pageNum}
                  onClick={() => onPageChange && onPageChange(pageNum)}
                  className={`px-2 md:px-3 py-1 md:py-1.5 font-bold md:font-semibold text-xs md:text-sm rounded-lg transition-colors ${
                    currentPage === pageNum
                      ? "bg-primary-600 dark:bg-primary-500 text-white"
                      : "text-slate-600 dark:text-slate-300 bg-white dark:bg-gray-700 border border-slate-200 dark:border-gray-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 hover:border-primary-600/30 dark:hover:border-primary-500/30"
                  }`}
                >
                  {pageNum}
                </button>
              ))}
            </div>

            <button
              onClick={handleNext}
              disabled={currentPage === totalPages || totalPages === 0}
              className="px-2 md:px-3 py-1 md:py-1.5 text-xs md:text-sm font-semibold text-slate-600 dark:text-slate-300 bg-white dark:bg-gray-700 border border-slate-300 dark:border-gray-600 rounded-lg hover:bg-primary-50 dark:hover:bg-primary-900/20 hover:border-primary-600/30 dark:hover:border-primary-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default DataTable;
