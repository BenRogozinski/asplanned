import React from 'react';
import styles from "./pagesection.module.css";

export default function PageSection({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
    return (
        <div className={styles.section}>
            {children}
        </div>
    )
}