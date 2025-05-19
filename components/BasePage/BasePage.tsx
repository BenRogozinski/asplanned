import styles from "./BasePage.module.css";
import NavBar from '../NavBar/NavBar';

export default async function BasePage({
  children
}: Readonly<{
  children?: React.ReactNode;
}>) {
  return (
    <div className={styles.basepage}>
      <NavBar />
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