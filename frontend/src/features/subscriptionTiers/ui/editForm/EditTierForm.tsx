import { useForm } from "react-hook-form";
import MyInput from "@shared/ui/input/MyInput";
import TextArea from "@shared/ui/textArea/TextArea";
import MyButton from "@shared/ui/button/MyButton";
import styles from "./EditTierForm.module.scss";
import { useUpdateTierMutation } from "../../model/api/subscriptionApi";
import { useTranslation } from "react-i18next";
import type { SubscriptionTier } from "../../model/types/types";

interface EditTierFormData {
  title: string;
  description: string;
}

interface EditTierFormProps {
  username: string;
  tier: SubscriptionTier;
  onUpdated: () => void;
  onCancel: () => void;
}

export const EditTierForm = ({
  username,
  tier,
  onUpdated,
  onCancel,
}: EditTierFormProps) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<EditTierFormData>({
    defaultValues: {
      title: tier.title,
      description: tier.description ?? "",
    },
  });

  const [updateTier, { isLoading }] = useUpdateTierMutation();
  const { t } = useTranslation();

  const currentPriceDisplay =
    tier.priceCents != null && tier.priceCents > 0
      ? `${tier.priceCents / 100} ₽`
      : t("Free");

  const onSubmit = async (data: EditTierFormData) => {
    const form = new FormData();
    form.append("title", data.title.trim());
    form.append("description", data.description.trim());
    // priceCents intentionally omitted — pricing is locked after creation

    try {
      await updateTier({ username, tierId: tier.id, form }).unwrap();
      onUpdated();
    } catch (err: any) {
      console.error("update tier failed", err);
      alert(err?.data?.error || err?.message || t("tier.updateFailed"));
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
      <h4 className={styles.title}>{t("tier.editTitle")}</h4>

      <span className={styles.formFieldsTitle}>{t("Enter tier title")}</span>
      <MyInput
        {...register("title", {
          required: t("Title is required"),
          minLength: {
            value: 3,
            message: t("Title must be at least 3 characters"),
          },
        })}
        error={errors.title?.message}
      />

      <span className={styles.formFieldsTitle}>
        {t("Enter tier description")}
      </span>
      <TextArea
        {...register("description")}
        width="100%"
        error={errors.description?.message}
      />

      <div className={styles.priceLocked}>
        <span className={styles.priceLockedLabel}>{t("tier.priceLabel")}</span>
        <span className={styles.priceLockedValue}>
          {currentPriceDisplay} / {t("per month")}
        </span>
        <span className={styles.priceLockedHint}>{t("tier.priceLocked")}</span>
      </div>

      <div className={styles.formButtons}>
        <MyButton type="submit" disabled={isLoading}>
          {isLoading ? "..." : t("Save")}
        </MyButton>
        <MyButton
          type="button"
          color="GRAY"
          onClick={onCancel}
          disabled={isLoading}
        >
          {t("Cancel")}
        </MyButton>
      </div>
    </form>
  );
};