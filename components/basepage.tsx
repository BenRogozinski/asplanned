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
          <Image
            className={styles.logo}
            src="/asplanned-logo.svg"
            alt="AsPlanned logo"
            width={100}
            height={100}
            priority
          />
          <p>Classes</p>
          <p>Attendance</p>
          <p>Calendar</p>
          <p>Tools</p>
        </div>
        <div className={styles.navbargroup}>
          <p className={styles.notification}>X</p>
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
        <p>Footer link 4</p>
      </div>
    </div>
  );
}