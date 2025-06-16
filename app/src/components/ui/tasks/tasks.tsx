import { useState, useEffect } from 'react';
import { Title, Table, Notification, Button, Modal, TextInput, Select } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import api from '../../../core/api/api';

interface Task {
  id: number;
  title: string;
  description: string;
  skills: string;
  group_id: number;
  dt_start: string;
  dt_end: string;
  priority: string;
  status: string;
}

export const Tasks = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
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
  });

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await api.get('/tasks');
        setTasks(response.data);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Не удалось загрузить задачи');
      }
    };
    fetchTasks();
  }, []);

  const handleCreateTask = async () => {
    try {
      const response = await api.post('/tasks', {
        ...newTask,
        group_id: parseInt(newTask.group_id),
      });
      setTasks([...tasks, response.data]);
      close();
      setNewTask({
        title: '',
        description: '',
        skills: '',
        group_id: '',
        dt_start: '',
        dt_end: '',
        priority: '',
      });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Не удалось создать задачу');
    }
  };

  const taskRows = tasks.map((task) => (
    <Table.Tr key={task.id}>
      <Table.Td>{task.title}</Table.Td>
      <Table.Td>{task.description}</Table.Td>
      <Table.Td>{task.status}</Table.Td>
      <Table.Td>{task.priority}</Table.Td>
    </Table.Tr>
  ));

  return (
    <div>
      <Title order={2}>Задачи</Title>
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
        />
        <TextInput
          label="Описание"
          value={newTask.description}
          onChange={(e) => setNewTask({ ...newTask, description: e.currentTarget.value })}
          mt="md"
        />
        <TextInput
          label="Навыки"
          value={newTask.skills}
          onChange={(e) => setNewTask({ ...newTask, skills: e.currentTarget.value })}
          mt="md"
        />
        <TextInput
          label="ID группы"
          value={newTask.group_id}
          onChange={(e) => setNewTask({ ...newTask, group_id: e.currentTarget.value })}
          mt="md"
          type="number"
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
          data={['Низкий', 'Средний', 'Высокий']}
          mt="md"
        />
        <Button onClick={handleCreateTask} mt="md" fullWidth>
          Сохранить
        </Button>
      </Modal>
    </div>
  );
};