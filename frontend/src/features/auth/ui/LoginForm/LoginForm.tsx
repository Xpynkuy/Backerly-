import React, {useEffect, useState} from "react";
import {useLoginMutation} from "@features/auth/model/api/authApi.ts";
import {Link, useNavigate} from "react-router-dom";
import {useAppDispatch, useAppSelector} from "@shared/lib/hooks/hooks.ts";
import styles from './LoginForm.module.scss'
import {setError} from "@features/auth/model/slice/authSlice.ts";
import MyInput from "@shared/ui/input/MyInput.tsx";
import MyButton from "@shared/ui/button/MyButton.tsx";

interface LoginForm {
  username: string;
  password: string;
}

const LoginForm = () => {
  const [formData, setFormData] = useState<LoginForm>({
    username: '',
    password: ''
  })
  const [login, {isLoading}] = useLoginMutation()

  const dispatch = useAppDispatch()
  const navigate = useNavigate()

  const {isAuthenticated, error} = useAppSelector(state => state.auth)

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/profile')
    }
  }, [isAuthenticated])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Очищаем предыдущую ошибку
    dispatch(setError(null));

    try {
      await login(formData).unwrap();
    } catch (err) {
      let message = 'Login failed';

      if (typeof err === 'object' && err !== null && 'data' in err) {
        const data = (err as any).data;
        message = data?.error || data?.message || 'Login failed';
      }
      dispatch(setError(message));
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const {name, value} = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3 className={styles.title}>Sign In</h3>
        <p className={styles.desc}>Enter your credentials to access your account</p>
      </div>
      <form
        className={styles.form}
        onSubmit={handleSubmit}
      >
        <MyInput
          name='username'
          placeholder="Username"
          value={formData.username}
          onChange={handleChange}
        ></MyInput>
        <MyInput
          name='password'
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          type='password'
          showPasswordToggle={true}
        ></MyInput>
        {error && <div>{error}</div>}
        <MyButton
          type='submit'
          disabled={isLoading}
          size='FULL'
        >Sign In</MyButton>
      </form>
      <div className={styles.navigate}>
        Don't have ad account?
        <Link
          to='/register'
          className={styles.link}
        >Create one</Link>
      </div>
    </div>
  );
};

export default LoginForm;