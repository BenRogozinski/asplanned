"use client"

import React from "react";
import styles from "./DynamicList.module.css";

interface DynamicListProps {
  title: string;
  items: React.ReactNode[];
  listType?: "unordered" | "ordered";
  orderedListType?: "1" | "A" | "a" | "I" | "i";
  rowSpan?: number;
  colSpan?: number;
}

const DynamicList: React.FC<DynamicListProps> = ({
  title,
  items,
  listType = "unordered",
  orderedListType = "1",
  rowSpan = 1,
  colSpan = 1,
}) => {
  const listItems = items.map((item, itemIndex) => (
    <li key={itemIndex}>{item}</li>
  ))

  const list = listType === "unordered" ? (
    <ul>
      {listItems}
    </ul>
  ) : (
    <ol type={orderedListType}>
      {listItems}
    </ol>
  );

  return (
    <figure className={styles.dynamicList} style={{ gridRow: `span ${rowSpan}`, gridColumn: `span ${colSpan}` }}>
      <figcaption>{title}</figcaption>
      {list}
    </figure>
  )
}

export default DynamicList;