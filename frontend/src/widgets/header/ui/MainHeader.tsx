import { useNavigate } from "react-router-dom";
import { useLogoutMutation } from "@features/auth/model/api/authApi";
import MyButton from "@shared/ui/button/MyButton";
import styles from "./Header.module.scss";
import { LangSwitch } from "@features/langSwitch";

const MainHeader = () => {
  const [logout] = useLogoutMutation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout().unwrap();
      navigate("/");
    } catch (error) {
      console.log("Logout is failed", error);
    }
  };
  return (
    <header className={styles.header}>
      <a href="/feed" className={styles.logo}>
        Backerly
      </a>
      <div className={styles.nav__btn}>
        <LangSwitch />
        <MyButton onClick={handleLogout}>Logout</MyButton>
      </div>
    </header>
  );
};

export default MainHeader;
