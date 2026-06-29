"use client";

import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EmptyState } from "@/shared/components/feedback";

export type DataTableColumn<T> = {
  key: string;
  header: React.ReactNode;
  className?: string;
  headerClassName?: string;
  cellClassName?: string;
  accessor?: (row: T) => React.ReactNode;
  render?: (row: T, rowIndex: number) => React.ReactNode;
};

type DataTableProps<T> = {
  data: T[];
  columns: DataTableColumn<T>[];
  rowKey: (row: T, rowIndex: number) => string;
  emptyState?: React.ReactNode;
  tableClassName?: string;
  headerClassName?: string;
  bodyClassName?: string;
  rowClassName?: (row: T, rowIndex: number) => string;
};

const DEFAULT_HEADER_CELL_CLASS =
  "px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400";
const DEFAULT_BODY_CELL_CLASS =
  "px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400";

export function DataTable<T>({
  data,
  columns,
  rowKey,
  emptyState,
  tableClassName,
  headerClassName = "border-b border-gray-100 dark:border-white/[0.05]",
  bodyClassName = "divide-y divide-gray-100 dark:divide-white/[0.05]",
  rowClassName,
}: DataTableProps<T>) {
  const resolvedEmptyState =
    emptyState ?? (
      <EmptyState
        title="Aucune donnée"
        description="Il n'y a rien à afficher pour le moment."
        className="border-0 bg-transparent py-8"
      />
    );

  return (
    <Table className={tableClassName}>
      <TableHeader className={headerClassName}>
        <TableRow>
          {columns.map((column) => (
            <TableCell
              key={column.key}
              isHeader
              className={`${DEFAULT_HEADER_CELL_CLASS} ${column.className ?? ""} ${column.headerClassName ?? ""}`}
            >
              {column.header}
            </TableCell>
          ))}
        </TableRow>
      </TableHeader>

      <TableBody className={bodyClassName}>
        {data.length === 0 ? (
          <TableRow>
            <td className="p-0" colSpan={columns.length}>
              {resolvedEmptyState}
            </td>
          </TableRow>
        ) : (
          data.map((row, rowIndex) => (
            <TableRow key={rowKey(row, rowIndex)} className={rowClassName?.(row, rowIndex)}>
              {columns.map((column) => (
                <TableCell
                  key={`${column.key}-${rowIndex}`}
                  className={`${DEFAULT_BODY_CELL_CLASS} ${column.className ?? ""} ${column.cellClassName ?? ""}`}
                >
                  {column.render
                    ? column.render(row, rowIndex)
                    : column.accessor
                      ? column.accessor(row)
                      : null}
                </TableCell>
              ))}
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
}
