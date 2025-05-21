import styles from "./BasePage.module.css";
import NavBar from '../NavBar/NavBar';
import Footer from "../Footer/Footer";

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
      <Footer />
    </div>
  );
}