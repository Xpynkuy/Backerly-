import {LoginFormAsync} from "@features/auth/ui/LoginForm/LoginForm.async.tsx";
import  styles from './LoginPage.module.scss'
export const LoginPage = () => {
  return (
    <div className={styles.container}>
      <LoginFormAsync />
    </div>
  );
};

