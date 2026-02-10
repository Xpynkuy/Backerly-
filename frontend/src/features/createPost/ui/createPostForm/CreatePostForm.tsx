import React, { useState } from "react";
import { useForm } from "react-hook-form";
import MyInput from "@shared/ui/input/MyInput";
import TextArea from "@shared/ui/textArea/TextArea";
import MyButton from "@shared/ui/button/MyButton";
import styles from "./CreatePostForm.module.scss";

import { useGetTiersQuery } from "@features/subscriptionTiers/model/api/subscriptionApi";
import { useCreatePostMutation } from "@entities/post/model/api/postApi";
import { useTranslation } from "react-i18next";

interface CreatePostFormData {
  title: string;
  description: string;
  image: FileList | null;
}

export const CreatePostForm: React.FC<{
  username: string;
  onCreated?: () => void;
  isLoading?: boolean;
}> = ({ username, onCreated }) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreatePostFormData>({
    defaultValues: {
      title: "",
      description: "",
      image: null,
    },
  });

  const [createPost, { isLoading }] = useCreatePostMutation();
  const { data: tiersData } = useGetTiersQuery(
    { username },
    { skip: !username },
  );
  const { t } = useTranslation();

  const [isPaid, setIsPaid] = useState(false);
  const [accessTierId, setAccessTierId] = useState<string | null>(null);

  const tiers = tiersData?.items ?? [];

  const onSubmit = async (data: CreatePostFormData) => {
    const form = new FormData();
    form.append("title", data.title.trim());
    form.append("description", data.description.trim());

    if (data.image && data.image.length > 0) {
      form.append("image", data.image[0]);
    }

    form.append("isPaid", isPaid ? "1" : "0");

    if (isPaid && accessTierId) {
      form.append("accessTierId", accessTierId);
    }

    await createPost({ username, form }).unwrap();

    reset();
    setIsPaid(false);
    setAccessTierId(null);
    onCreated?.();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
      <h3 className={styles.title}>{t("Create post")}</h3>

      <span className={styles.formFieldsTitle}>{t("Enter post title")}</span>
      <MyInput
        {...register("title", {
          required: t("Title is required"),
          minLength: {
            value: 3,
            message: t("Title must be at least 3 characters"),
          },
          maxLength: {
            value: 60,
            message: t("Title must be less than 60 characters"),
          },
        })}
        error={errors.title?.message}
      />

      <span className={styles.formFieldsTitle}>
        {t("Enter post description")}
      </span>
      <TextArea
        {...register("description", {
          required: t("Description is required"),
          minLength: {
            value: 4,
            message: t("Description must be at least 4 characters"),
          },
        })}
        width="100%"
        error={errors.description?.message}
      />

      <span className={styles.formFieldsTitle}>{t("Enter post image")}</span>
      <input type="file" accept="image/*" {...register("image")} />

      <div className={styles.radioContainer}>
        <span className={styles.formFieldsTitle}>
          {t("Enter subscription levels")}
        </span>
        <div className={styles.radio}>
          <label className={styles.radioLabel}>
            <input
              type="radio"
              checked={!isPaid}
              onChange={() => setIsPaid(false)}
            />
            {t("Free")}
          </label>
          <label className={styles.radioLabel}>
            <input
              type="radio"
              checked={isPaid}
              onChange={() => setIsPaid(true)}
            />
            {t("Paid")}
          </label>
        </div>
      </div>

      {isPaid && (
        <div>
          <select
            value={accessTierId ?? ""}
            onChange={(e) => setAccessTierId(e.target.value || null)}
            className={styles.select}
          >
            <option value="">{t("Choose access tier")}</option>
            {tiers.map((t) => (
              <option key={t.id} value={t.id}>
                {t.title}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className={styles.formButton}>
        <MyButton type="submit" disabled={isLoading}>
          {isLoading ? t("Publishing...") : t("Publish")}
        </MyButton>
      </div>
    </form>
  );
};