"use client";

import React, { useState, useEffect } from "react";
import styles from "./TabbedContainer.module.css";

interface TabbedContainerProps {
  title?: string;
  tabNames: string[];
  direction?: "horizontal" | "vertical";
  children?: React.ReactNode[];
  rowSpan?: number;
  colSpan?: number;
}

const TabbedContainer: React.FC<TabbedContainerProps> = ({
  title,
  tabNames,
  direction = "horizontal",
  children = [],
  rowSpan = 1,
  colSpan = 1,
}) => {
  const [activeTab, setActiveTab] = useState(0);
  const [isSmallScreen, setIsSmallScreen] = useState(false);

  // Force horizontal layout on mobile
  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 800px)");
    const handleResize = () => setIsSmallScreen(mediaQuery.matches);

    handleResize();
    mediaQuery.addEventListener("change", handleResize);

    return () => mediaQuery.removeEventListener("change", handleResize);
  }, []);

  const appliedDirection = isSmallScreen ? "horizontal" : direction;

  return (
    <div
      className={`${styles.tabbedContainer} ${styles[appliedDirection]}`}
      style={{ gridRow: `span ${rowSpan}`, gridColumn: `span ${colSpan}` }}
    >
      {title && <h1>{title}</h1>}
      <div className={`${styles.tabBar} ${styles[appliedDirection]}`}>
        {tabNames.map((tabName, index) => (
          <button
            key={index}
            className={index === activeTab ? styles.activeTab : ""}
            onClick={() => setActiveTab(index)}
          >
            {tabName}
          </button>
        ))}
      </div>
      {
        /*
          Keys are assigned here to avoid an apparent
          rendering bug where data from a previously
          rendered tab is shown in another tab instead
          of the correct data (really weird idk).
          The issue does not seem to occur across different
          URL paths, so this doesn't need to be added
          to the BasePage component.
        */
      }
      <div className={styles.tabContent} key={activeTab}>
        {children[activeTab]}
      </div>
    </div>
  );
};

export default TabbedContainer;