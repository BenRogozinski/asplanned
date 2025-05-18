import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import styles from "./basepage.module.css";
import { cookies } from 'next/headers';

export default async function BasePage({
  children
}: Readonly<{
  children?: React.ReactNode;
}>) {
  const cookieJar = await cookies();
  const username = (cookieJar.get("AsplannedUsername")?.value || "UNKNOWN");
  const pfpBase64 = cookieJar.get("AsplannedPfp")?.value || null;
  let pfpUrl: string;
  if (pfpBase64) {
    pfpUrl = `data:image/jpg;base64,${pfpBase64}`;
  } else {
    pfpUrl = "/placeholder-user.jpg";
  }

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
            <p className={styles.username}>{username}</p>
            <Image
              aria-hidden
              src={pfpUrl}
              alt="User icon"
              width={44}
              height={44}
            />
          </div>
        </div>
      </div>
      <div className={styles.content}>
        {children || <h1>Nothing here yet!</h1>}
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