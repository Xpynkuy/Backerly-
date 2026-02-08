import React, { memo } from "react";
import { useForm } from "react-hook-form";
import { useLoginMutation } from "@features/auth/model/api/authApi.ts";
import { Link, useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "@shared/lib/hooks/hooks.ts";
import styles from "./LoginForm.module.scss";
import { setError } from "@features/auth/model/slice/authSlice.ts";
import MyInput from "@shared/ui/input/MyInput.tsx";
import MyButton from "@shared/ui/button/MyButton.tsx";
import { useTranslation } from "react-i18next";
import { renderWithLineBreaks } from "@shared/lib/utils/renderWithLineBreaks";

interface LoginFormData {
  username: string;
  password: string;
}

const LoginForm = memo(() => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    defaultValues: {
      username: "",
      password: "",
    },
    mode: "onBlur",
  });

  const [login, { isLoading }] = useLoginMutation();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { error } = useAppSelector((state) => state.auth);

  const onSubmit = async (data: LoginFormData) => {
    dispatch(setError(null));

    try {
      const result = await login(data).unwrap();
      navigate(`/profile/${result.user.username}`);
    } catch (err) {
      let message = "Login failed";

      if (typeof err === "object" && err !== null && "data" in err) {
        const errorData = err as {
          data?: { error?: string; message?: string };
        };
        message =
          errorData.data?.error || errorData.data?.message || "Login failed";
      }
      dispatch(setError(message));
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3 className={styles.title}>
          {renderWithLineBreaks(t("loginForm.title"))}
        </h3>
        <p className={styles.desc}>
          {renderWithLineBreaks(t("loginForm.desc"))}
        </p>
      </div>
      <form className={styles.form} onSubmit={handleSubmit(onSubmit)}>
        <MyInput
          {...register("username", {
            required: t("Username is required"),
            minLength: {
              value: 3,
              message: t("Username must be at least 3 characters"),
            },
            maxLength: {
              value: 20,
              message: t("Username must be at most 20 characters"),
            },
          })}
          placeholder="Username"
          error={errors.username?.message}
        />
        <MyInput
          {...register("password", {
            required: t("Password is required"),
            minLength: {
              value: 6,
              message: t("Password must be at least 6 characters"),
            },
            maxLength: {
              value: 20,
              message: t("Password must be at most 20 characters"),
            },
          })}
          placeholder="Password"
          type="password"
          showPasswordToggle={true}
          error={errors.password?.message}
        />
        {error && <div className={styles.error}>{error}</div>}
        <MyButton type="submit" disabled={isLoading} size="FULL">
          {renderWithLineBreaks(t("loginForm.btn"))}
        </MyButton>
      </form>
      <div className={styles.navigate}>
        {renderWithLineBreaks(t("loginForm.nav"))}
        <Link to="/register" className={styles.link}>
          {renderWithLineBreaks(t("loginForm.navLink"))}
        </Link>
      </div>
    </div>
  );
});

export default LoginForm;
