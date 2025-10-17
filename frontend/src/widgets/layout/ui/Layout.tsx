import Loader from "@shared/ui/loader/Loader";
import { Footer } from "@widgets/footer";
import { Header } from "@widgets/header";
import { Suspense } from "react";
import { Outlet } from "react-router";
import styles from "./Layout.module.scss";

export const Layout = () => {
  return (
    <div className={styles.wrapper}>
      <Header />
      <main className={styles.content}>
        <Suspense fallback={<Loader />}>
          <Outlet />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
};
