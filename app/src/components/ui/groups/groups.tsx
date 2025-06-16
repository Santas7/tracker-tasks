import { useState, useEffect } from 'react';
import { Title, Table, Notification, Button, Modal, TextInput, Textarea, Text } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import api from '../../../core/api/api';
import { useAppSelector } from '../../../core/store/hooks';

interface Group {
  id: number;
  name: string;
  description: string;
  admin_user_id: number;
}

interface Task {
  id: number;
  title: string;
  description: string;
  status: string;
  priority: string;
}

interface User {
  id: number;
  username: string;
}

export const Groups = () => {
  const user = useAppSelector((state) => state.auth.user);
  const [groups, setGroups] = useState<Group[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [createOpened, createModal] = useDisclosure(false);
  const [editOpened, editModal] = useDisclosure(false);
  const [viewOpened, viewModal] = useDisclosure(false);
  const [deleteOpened, deleteModal] = useDisclosure(false);
  const [newGroup, setNewGroup] = useState({ name: '', description: '' });
  const [editGroup, setEditGroup] = useState({ id: 0, name: '', description: '' });
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [groupTasks, setGroupTasks] = useState<Task[]>([]);
  const [groupUsers, setGroupUsers] = useState<User[]>([]);
  const [groupToDelete, setGroupToDelete] = useState<number | null>(null);

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const response = await api.get(`/groups?user_id=${user?.id}`);
        setGroups(response.data);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Не удалось загрузить группы');
      }
    };
    fetchGroups();
  }, [user?.id]);

  const handleCreateGroup = async () => {
    if (!newGroup.name.trim()) {
      setError('Название группы не может быть пустым');
      return;
    }
    try {
      const response = await api.post('/groups', newGroup);
      setGroups([...groups, response.data]);
      createModal.close();
      setNewGroup({ name: '', description: '' });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Не удалось создать группу');
    }
  };

  const handleEditGroup = async () => {
    if (!editGroup.name.trim()) {
      setError('Название группы не может быть пустым');
      return;
    }
    try {
      const response = await api.patch(`/groups/${editGroup.id}`, {
        name: editGroup.name,
        description: editGroup.description,
      });
      setGroups(groups.map((g) => (g.id === editGroup.id ? response.data : g)));
      editModal.close();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Не удалось обновить группу');
    }
  };

  const handleDeleteGroup = async () => {
    if (!groupToDelete) return;
    try {
      await api.delete(`/groups/${groupToDelete}`);
      setGroups(groups.filter((g) => g.id !== groupToDelete));
      deleteModal.close();
      setGroupToDelete(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Не удалось удалить группу');
    }
  };

  const handleViewGroup = async (group: Group) => {
    setSelectedGroup(group);
    try {
      const [tasksResponse, usersResponse] = await Promise.all([
        api.get(`/tasks?group_id=${group.id}`),
        api.get(`/users?group_id=${group.id}`),
      ]);
      setGroupTasks(tasksResponse.data);
      setGroupUsers(usersResponse.data);
      viewModal.open();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Не удалось загрузить данные группы');
    }
  };

  const groupRows = groups.map((group) => (
    <Table.Tr key={group.id}>
      <Table.Td>{group.id}</Table.Td>
      <Table.Td>
        <Text style={{ cursor: 'pointer' }} onClick={() => handleViewGroup(group)}>
          {group.name}
        </Text>
      </Table.Td>
      <Table.Td>
        <Button
          variant="outline"
          size="xs"
          onClick={() => {
            setEditGroup({ id: group.id, name: group.name, description: group.description });
            editModal.open();
          }}
          mr="xs"
        >
          Редактировать
        </Button>
        <Button
          variant="outline"
          color="red"
          size="xs"
          onClick={() => {
            setGroupToDelete(group.id);
            deleteModal.open();
          }}
        >
          Удалить
        </Button>
      </Table.Td>
    </Table.Tr>
  ));

  const taskRows = groupTasks.map((task) => (
    <Table.Tr key={task.id}>
      <Table.Td>{task.title}</Table.Td>
      <Table.Td>{task.description}</Table.Td>
      <Table.Td>{task.status}</Table.Td>
      <Table.Td>{task.priority}</Table.Td>
    </Table.Tr>
  ));

  const userRows = groupUsers.map((user) => (
    <Table.Tr key={user.id}>
      <Table.Td>{user.username}</Table.Td>
    </Table.Tr>
  ));

  return (
    <div>
      <Title order={2}>Мои группы</Title>
      {error && (
        <Notification color="red" title="Ошибка" onClose={() => setError(null)}>
          {error}
        </Notification>
      )}
      <Button onClick={createModal.open} mt="md">
        Создать группу
      </Button>
      <Table mt="md">
        <Table.Thead>
          <Table.Tr>
            <Table.Th>ID</Table.Th>
            <Table.Th>Название</Table.Th>
            <Table.Th>Действия</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>{groupRows}</Table.Tbody>
      </Table>
      <Modal opened={createOpened} onClose={createModal.close} title="Создать группу">
        <TextInput
          label="Название"
          value={newGroup.name}
          onChange={(e) => setNewGroup({ ...newGroup, name: e.currentTarget.value })}
          required
          error={newGroup.name.trim() ? null : 'Обязательное поле'}
        />
        <Textarea
          label="Описание"
          value={newGroup.description}
          onChange={(e) => setNewGroup({ ...newGroup, description: e.currentTarget.value })}
          mt="md"
        />
        <Button onClick={handleCreateGroup} mt="md" fullWidth>
          Сохранить
        </Button>
      </Modal>
      <Modal opened={editOpened} onClose={editModal.close} title="Редактировать группу">
        <TextInput
          label="Название"
          value={editGroup.name}
          onChange={(e) => setEditGroup({ ...editGroup, name: e.currentTarget.value })}
          required
          error={editGroup.name.trim() ? null : 'Обязательное поле'}
        />
        <Textarea
          label="Описание"
          value={editGroup.description}
          onChange={(e) => setEditGroup({ ...editGroup, description: e.currentTarget.value })}
          mt="md"
        />
        <Button onClick={handleEditGroup} mt="md" fullWidth>
          Сохранить
        </Button>
      </Modal>
      <Modal
        opened={viewOpened}
        onClose={viewModal.close}
        title={`Группа: ${selectedGroup?.name}`}
        size="lg"
      >
        <Text mt="md">Описание: {selectedGroup?.description || 'Нет описания'}</Text>
        <Title order={3} mt="lg">Задачи группы</Title>
        {groupTasks.length > 0 ? (
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
        ) : (
          <Text mt="md">Нет задач в этой группе</Text>
        )}
        <Title order={3} mt="lg">Участники группы</Title>
        {groupUsers.length > 0 ? (
          <Table mt="md">
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Имя пользователя</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>{userRows}</Table.Tbody>
          </Table>
        ) : (
          <Text mt="md">Нет участников в этой группе</Text>
        )}
      </Modal>
      <Modal
        opened={deleteOpened}
        onClose={deleteModal.close}
        title="Подтверждение удаления"
      >
        <Text>Вы уверены, что хотите удалить группу? Это действие нельзя отменить.</Text>
        <Button color="red" onClick={handleDeleteGroup} mt="md" fullWidth>
          Удалить
        </Button>
        <Button variant="outline" onClick={deleteModal.close} mt="sm" fullWidth>
          Отмена
        </Button>
      </Modal>
    </div>
  );
};