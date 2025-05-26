"use client";

import Image from "next/image";
import styles from "./NavBar.module.css";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function NavBar() {
  const [username, setUsername] = useState("UNKNOWN");
  const [pfpSource, setPfpSource] = useState("/placeholder-user.jpg");

  useEffect(() => {
    // Access cookies on the client side
    const cookies = document.cookie.split("; ").reduce((acc, cookie) => {
      const [key, value] = cookie.split("=");
      acc[key] = decodeURIComponent(value);
      return acc;
    }, {} as Record<string, string>);

    const fetchedUsername = cookies["AsplannedUsername"] || "UNKNOWN";
    const pfpBase64 = cookies["AsplannedPfp"] || null;

    setUsername(fetchedUsername);
    setPfpSource(pfpBase64 ? `data:image/jpg;base64,${pfpBase64}` : "/placeholder-user.jpg");
  }, []);

  function expandNavBar(event: React.MouseEvent) {
    const eventElement = event.target as HTMLElement;
    if (eventElement.closest("a")?.id === "expandNavBarButton" || eventElement.tagName === "DIV") {
      event.preventDefault();

      const expandNavBarImage = document.getElementById("expandNavBarImage");
      const linkNavBarGroup = document.getElementById("linkNavBarGroup");

      expandNavBarImage?.classList.toggle(styles.spin);
      linkNavBarGroup?.classList.toggle(styles.expanded);
      return false;
    }
  }

  return (
    <div className={styles.navBar}>
      <div className={`${styles.navBarGroup} ${styles.mobileNavBarGroup}`} onClick={expandNavBar}>
        <Link href="" id="expandNavBarButton" onClick={(e) => e.preventDefault()}>
          <Image
            className={styles.expandNavBarImage}
            id="expandNavBarImage"
            src="/expand.svg"
            alt="Expand menu icon"
            width={28}
            height={28}
          />
        </Link>
        <Link className={styles.mobileHomeLink} href="/home">
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
        <Link className={styles.homeLink} href="/home">
          <Image
            src="/asplanned-logo.svg"
            alt="AsPlanned logo"
            width={42}
            height={28}
          />
          <p>Home</p>
        </Link>
        <Link href="/myInfo">My Info</Link>
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
  );
}