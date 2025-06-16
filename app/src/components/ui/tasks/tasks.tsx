import { useState, useEffect } from 'react';
import { Title, Table, Notification, Button, Modal, TextInput, Select } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import api from '../../../core/api/api';
import { useAppSelector } from '../../../core/store/hooks';

interface Task {
  id: number;
  title: string;
  description: string;
  skills: string[];
  group_id: number;
  dt_start: string;
  dt_end: string;
  priority: string;
  status: string;
}

interface User {
  id: number;
  username: string;
}

const priorityMap: { [key: string]: string } = {
  Низкий: 'low',
  Средний: 'medium',
  Высокий: 'high',
};

const priorityOptions = [
  { value: 'low', label: 'Низкий' },
  { value: 'medium', label: 'Средний' },
  { value: 'high', label: 'Высокий' },
];

export const Tasks = () => {
  const user = useAppSelector((state) => state.auth.user);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [opened, { open, close }] = useDisclosure(false);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    skills: '',
    group_id: '',
    dt_start: '',
    dt_end: '',
    priority: '',
    user_ids: [] as number[],
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [tasksResponse, usersResponse] = await Promise.all([
          api.get(`/tasks?user_id=${user?.id}`),
          api.get('/users'),
        ]);
        setTasks(tasksResponse.data.map((task: Task) => ({
          ...task,
          priority: Object.keys(priorityMap).find(key => priorityMap[key] === task.priority) || task.priority,
        })));
        setUsers(usersResponse.data);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Не удалось загрузить данные');
      }
    };
    fetchData();
  }, [user?.id]);

  const handleCreateTask = async () => {
    if (!newTask.title.trim() || !newTask.group_id || !newTask.priority) {
      setError('Заполните обязательные поля: Название, ID группы, Приоритет');
      return;
    }
    try {
      const response = await api.post('/tasks', {
        ...newTask,
        group_id: parseInt(newTask.group_id),
        priority: priorityMap[newTask.priority],
        user_ids: [...newTask.user_ids, user?.id].filter(Boolean),
      });
      setTasks([...tasks, {
        ...response.data,
        priority: Object.keys(priorityMap).find(key => priorityMap[key] === response.data.priority) || response.data.priority,
      }]);
      close();
      setNewTask({
        title: '',
        description: '',
        skills: '',
        group_id: '',
        dt_start: '',
        dt_end: '',
        priority: '',
        user_ids: [],
      });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Не удалось создать задачу');
    }
  };

  const taskRows = tasks.map((task) => (
    <Table.Tr key={task.id}>
      <Table.Td>{task.title}</Table.Td>
      <Table.Td>{task.description}</Table.Td>
      <Table.Td>{task.skills.join(', ')}</Table.Td>
      <Table.Td>{task.status}</Table.Td>
      <Table.Td>{task.priority}</Table.Td>
    </Table.Tr>
  ));

  const userOptions = users.map((u) => ({ value: u.id.toString(), label: u.username }));

  return (
    <div>
      <Title order={2}>Мои задачи</Title>
      {error && (
        <Notification color="red" title="Ошибка" onClose={() => setError(null)}>
          {error}
        </Notification>
      )}
      <Button onClick={open} mt="md">
        Создать задачу
      </Button>
      <Table mt="md">
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Название</Table.Th>
            <Table.Th>Описание</Table.Th>
            <Table.Th>Навыки</Table.Th>
            <Table.Th>Статус</Table.Th>
            <Table.Th>Приоритет</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>{taskRows}</Table.Tbody>
      </Table>
      <Modal opened={opened} onClose={close} title="Создать задачу">
        <TextInput
          label="Название"
          value={newTask.title}
          onChange={(e) => setNewTask({ ...newTask, title: e.currentTarget.value })}
          required
          error={newTask.title.trim() ? null : 'Обязательное поле'}
        />
        <TextInput
          label="Описание"
          value={newTask.description}
          onChange={(e) => setNewTask({ ...newTask, description: e.currentTarget.value })}
          mt="md"
        />
        <TextInput
          label="Навыки (через запятую)"
          value={newTask.skills}
          onChange={(e) => setNewTask({ ...newTask, skills: e.currentTarget.value })}
          mt="md"
          placeholder="навык1, навык2"
        />
        <TextInput
          label="ID группы"
          value={newTask.group_id}
          onChange={(e) => setNewTask({ ...newTask, group_id: e.currentTarget.value })}
          mt="md"
          type="number"
          required
          error={newTask.group_id ? null : 'Обязательное поле'}
        />
        <TextInput
          label="Дата начала"
          value={newTask.dt_start}
          onChange={(e) => setNewTask({ ...newTask, dt_start: e.currentTarget.value })}
          mt="md"
          type="datetime-local"
        />
        <TextInput
          label="Дата окончания"
          value={newTask.dt_end}
          onChange={(e) => setNewTask({ ...newTask, dt_end: e.currentTarget.value })}
          mt="md"
          type="datetime-local"
        />
        <Select
          label="Приоритет"
          value={newTask.priority}
          onChange={(value) => setNewTask({ ...newTask, priority: value || '' })}
          data={priorityOptions}
          mt="md"
          required
          error={newTask.priority ? null : 'Обязательное поле'}
        />
        <Select
          label="Назначить пользователей"
          value={newTask.user_ids.map(String)}
          onChange={(values) => setNewTask({ ...newTask, user_ids: values.map(Number) })}
          data={userOptions}
          mt="md"
          multiple
        />
        <Button onClick={handleCreateTask} mt="md" fullWidth>
          Сохранить
        </Button>
      </Modal>
    </div>
  );
};