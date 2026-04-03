import React, { useState } from "react";
import { useForm } from "react-hook-form";
import MyInput from "@shared/ui/input/MyInput";
import TextArea from "@shared/ui/textArea/TextArea";
import MyButton from "@shared/ui/button/MyButton";
import styles from "./EditPostForm.module.scss";
import { useGetTiersQuery } from "@features/subscriptionTiers/model/api/subscriptionApi";
import { useUpdatePostMutation } from "@entities/post/model/api/postApi";
import { useTranslation } from "react-i18next";
import type { Post } from "@entities/post/model/types/postTypes";

interface EditPostFormData {
  title: string;
  description: string;
  image: FileList | null;
}

interface EditPostFormProps {
  username: string;
  post: Post;
  onUpdated: () => void;
  onCancel: () => void;
}

export const EditPostForm: React.FC<EditPostFormProps> = ({
  username,
  post,
  onUpdated,
  onCancel,
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<EditPostFormData>({
    defaultValues: {
      title: post.title,
      description: post.description,
      image: null,
    },
  });

  const [updatePost, { isLoading }] = useUpdatePostMutation();
  const { data: tiersData } = useGetTiersQuery(
    { username },
    { skip: !username },
  );
  const { t } = useTranslation();

  const [isPaid, setIsPaid] = useState(!!post.isPaid);
  const [accessTierId, setAccessTierId] = useState<string | null>(
    post.accessTier?.id ?? null,
  );
  const [removeImage, setRemoveImage] = useState(false);

  const tiers = tiersData?.items ?? [];

  const onSubmit = async (data: EditPostFormData) => {
    const form = new FormData();
    form.append("title", data.title.trim());
    form.append("description", data.description.trim());

    if (data.image && data.image.length > 0) {
      form.append("image", data.image[0]);
    } else if (removeImage) {
      form.append("removeImage", "1");
    }

    form.append("isPaid", isPaid ? "1" : "0");
    if (isPaid && accessTierId) {
      form.append("accessTierId", accessTierId);
    }

    try {
      await updatePost({ postId: post.id, username, form }).unwrap();
      onUpdated();
    } catch (err: any) {
      console.error("update post failed", err);
      alert(err?.data?.error || err?.message || t("editPost.failed"));
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
      <h3 className={styles.title}>{t("editPost.title")}</h3>

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
      {post.imageUrl && !removeImage && (
        <div className={styles.currentImage}>
          <span className={styles.formFieldsTitle}>
            {t("editPost.hasImage")}
          </span>
          <MyButton
            type="button"
            size="AUTO"
            color="RED"
            onClick={() => setRemoveImage(true)}
          >
            {t("editPost.removeImage")}
          </MyButton>
        </div>
      )}
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
