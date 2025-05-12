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
        <p>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
        </p>
      </div>
      <div className={styles.footer}>
        <p>Footer link 1</p>
        <p>Footer link 2</p>
        <p>Footer link 3</p>
      </div>
    </div>
  );
}