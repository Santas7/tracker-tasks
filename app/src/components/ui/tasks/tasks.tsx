import { useState, useEffect } from 'react';
import { Title, Button, Notification } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import api from '../../../core/api/api';
import { ModalCreateTask } from './modals-task/modal-create-task/modal-create-task';
import { ModalEditTask } from './modals-task/modal-edit-task/modal-edit.task';
import { PlotTasks } from './plot-tasks/plot-tasks';
import { ModalsTask } from './modals-task/modals-task';

interface Task {
  id: number;
  title: string;
  description: string;
  skills: string[] | null;
  group_id: number;
  dt_start: string | null;
  dt_end: string | null;
  priority: string | null;
  status: string | null;
}

export const Tasks = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [opened, { open, close }] = useDisclosure(false);
  const [editOpened, { open: openEdit, close: closeEdit }] = useDisclosure(false);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    skills: '',
    group_id: '',
    dt_start: '',
    dt_end: '',
    priority: 'low',
    status: 'new'
  });
  const [editTask, setEditTask] = useState<Task | null>(null);

  const statusOptions = [
    { value: 'new', label: 'Новая' },
    { value: 'in_progress', label: 'В работе' },
    { value: 'completed', label: 'Завершена' },
  ];

  const priorityOptions = [
    { value: 'low', label: 'Низкий' },
    { value: 'medium', label: 'Средний' },
    { value: 'high', label: 'Высокий' },
  ];

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
        group_id: newTask.group_id ? parseInt(newTask.group_id) : null,
        skills: newTask.skills ? newTask.skills.split(',').map(s => s.trim()).filter(s => s) : null,
        dt_start: newTask.dt_start || null,
        dt_end: newTask.dt_end || null,
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
        priority: 'low',
        status: 'new'
      });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Не удалось создать задачу');
    }
  };

  const handleEditTask = async () => {
    if (!editTask) return;
    try {
      const response = await api.put(`/tasks/${editTask.id}`, {
        ...editTask,
        group_id: editTask.group_id ? parseInt(String(editTask.group_id)) : null,
        skills: editTask.skills ? editTask.skills : null,
        dt_start: editTask.dt_start || null,
        dt_end: editTask.dt_end || null,
      });
      setTasks(tasks.map(t => t.id === editTask.id ? response.data : t));
      closeEdit();
      setEditTask(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Не удалось обновить задачу');
    }
  };

  const handleStatusChange = async (taskId: number, newStatus: string) => {
    try {
      const response = await api.put(`/tasks/${taskId}/status`, { status: newStatus });
      setTasks(tasks.map(t => t.id === taskId ? response.data : t));
    } catch (err: any) {
      setError(err.response?.data?.message || 'Не удалось обновить статус');
    }
  };

  const handleDeleteTask = async (taskId: number) => {
    try {
      await api.delete(`/tasks/${taskId}`);
      setTasks(tasks.filter(t => t.id !== taskId));
    } catch (err: any) {
      setError(err.response?.data?.message || 'Не удалось удалить задачу');
    }
  };

  const columns = {
    'Новая': tasks.filter(t => !t.status || t.status === 'new'),
    'В работе': tasks.filter(t => t.status === 'in_progress'),
    'Завершена': tasks.filter(t => t.status === 'completed'),
  };

  return (
    <div>
      <Title order={2}>Задачи</Title>
      {error && (
        <Notification color="red" title="Ошибка" onClose={() => setError(null)}>
          {error}
        </Notification>
      )}
      <Button onClick={open} mt="md">Создать задачу</Button>
      
      <PlotTasks
        columns={columns}
        statusOptions={statusOptions}
        priorityOptions={priorityOptions}
        handleStatusChange={handleStatusChange}
        handleDeleteTask={handleDeleteTask}
        openEdit={openEdit}
        setEditTask={setEditTask}
      />
      <ModalsTask
        opened={opened}
        close={close}
        newTask={newTask}
        setNewTask={setNewTask}
        handleCreateTask={handleCreateTask}
        editOpened={editOpened}
        closeEdit={closeEdit}
        editTask={editTask}
        setEditTask={setEditTask}
        handleEditTask={handleEditTask}
        priorityOptions={priorityOptions}
        statusOptions={statusOptions}
      />
    </div>
  );
};