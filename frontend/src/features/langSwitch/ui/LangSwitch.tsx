import MyButton from "@shared/ui/button/MyButton";
import { useTranslation } from "react-i18next";

export const LangSwitch = () => {
  const { i18n } = useTranslation();

  const toggleLanguage = () => {
    const newLng = i18n.language === "ru" ? "en" : "ru";
    i18n.changeLanguage(newLng);
  };
  return (
    <MyButton color="TRANSPARENT" size="AUTO" onClick={toggleLanguage}>
      {i18n.language === "ru" ? "RU" : "EN"}
    </MyButton>
  );
};
