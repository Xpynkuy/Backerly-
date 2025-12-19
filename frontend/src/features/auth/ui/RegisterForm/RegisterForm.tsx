import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAppSelector } from "@shared/lib/hooks/hooks.ts";
import { useRegisterMutation } from "@features/auth/model/api/authApi.ts";
import styles from "./RegisterForm.module.scss";
import MyInput from "@shared/ui/input/MyInput.tsx";
import MyButton from "@shared/ui/button/MyButton.tsx";
import { useTranslation } from "react-i18next";
import { renderWithLineBreaks } from "@shared/lib/utils/renderWithLineBreaks";

interface RegisterForm {
  username: string;
  password: string;
}

const RegisterForm = () => {
  const [formData, setFormData] = useState<RegisterForm>({
    username: "",
    password: "",
  });
  const [register, { isLoading, isSuccess }] = useRegisterMutation();
  const navigate = useNavigate();
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  const { t } = useTranslation();

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/profile");
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isSuccess) {
      navigate("/login");
    }
  }, [isSuccess]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await register(formData).unwrap();
    } catch (err) {
      console.log("Registration failed", err);
    }
  };

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.logo}>Backerly</div>
        <h3>{renderWithLineBreaks(t("registerForm.title"))}</h3>
        <p>{renderWithLineBreaks(t("registerForm.desc"))}</p>
      </div>
      <form className={styles.form} onSubmit={handleSubmit}>
        <MyInput
          name="username"
          placeholder="Username"
          value={formData.username}
          onChange={handleChange}
        ></MyInput>
        <MyInput
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          type="password"
          showPasswordToggle={true}
        ></MyInput>

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
};

export default RegisterForm;
