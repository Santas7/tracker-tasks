import { useState, useEffect } from 'react';
import { Title, Card, Text, Button, Modal, TextInput, Select, Group, Grid, ActionIcon, Notification } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconPencil, IconTrash } from '@tabler/icons-react';
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
  dt_start: string;
  dt_end: string;
  priority: string;
  status: string;
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
    priority: '',
    status: 'new'
  });
  const [editTask, setEditTask] = useState<Task | null>(null);

  const statusOptions = [
    { value: 'new', label: 'Новая' },
    { value: 'in_progress', label: 'В работе' },
    { value: 'completed', label: 'Завершена' },
  ];

  const columns = {
    'Новая': tasks.filter(t => t.status === 'new'),
    'В работе': tasks.filter(t => t.status === 'in_progress'),
    'Завершена': tasks.filter(t => t.status === 'completed'),
  };

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
        group_id: parseInt(newTask.group_id),
        skills: newTask.skills ? newTask.skills.split(',').map(s => s.trim()) : null,
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
        group_id: parseInt(String(editTask.group_id)),
        skills: editTask.skills ? editTask.skills.join(',') : null,
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

  

  return (
    <div>
      <Title order={2}>Задачи</Title>
      {error && (
        <Notification color="red" title="Ошибка" onClose={() => setError(null)}>
          {error}
        </Notification>
      )}
      <Button onClick={open} mt="md">Создать задачу</Button>
      
      <PlotTasks columns={columns} 
        statusOptions={statusOptions} 
        priorityOptions={priorityOptions} 
        handleStatusChange={handleStatusChange} 
        handleDeleteTask={handleDeleteTask} 
        openEdit={openEdit} 
        editTask={editTask} 
        setEditTask={setEditTask} 
      />
      <ModalsTask opened={opened}
        close={close}
        newTask={newTask}
        setNewTask={setNewTask}
        handleCreateTask={handleCreateTask}
        editOpened={editOpened}
        closeEdit={closeEdit}
        editTask={editTask}
        setEditTask={setEditTask}
        handleEditTask={handleEditTask}
      />
    </div>
  );
};