"use client";

import React, { useState, useEffect } from "react";
import styles from "./DynamicTable.module.css";

export type TableRow = Record<string, React.ReactNode | Record<string, string>>;

interface DynamicTableProps {
  title?: React.ReactNode;
  data?: TableRow[];
  dataUrl?: string;
  multiPartKey?: string;
  headers?: string[];
  alternatingColors?: boolean;
  expandableRows?: boolean;
  columnWidths?: string[];
  rowSpan?: number;
  colSpan?: number;
}

const DynamicTable: React.FC<DynamicTableProps> = ({
  title,
  data = [],
  dataUrl,
  multiPartKey = "NOKEY",
  headers,
  alternatingColors = true,
  expandableRows = false,
  columnWidths = [],
  rowSpan = 1,
  colSpan = 1,
}) => {
  const [tableData, setTableData] = useState<TableRow[]>(data);
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState<boolean>(!!dataUrl);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (dataUrl) {
      setLoading(true);
      fetch(dataUrl)
        .then((response) => {
          if (!response.ok) {
            throw new Error(
              `Failed to fetch data for "${title || "Dynamic Table"}": ${response.status} ${response.statusText}`
            );
          }
          return response.json();
        })
        .then((fetchedData) => {
          /*
            If the response is multipart data,
            get the data that corresponds to
            the multiPartKey
          */
            if (Array.isArray(fetchedData)) {
              setTableData(fetchedData);
            } else {
              const listItems = fetchedData[multiPartKey] || null;
              if (listItems) {
                setTableData(listItems);
              } else {
                throw new Error(`Multipart data key ${multiPartKey} does not exist in API response`);
              }
            }
            setError(null);
        })
        .catch((err) => {
          setError(err.message);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [dataUrl, multiPartKey, title]);

  // Get headers from data if not provided
  const derivedHeaders =
    headers ||
    Array.from(
      new Set(
        tableData.flatMap((row) => Object.keys(row).filter((key) => key !== "expandedContent"))
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

  if (loading) {
    return (
      <div className={styles.placeholderDiv}>
        <p>Loading {title}...</p>
        <div></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.errorDiv}>
        <p>Error</p>
        <div>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <table className={styles.dynamicTable} style={{ gridRow: `span ${rowSpan}`, gridColumn: `span ${colSpan}` }}>
      {title && <caption>{title}</caption>}
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
        {tableData.map((row, rowIndex) => (
          <React.Fragment key={rowIndex}>
            <tr
              className={
                alternatingColors && rowIndex % 2 === 1
                  ? styles.alternatingRow
                  : undefined
              }
            >
              {derivedHeaders.map((header, colIndex) => {
                const cell = row[header];
                return (
                  <td key={colIndex} style={{ width: columnWidths[colIndex] || "auto" }}>
                    {cell || ""}
                  </td>
                );
              })}
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
                    {row.expandedContent && typeof row.expandedContent === "object" && !Array.isArray(row.expandedContent)
                      ? Object.entries(row.expandedContent).map(([key, value]) => {
                          // Check if the value is a link object with `url` and `text`
                          if (typeof value === "object" && value !== null && "url" in value && "text" in value) {
                            return (
                              <p key={key}>
                                <a href={value.url}>
                                  {value.text}
                                </a>
                              </p>
                            );
                          }
                          // Render as plain text if not a link object
                          return (
                            <p key={key}>
                              <strong>{key}:</strong> {String(value)}
                            </p>
                          );
                        })
                      : "No additional data available"}
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