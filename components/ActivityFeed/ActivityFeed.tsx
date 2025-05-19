"use client"

import styles from "./ActivityFeed.module.css"

export type ActivityInformation = {
  date: string,
  activityType: string,
  description: string
}

export default function ActivityFeed({
  activityInformation
} : Readonly<{
  activityInformation?: ActivityInformation
}>) {
  return (
    <div className={styles.activityFeed}>
      {activityInformation?.date}
    </div>
  );
}