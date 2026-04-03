import React from "react";
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
  price: string;
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
      price:
        tier.priceCents != null && tier.priceCents > 0
          ? String(tier.priceCents / 100)
          : "",
    },
  });

  const [updateTier, { isLoading }] = useUpdateTierMutation();
  const { t } = useTranslation();

  const onSubmit = async (data: EditTierFormData) => {
    const form = new FormData();
    form.append("title", data.title.trim());
    form.append("description", data.description.trim());
    if (data.price) {
      const cents = Math.round(Number(data.price) * 100);
      if (!Number.isFinite(cents) || cents <= 0) {
        return alert(t("tier.invalidPrice"));
      }
      form.append("priceCents", String(cents));
    }

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

      <span className={styles.formFieldsTitle}>{t("Enter tier price")}</span>
      <MyInput
        {...register("price", {
          required: t("Price is required"),
          validate: (value) => {
            const num = Number(value);
            if (num <= 0) return t("Price must be greater than 0");
            return true;
          },
        })}
        error={errors.price?.message}
      />

      <div className={styles.formButtons}>
        <MyButton type="submit" disabled={isLoading}>
          {isLoading ? "..." : t("Save")}
        </MyButton>
        <MyButton type="button" color="GRAY" onClick={onCancel} disabled={isLoading}>
          {t("Cancel")}
        </MyButton>
      </div>
    </form>
  );
};
