import React, { memo, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { useAppSelector } from "@shared/lib/hooks/hooks.ts";
import { useRegisterMutation } from "@features/auth/model/api/authApi.ts";
import styles from "./RegisterForm.module.scss";
import MyInput from "@shared/ui/input/MyInput.tsx";
import MyButton from "@shared/ui/button/MyButton.tsx";
import { useTranslation } from "react-i18next";
import { renderWithLineBreaks } from "@shared/lib/utils/renderWithLineBreaks";

interface RegisterFormData {
  username: string;
  password: string;
}

const RegisterForm = memo(() => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    defaultValues: {
      username: "",
      password: "",
    },
    mode: "onBlur",
  });

  const [registerUser, { isLoading, isSuccess }] = useRegisterMutation();
  const [serverError, setServerError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const { t } = useTranslation();

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/profile");
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (isSuccess) {
      navigate("/login");
    }
  }, [isSuccess, navigate]);

  const onSubmit = async (data: RegisterFormData) => {
    setServerError(null);
    try {
      await registerUser(data).unwrap();
    } catch (err: any) {
      console.log("Registration failed", err);
      // Извлекаем ошибку из разных возможных структур ответа
      let errorMessage = "Registration failed";
      
      if (err?.data?.error) {
        errorMessage = err.data.error;
      } else if (err?.data?.message) {
        errorMessage = err.data.message;
      } else if (err?.error) {
        errorMessage = err.error;
      } else if (err?.message) {
        errorMessage = err.message;
      }
      
      setServerError(errorMessage);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.logo}>Backerly</div>
        <h3>{renderWithLineBreaks(t("registerForm.title"))}</h3>
        <p>{renderWithLineBreaks(t("registerForm.desc"))}</p>
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
              message: t("Username must be less than 20 characters"),
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
              message: t("Password must be less than 20 characters"),
            },
          })}
          placeholder="Password"
          type="password"
          showPasswordToggle={true}
          error={errors.password?.message}
        />
        {serverError && <div className={styles.error}>{serverError}</div>}
        <MyButton type="submit" disabled={isLoading} size="FULL">
          {renderWithLineBreaks(t("registerForm.btn"))}
        </MyButton>
      </form>
      <div className={styles.navigate}>
        {renderWithLineBreaks(t("registerForm.nav"))}
        <Link to="/login" className={styles.link}>
          {renderWithLineBreaks(t("registerForm.navLink"))}
        </Link>
      </div>
    </div>
  );
});

export default RegisterForm;