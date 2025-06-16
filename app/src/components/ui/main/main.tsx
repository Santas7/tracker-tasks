import { useState, useEffect } from 'react';
import { Title, Text, Notification, Paper, SimpleGrid } from '@mantine/core';
import { DonutChart } from '@mantine/charts';
import api from '../../../core/api/api';
import { useAppSelector } from '../../../core/store/hooks';

interface Stats {
  tasksCount: number;
  groupsCount: number;
}

export const Main = () => {
  const user = useAppSelector((state) => state.auth.user);
  const [stats, setStats] = useState<Stats>({ tasksCount: 0, groupsCount: 0 });
  const [error, setError] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [tasksResponse, groupsResponse] = await Promise.all([
          api.get('/tasks'),
          api.get('/groups'),
        ]);
        setStats({
          tasksCount: tasksResponse.data.length,
          groupsCount: groupsResponse.data.length,
        });
      } catch (err: any) {
        setError(err.response?.data?.message || 'Не удалось загрузить статистику');
      }
    };
    fetchStats();

    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div>
      <Title order={2}>Главная</Title>
      <Text mt="sm">
        Добро пожаловать, {user?.username}! Сегодня: {currentTime.toLocaleString('ru-RU')}
      </Text>
      {error && (
        <Notification color="red" title="Ошибка" onClose={() => setError(null)}>
          {error}
        </Notification>
      )}
      <SimpleGrid cols={{ base: 1, sm: 2 }} mt="md">
        <Paper withBorder p="md">
          <DonutChart
            data={[
              { name: 'Задачи', value: stats.tasksCount, color: 'blue' },
              { name: 'Группы', value: stats.groupsCount, color: 'teal' },
            ]}
            chartLabel="Статистика"
          />
        </Paper>
        <Paper withBorder p="md">
          <DonutChart
            data={[
              { name: 'Задачи', value: stats.tasksCount, color: 'blue' },
              { name: 'Группы', value: stats.groupsCount, color: 'teal' },
            ]}
            chartLabel="Статистика"
          />
        </Paper>
      </SimpleGrid>
    </div>
  );
};