import BasePage from "@/components/basepage";
import styles from "./page.module.css";

export default function Home() {
  return (
    <BasePage>
    <table className={styles.gradetable}>
      <thead>
        <tr>
          <th>Class</th>
          <th>Grade</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>Class 1</td>
          <td>76.24 (C)</td>
        </tr>
        <tr>
          <td>Class 2</td>
          <td>81.23 (B)</td>
        </tr>
        <tr>
          <td>Class 3</td>
          <td>100.00 (A)</td>
        </tr>
        <tr>
          <td>Class 4</td>
          <td>47.61 (F)</td>
        </tr>
        <tr>
          <td>Class 4</td>
          <td>64.75 (D)</td>
        </tr>
      </tbody>
    </table>
    </BasePage>
  );
}