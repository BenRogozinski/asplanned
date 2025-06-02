"use client";

import React, { useState, useEffect } from "react";
import styles from "./DynamicList.module.css";

interface BoldText {
  bold: true;
  content: string;
}

export interface ListItem {
  text: string | (string | BoldText)[];
  url?: string;
}

interface DynamicListProps {
  title?: React.ReactNode;
  items?: (ListItem | string)[];
  dataUrl?: string;
  multiPartKey?: string;
  listType?: "unordered" | "ordered";
  orderedListType?: "1" | "A" | "a" | "I" | "i";
  rowSpan?: number;
  colSpan?: number;
}

const DynamicList: React.FC<DynamicListProps> = ({
  title,
  items = [],
  dataUrl,
  multiPartKey = "NOKEY",
  listType = "unordered",
  orderedListType = "1",
  rowSpan = 1,
  colSpan = 1,
}) => {
  const [listItems, setListItems] = useState<(ListItem | string)[]>(items);
  const [loading, setLoading] = useState<boolean>(!!dataUrl);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (dataUrl) {
      setLoading(true);
      fetch(dataUrl)
        .then((response) => {
          if (!response.ok) {
            throw new Error(
              `Failed to fetch data for "${title || "Dynamic List"}": ${response.status} ${response.statusText}`
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
            setListItems(fetchedData);
          } else {
            const listItems = fetchedData[multiPartKey] || null;
            if (listItems) {
              setListItems(listItems);
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

  const renderedItems = listItems.map((item, itemIndex) => {
    if (typeof item === "string") {
      // Render plain text item
      return <li key={itemIndex}>{item}</li>;
    } else if (typeof item === "object" && "text" in item) {
      // Render link item if `url` is provided
      return (
        <li key={itemIndex}>
          {item.url ? (
            <a href={item.url}>
              {Array.isArray(item.text)
                ? item.text.map((part, partIndex) =>
                    typeof part === "string" ? (
                      part
                    ) : (
                      <strong key={partIndex}>{part.content}</strong>
                    )
                  )
                : item.text}
            </a>
          ) : (
            Array.isArray(item.text)
              ? item.text.map((part, partIndex) =>
                  typeof part === "string" ? (
                    part
                  ) : (
                    <strong key={partIndex}>{part.content}</strong>
                  )
                )
              : item.text
          )}
        </li>
      );
    }
    return null; // Fallback for invalid item types
  });

  const list = listType === "unordered" ? (
    <ul>{renderedItems}</ul>
  ) : (
    <ol type={orderedListType}>{renderedItems}</ol>
  );

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
    <figure
      className={styles.dynamicList}
      style={{ gridRow: `span ${rowSpan}`, gridColumn: `span ${colSpan}` }}
    >
      {title && <figcaption>{title}</figcaption>}
      {list}
    </figure>
  );
};

export default DynamicList;