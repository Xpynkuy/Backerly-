import styles from './AuthLayout.module.scss'
import {Suspense} from "react";
import {Outlet} from "react-router";
import Loader from "@shared/ui/loader/Loader.tsx";


export const AuthLayout = () => {
  return (
    <div className={styles.wrapper}>
      <main className={styles.content}>
        <Suspense fallback={<Loader />}>
          <Outlet />
        </Suspense>
      </main>
    </div>
  );
};

