import styles from "./Footer.module.css";
import Link from "next/link";

export default function Footer() {
  return (
    <div className={styles.footer}>
      <Link href="#">Link 1</Link>
      <Link href="#">Link 2</Link>
      <Link href="#">Link 3</Link>
      <Link href="#">Link 4</Link>
    </div>
  );
}