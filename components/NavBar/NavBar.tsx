"use client"

import Image from "next/image";
import styles from "./NavBar.module.css";
import Link from "next/link";

export default function NavBar() {
  //const cookieJar = await cookies();
  //const username = (cookieJar.get("AsplannedUsername")?.value || "UNKNOWN");
  //const pfpBase64 = cookieJar.get("AsplannedPfp")?.value || null;

  //let pfpSource: string;
  //if (pfpBase64) {
  //  pfpSource = `data:image/jpg;base64,${pfpBase64}`;
  //} else {
  //  pfpSource = "/placeholder-user.jpg";
  //}

  function expandNavBar(event: React.MouseEvent) {
    event.preventDefault();
    
    const expandNavBarImage = document.getElementById("expandNavBarImage");
    const linkNavBarGroup = document.getElementById("linkNavBarGroup");

    expandNavBarImage?.classList.toggle(styles.spin);
    linkNavBarGroup?.classList.toggle(styles.expanded);
  }

  const username = "Doe, John";
  const pfpSource = "/placeholder-user.jpg";

  return (
    <div className={styles.navBar}>
      <div className={`${styles.navBarGroup} ${styles.mobileNavBarGroup}`}>
        <Link href="" onClick={expandNavBar}>
          <Image
            className={styles.expandNavBarImage}
            id="expandNavBarImage"
            src="/expand.svg"
            alt="Expand menu icon"
            width={28}
            height={28}
          />
        </Link>
        <Link className={styles.mobileHomeLink} href="/">
          <Image
            src="/asplanned-logo.svg"
            alt="AsPlanned logo"
            width={42}
            height={28}
          />
        </Link>
        <Link className={styles.profileDropdownLink} href="https://www.google.com">
          <Image
            className={styles.profilePicture}
            src={pfpSource}
            alt="Profile picture"
            width={28}
            height={28}
          />
        </Link>
      </div>
      <div className={`${styles.navBarGroup} ${styles.linkNavBarGroup}`} id="linkNavBarGroup">
        <Link className={styles.homeLink} href="/">
          <Image
            src="/asplanned-logo.svg"
            alt="AsPlanned logo"
            width={42}
            height={28}
          />
          <p>Home</p>
        </Link>
        <Link href="/attendance">Attendance</Link>
        <Link href="/calendar">Calendar</Link>
        <Link href="/tools">Tools</Link>
      </div>
      <div className={`${styles.navBarGroup} ${styles.profileNavBarGroup}`}>
        <Link className={styles.profileDropdownLink} href="https://www.google.com">
          <p>{username}</p>
          <Image
            className={styles.profilePicture}
            src={pfpSource}
            alt="Profile picture"
            width={28}
            height={28}
          />
        </Link>
      </div>
    </div>
  )
}