import BasePage from "@/components/basepage";
import PageSection from "@/components/pagesection";
import styles from "./page.module.css";

export default function Home() {
  return (
    <BasePage>
    <PageSection>
      <p className={styles.test}>test</p>
    </PageSection>
    <PageSection>
      <p>test</p>
    </PageSection>
    <PageSection>
      <p>test</p>
    </PageSection>
    </BasePage>
  );
}