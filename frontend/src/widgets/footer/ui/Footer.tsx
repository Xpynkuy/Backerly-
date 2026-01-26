import { useTranslation } from "react-i18next";
import styles from "./Footer.module.scss";
import { renderWithLineBreaks } from "@shared/lib/utils/renderWithLineBreaks";

export const Footer = () => {
  const { t } = useTranslation();
  return (
    <footer className={styles.footer}>
      <span>© 2025 {renderWithLineBreaks(t("footer.copyright"))} </span>
    </footer>
  );
};
