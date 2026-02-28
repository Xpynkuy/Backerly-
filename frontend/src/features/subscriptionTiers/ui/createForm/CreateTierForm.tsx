import React from "react";
import { useForm } from "react-hook-form";
import MyInput from "@shared/ui/input/MyInput";
import TextArea from "@shared/ui/textArea/TextArea";
import MyButton from "@shared/ui/button/MyButton";
import styles from "./CreateTierForm.module.scss";
import { useCreateTierMutation } from "../../model/api/subscriptionApi";
import { useTranslation } from "react-i18next";

interface CreateTierFormData {
  title: string;
  description: string;
  price: string;
}

export const CreateTierForm = ({
  username,
  onCreated,
}: {
  username: string;
  onCreated: () => void;
}) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateTierFormData>({
    defaultValues: {
      title: "",
      description: "",
      price: "",
    },
  });

  const [createTier, { isLoading }] = useCreateTierMutation();
  const {t} = useTranslation()

  const onSubmit = async (data: CreateTierFormData) => {
    if (!data.title.trim()) return alert("Title is required");

    const form = new FormData();
    form.append("title", data.title.trim());
    form.append("description", data.description.trim());
    if (data.price) {
      const cents = Math.round(Number(data.price) * 100);
      if (!Number.isFinite(cents)) return alert("Invalid price");
      form.append("priceCents", String(cents));
    }

    try {
      await createTier({ username, form }).unwrap();
      onCreated();
      reset();
    } catch (err: any) {
      console.error("create tier failed", err);
      alert(err?.data?.error || err?.message || "Create tier failed");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
      <h4 className={styles.title}>{t("Create subscription tier")}</h4>
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
      <span className={styles.formFieldsTitle}>{t("Enter tier description")}</span>
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
          {isLoading ? "Creating..." : t("Create tier")}
        </MyButton>
        <MyButton
          type="button"
          onClick={() => reset()}
          disabled={isLoading}
        >
          {t("Reset")}
        </MyButton>
      </div>
    </form>
  );
};