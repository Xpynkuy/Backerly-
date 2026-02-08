import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import { useNavigate } from "react-router-dom";
import {
  useGetMeQuery,
  useLogoutMutation,
} from "@features/auth/model/api/authApi";
import { BadgeDollarSign, LogOut, Search, User } from "lucide-react";
import { AppLink } from "@shared/ui/AppLink/AppLink";
import Avatar from "@shared/ui/avatar/Avatar";
import MyButton from "@shared/ui/button/MyButton";
import styles from "./DropDown.module.scss";
import { useTranslation } from "react-i18next";

const API_ORIGIN = import.meta.env.VITE_API_ORIGIN;

export function DropDown() {
  const { data: me, isLoading } = useGetMeQuery();
  const [logout] = useLogoutMutation();
  const navigate = useNavigate();

  const { t } = useTranslation();

  if (isLoading || !me) return null;

  const avatarSrc = me.avatarUrl
    ? `${API_ORIGIN}${me.avatarUrl}`
    : "/default_avatar.png";

  const handleLogout = async () => {
    try {
      await logout().unwrap();
      navigate("/");
    } catch (e) {
      console.error("Logout failed", e);
    }
  };

  return (
    <Menu as="div" className={styles.root}>
      <MenuButton className={styles.trigger}>
        <Avatar src={avatarSrc} alt="avatar" size="40px" />
      </MenuButton>

      <MenuItems className={styles.menuItems} modal={false}>
        <MenuItem>
          {() => (
            <AppLink icon={<User size={18} />} to={`/profile/${me.username}`}>
              {t("Profile")}
            </AppLink>
          )}
        </MenuItem>

        <MenuItem>
          {() => (
            <AppLink icon={<Search size={18} />} to="/search">
              {t("Search")}
            </AppLink>
          )}
        </MenuItem>

        <MenuItem>
          {() => (
            <AppLink icon={<BadgeDollarSign size={18} />} to="/subscriptions">
              {t("Subscriptions")}
            </AppLink>
          )}
        </MenuItem>
        <hr className={styles.hr} />

        <MenuItem>
          {() => (
            <MyButton
              size="SMALL"
              color="TRANSPARENT"
              icon={<LogOut size={18} />}
              onClick={handleLogout}
            >
              {t("Logout")}
            </MyButton>
          )}
        </MenuItem>
      </MenuItems>
    </Menu>
  );
}
