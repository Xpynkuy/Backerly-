import {
  RegisterFormAsync
} from "@features/auth/ui/RegisterForm/RegisterForm.async.tsx";
import styles from './RegisterForm.module.scss'

export const RegisterPage = () => {
  return (
    <div className={styles.container}>
      <RegisterFormAsync />
    </div>
  );
};

