import React from 'react';
import Image from 'next/image';
import styles from "./basepage.module.css";

export default function BasePage({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className={styles.basepage}>
      <div className={styles.navbar}>
        <div className={styles.navbargroup}>
          <p>Classes</p>
          <p>Attendance</p>
          <p>Calendar</p>
          <p>Tools</p>
        </div>
        <div className={styles.navbargroup}>
          <div className={styles.gpainfo}>
            <p>Weighted GPA: 3.7</p>
            <p>Unweighted GPA: 4.0</p>
          </div>
          <p>X</p>
          <div className={styles.userinfo}>
            <p>Doe, John</p>
            <Image
              aria-hidden
              src="/placeholder-user.jpg"
              alt="File icon"
              width={44}
              height={44}
            />
          </div>
        </div>
      </div>
      <div className={styles.content}>
        {children}
      </div>
      <div className={styles.footer}>
        <p>Footer link 1</p>
        <p>Footer link 2</p>
        <p>Footer link 3</p>
      </div>
    </div>
  );
}