import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import styles from "./basepage.module.css";

export default async function BasePage({
  children,
}: Readonly<{
  children?: React.ReactNode;
}>) {
  return (
    <div className={styles.basepage}>
      <div className={styles.navbar}>
        <div className={styles.navbargroup}>
          <Link href="/">
            <div className={styles.logo}>
              <Image
                src="/asplanned-logo.svg"
                alt="AsPlanned logo"
                width={100}
                height={100}
                priority
              />
            </div>
          </Link>
          <Link href="/attendance" className={styles.navbarlink}>Attendance</Link>
          <Link href="/calendar" className={styles.navbarlink}>Calendar</Link>
          <Link href="/tools" className={styles.navbarlink}>Tools</Link>
        </div>
        <div className={styles.navbargroup}>
          <p className={styles.notification}>X</p>
          <div className={styles.userinfo}>
            <p>Doe, John</p>
            <Image
              aria-hidden
              src="/placeholder-user.jpg"
              alt="User icon"
              width={44}
              height={44}
            />
          </div>
        </div>
      </div>
      <div className={styles.content}>
        {children || <p>[MAIN CONTENT]</p>}
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