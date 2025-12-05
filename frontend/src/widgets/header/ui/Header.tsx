import MyButton from "@shared/ui/button/MyButton";
import styles from "./Header.module.scss";
import {Link, useNavigate} from "react-router-dom";
import {useLogoutMutation} from "@features/auth/model/api/authApi.ts";
import {useAppSelector} from "@shared/lib/hooks/hooks.ts";

export const Header = () => {
  const [logout] = useLogoutMutation()
  const {isAuthenticated} = useAppSelector(state => state.auth)
  const navigate = useNavigate()

  const handleLogout = async () => {
    try {
      await logout().unwrap()
      navigate('/')
    } catch (error) {
      console.log('Logout is failed', error)
    }
  }
  return (
    <header className={styles.header}>
      <a
        href="/"
        className={styles.logo}
      >Backerly</a>
      <div className={styles.links}>
        <a href="#statistics">Statistics</a>
        <a href="#how-it-works">How it works</a>
        <a href="#features">Features</a>
      </div>

      {isAuthenticated ? (
        <MyButton onClick={handleLogout}>Logout</MyButton>) : (

        <div className={styles.nav__btn}>
          <Link
            to='/login'
            className={styles.nav__link}
          >
            <MyButton size="MEDIUM">LOG IN</MyButton>
          </Link>
          <Link
            to='/register'
            className={styles.nav__link}
          >
            <MyButton size="MEDIUM">SIGN UP</MyButton>
          </Link>
        </div>
      )}
    </header>
  );
};
