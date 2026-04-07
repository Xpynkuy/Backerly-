import { useState } from "react";
import { X } from "lucide-react";
import { useTranslation } from "react-i18next";
import styles from "./TagInput.module.scss";

interface TagInputProps {
  tags: string[];
  onChange: (tags: string[]) => void;
  maxTags?: number;
}

export const TagInput = ({ tags, onChange, maxTags = 5 }: TagInputProps) => {
  const [input, setInput] = useState("");
  const { t } = useTranslation();

  const addTag = () => {
    const tag = input
      .trim()
      .toLowerCase()
      .replace(/[^a-zа-яё0-9_-]/gi, "");
    if (!tag || tags.includes(tag) || tags.length >= maxTags) return;
    onChange([...tags, tag]);
    setInput("");
  };

  const removeTag = (tag: string) => {
    onChange(tags.filter((t) => t !== tag));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag();
    }
    if (e.key === "Backspace" && !input && tags.length > 0) {
      onChange(tags.slice(0, -1));
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.tagList}>
        {tags.map((tag) => (
          <span key={tag} className={styles.tag}>
            #{tag}
            <button
              type="button"
              className={styles.removeBtn}
              onClick={() => removeTag(tag)}
            >
              <X size={12} />
            </button>
          </span>
        ))}
      </div>
      {tags.length < maxTags && (
        <input
          className={styles.input}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={addTag}
          placeholder={t("tags.placeholder")}
        />
      )}
    </div>
  );
};
