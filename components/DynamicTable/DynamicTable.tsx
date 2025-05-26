"use client";

import React, { useState } from "react";
import styles from "./DynamicTable.module.css";

interface DynamicTableProps {
  title: string;
  data: Array<Record<string, React.ReactNode>>;
  headers?: string[];
  alternatingColors?: boolean;
  expandableRows?: boolean;
  columnWidths?: string[];
  rowSpan?: number;
  colSpan?: number;
}

const DynamicTable: React.FC<DynamicTableProps> = ({
  title,
  data,
  headers,
  alternatingColors = false,
  expandableRows = false,
  columnWidths = [],
  rowSpan = 1,
  colSpan = 1,
}) => {
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());

  // Get headers from data if not provided, excluding expandedContent
  const derivedHeaders =
    headers ||
    Array.from(
      new Set(
        data.flatMap((row) => Object.keys(row).filter((key) => key !== "expandedContent"))
      )
    );

  const toggleRowExpansion = (index: number) => {
    const newExpandedRows = new Set(expandedRows);
    if (newExpandedRows.has(index)) {
      newExpandedRows.delete(index);
    } else {
      newExpandedRows.add(index);
    }
    setExpandedRows(newExpandedRows);
  };

  return (
    <table className={styles.dynamicTable} style={{ gridRow: `span ${rowSpan}`, gridColumn: `span ${colSpan}` }}>
      <caption>{title}</caption>
      <thead>
        <tr>
          {derivedHeaders.map((header, index) => (
            <th
              key={index}
              style={{ width: columnWidths[index] || "auto" }}
            >
              {header}
            </th>
          ))}
          {expandableRows && <th className={styles.actionsColumn}>Actions</th>}
        </tr>
      </thead>
      <tbody>
        {data.map((row, rowIndex) => (
          <React.Fragment key={rowIndex}>
            <tr
              className={
                alternatingColors && rowIndex % 2 === 1
                  ? styles.alternatingRow
                  : undefined
              }
            >
              {derivedHeaders.map((header, colIndex) => (
                <td key={colIndex} style={{ width: columnWidths[colIndex] || "auto" }}>
                  {row[header] || ""}
                </td>
              ))}
              {expandableRows && (
                <td className={styles.actionsColumn}>
                  <button onClick={() => toggleRowExpansion(rowIndex)}>
                    {expandedRows.has(rowIndex) ? "Collapse" : "Expand"}
                  </button>
                </td>
              )}
            </tr>
            {expandableRows && expandedRows.has(rowIndex) && (
              <tr
                className={
                  `${alternatingColors && rowIndex % 2 === 1
                    ? styles.alternatingRow
                    : undefined} ${styles.expandedRow}`
                }
              >
                <td colSpan={derivedHeaders.length + 1}>
                  <div className={styles.expandedContent}>
                    {row.expandedContent || "No additional data available"}
                  </div>
                </td>
              </tr>
            )}
          </React.Fragment>
        ))}
      </tbody>
    </table>
  );
};

export default DynamicTable;