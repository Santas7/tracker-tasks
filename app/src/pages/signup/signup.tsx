import {
  Button,
  Paper,
  PasswordInput,
  TextInput,
  Title,
  Notification,
} from "@mantine/core";
import { useState } from "react";
import api from "../../core/api/api";
import classes from "./signup.module.css";
import { useNavigate } from "react-router";

export const SignUp = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async () => {
    if (password !== confirmPassword) {
      setError("Пароли не совпадают");
      return;
    }

    try {
      await api.post("/register", { username, email, password });
      navigate("/");
    } catch (err: { response: { data: { message: string } } }) {
      setError(err.response?.data?.message || "Ошибка при регистрации");
    }
  };

  return (
    <div className={classes.wrapper}>
      <Paper className={classes.form}>
        <Title order={2} className={classes.title}>
          Новый аккаунт
        </Title>
        {error && (
          <Notification
            color="red"
            title="Ошибка"
            onClose={() => setError(null)}
          >
            {error}
          </Notification>
        )}
        <TextInput
          className={classes.inputData}
          label="Имя пользователя"
          placeholder="Введите имя пользователя"
          size="md"
          radius="md"
          value={username}
          onChange={(e) => setUsername(e.currentTarget.value)}
        />
        <TextInput
          className={classes.inputData}
          label="Эл. почта"
          placeholder="hello@gmail.com"
          size="md"
          radius="md"
          value={email}
          onChange={(e) => setEmail(e.currentTarget.value)}
        />
        <PasswordInput
          className={classes.inputData}
          label="Пароль"
          placeholder="Введите пароль"
          mt="md"
          size="md"
          radius="md"
          value={password}
          onChange={(e) => setPassword(e.currentTarget.value)}
        />
        <PasswordInput
          className={classes.inputData}
          label="Повторите пароль"
          placeholder="Введите повторно пароль"
          mt="md"
          size="md"
          radius="md"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.currentTarget.value)}
        />
        <Button fullWidth mt="xl" size="md" radius="md" onClick={handleSubmit}>
          Зарегистрироваться
        </Button>
      </Paper>
    </div>
  );
};
