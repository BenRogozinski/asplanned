"use client"

import styles from "./ClassOverview.module.css";

export type CategoryInformation = {
  name: string,
  weight: number,
  average: number
}

export type ClassOverviewInformation = {
  className: string,
  teachers: string[],
  teacherEmail: string,
  classroom: number,
  categories: CategoryInformation[],
  cumulative: number
}

export default function ClassOverview({
  classOverviewInformation
} : Readonly<{
  classOverviewInformation: ClassOverviewInformation
}>) {
  return (
    null
  );
}