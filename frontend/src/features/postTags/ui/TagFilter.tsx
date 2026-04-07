import { useTranslation } from "react-i18next";
import styles from "./TagFilter.module.scss";

interface TagFilterProps {
  tags: string[];
  activeTag: string | null;
  onSelect: (tag: string | null) => void;
}

export const TagFilter = ({ tags, activeTag, onSelect }: TagFilterProps) => {
  const { t } = useTranslation();

  if (tags.length === 0) return null;

  return (
    <div className={styles.container}>
      <button
        className={`${styles.chip} ${!activeTag ? styles.active : ""}`}
        onClick={() => onSelect(null)}
      >
        {t("tags.all")}
      </button>
      {tags.map((tag) => (
        <button
          key={tag}
          className={`${styles.chip} ${activeTag === tag ? styles.active : ""}`}
          onClick={() => onSelect(activeTag === tag ? null : tag)}
        >
          #{tag}
        </button>
      ))}
    </div>
  );
};
