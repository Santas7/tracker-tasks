import { Anchor, Button, Checkbox, Paper, PasswordInput, Text, TextInput, Title, Notification } from '@mantine/core';
import { useState } from 'react';

import api from '../../core/api/api';
import { useAppDispatch } from '../../core/store/hooks';
import { login } from '../../core/store/slices/auth-slice';
import classes from './signin.module.css';
import { useNavigate } from 'react-router';

export const SignIn = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const handleSubmit = async () => {
    try {
      const response = await api.post('/login', { username, password });
      const { token, user } = response.data;
      dispatch(login({ token, user })); // Dispatch login action
      navigate('/dashboard'); // Redirect to dashboard
    } catch (err: any) {
      setError(err.response?.data?.message || 'Ошибка при входе');
    }
  };

  return (
    <div className={classes.wrapper}>
      <Paper className={classes.form}>
        <Title order={2} className={classes.title}>
          Добро пожаловать!
        </Title>
        {error && <Notification color="red" title="Ошибка" onClose={() => setError(null)}>{error}</Notification>}
        <br/>
        <TextInput
          label="Эл. почта или имя пользователя"
          placeholder="hello@gmail.com"
          size="md"
          radius="md"
          value={username}
          onChange={(e) => setUsername(e.currentTarget.value)}
        />
        <PasswordInput
          label="Пароль"
          placeholder="Введите пароль"
          mt="md"
          size="md"
          radius="md"
          value={password}
          onChange={(e) => setPassword(e.currentTarget.value)}
        />
        <Checkbox label="Запомнить меня" mt="xl" size="md" />
        <Button fullWidth mt="xl" size="md" radius="md" onClick={handleSubmit}>
          Войти
        </Button>
        <Text ta="center" mt="md">
          Нету аккаунта?{' '}
          <Anchor component="a" href="/signup" fw={500}>
            Регистрация
          </Anchor>
        </Text>
      </Paper>
    </div>
  );
};