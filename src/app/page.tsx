import { AtomModel } from "../components/AtomModel/AtomModel";
import styles from "./page.module.css";

export default function HomePage() {
  return (
    <main className={styles.main}>
      <AtomModel />
    </main>
  );
}
