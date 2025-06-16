import { Button, Title, Text } from '@mantine/core';
import { useNavigate } from 'react-router';
import { useAppDispatch, useAppSelector } from '../../core/store/hooks';
import { logout } from '../../core/store/slices/auth-slice';

export const Dashboard = () => {
  const user = useAppSelector((state) => state.auth.user);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  return (
    <div>
      <Title order={2}>Добро пожаловать, {user?.username}!</Title>
      <Text>Это ваш дашборд.</Text>
      <Button onClick={handleLogout} mt="md" color="red">
        Выйти
      </Button>
    </div>
  );
};