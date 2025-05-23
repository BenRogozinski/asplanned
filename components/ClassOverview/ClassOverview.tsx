"use client"

import styles from "./ClassOverview.module.css";
import Link from "next/link";

export type CategoryInformation = {
  name: string,
  weight: number,
  average: number
}

export type ClassOverviewInformation = {
  className: string,
  teachers: string[],
  teacherEmail: string,
  classroom: string,
//  categories: CategoryInformation[],
  cumulative: string
}

export default function ClassOverview({
  classOverviewInformation
} : Readonly<{
  classOverviewInformation: ClassOverviewInformation
}>) {
  const { className, teachers, teacherEmail, classroom, cumulative } = classOverviewInformation;
  return (
    <div className={styles.classOverview}>
      <div className={styles.classInformation}>
        <h2>Teacher information</h2>
        <table className={styles.classInformationTable}>
          <tbody>
            <tr>
              <td>Teachers</td>
              <td>{teachers.join("; ")}</td>
            </tr>
            <tr>
              <td>Primary teacher</td>
              <td>
                {teachers.slice(-1)[0]} (<Link href={`mailto:${teacherEmail}`}>{teacherEmail}</Link>)</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div>
        Cumulative: {cumulative}<br/>
      </div>
      <div>
        Class: {className}<br/>
      </div>
    </div>
  );
}