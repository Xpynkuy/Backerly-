import MyButton from "@shared/ui/button/MyButton";
import MyInput from "@shared/ui/input/MyInput";
import styles from "./CommentForm.module.scss";
import { Forward } from "lucide-react";
import { useTranslation } from "react-i18next";

interface CommentFormProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  isLoading: boolean;
}

export const CommentForm = ({
  value,
  onChange,
  onSubmit,
  isLoading,
}: CommentFormProps) => {
  const { t } = useTranslation();
  return (
    <div className={styles.commentInput}>
      <MyInput
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={t("Write a comment...")}
      />

      <MyButton
        onClick={onSubmit}
        disabled={isLoading}
        icon={<Forward size={22} color="#7272D1" />}
        color="TRANSPARENT"
        size="AUTO"
      />
    </div>
  );
};
