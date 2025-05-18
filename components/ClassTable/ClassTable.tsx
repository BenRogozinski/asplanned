"use client"

import Link from "next/link";
import styles from "./ClassTable.module.css"
import Image from "next/image";

export type ClassInformation = {
  id: string,
  name: string,
  teacher: string,
  classroom: string,
  grade: string,
  absences: string,
  tardies: string,
}

export default function ClassTable({
  classInformation
} : Readonly<{
  classInformation: ClassInformation[];
}>) {
  function expandRow(event: React.MouseEvent) {
    const targetHTML = (event.target as HTMLElement);

    // Skip if user is clicking on a link
    if (targetHTML.tagName === "A") {
      return;
    }

    const rowId = (event.target as HTMLElement).closest("tr")?.id;
    const expandArrow = document.getElementById(`${rowId}-expandArrow`);
    const classInfo = document.getElementById(`${rowId}-classInfo`);

    if (expandArrow) {
      expandArrow.classList.toggle(styles.rotatedArrow);
    }

    if (classInfo) {
      classInfo.classList.toggle(styles.classInfoShown);
    }
  }

  const classRows= classInformation.map(({ id, name, teacher, classroom, grade, absences, tardies }, index): React.ReactNode => {
    return (
      <tr key={index} id={id} className={styles.classRow} onClick={expandRow}>
        <td className={`${styles.cell} ${styles.classCell}`}>
          <div className={styles.className}>
            <Image
              src="/arrow.svg"
              alt="Arrow"
              width={20}
              height={20}
              priority
              className={`${styles.expandArrow}`}
              id={`${id}-expandArrow`}
            />
            <p>{name}</p>
          </div>
          <div className={styles.classInfo} id={`${id}-classInfo`}>
            <p>Teacher: {teacher}</p>
            <p>Classroom: {classroom}</p>
            <p>Absences: {absences}</p>
            <p>Tardies: {tardies}</p>
            <Link href={`/class?id=${id}`} className={styles.viewClassLink}>View Class</Link>
          </div>
        </td>
        <td className={`${styles.cell} ${styles.classCell}`}>
          <p>{grade}</p>
        </td>
      </tr>
    )
  });

  return (
    <table className={styles.classTable}>
      <thead>
        <tr>
          <th className={`${styles.cell} ${styles.headerCell}`}>
            <p>Class</p>
          </th>
          <th className={`${styles.cell} ${styles.headerCell}`}>
            <p>Grade</p>
          </th>
        </tr>
      </thead>
      <tbody>
        {classRows}
      </tbody>
    </table>
  )
}