import { useState, useEffect } from 'react';
import { Title, Table, Notification } from '@mantine/core';
import api from '../../../core/api/api';

interface Group {
  id: number;
  name: string;
  description: string;
}

export const Groups = () => {
  const [groups, setGroups] = useState<Group[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const response = await api.get('/groups');
        setGroups(response.data);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Не удалось загрузить группы');
      }
    };
    fetchGroups();
  }, []);

  const groupRows = groups.map((group) => (
    <Table.Tr key={group.id}>
      <Table.Td>{group.name}</Table.Td>
    </Table.Tr>
  ));

  return (
    <div>
      <Title order={2}>Группы</Title>
      {error && (
        <Notification color="red" title="Ошибка" onClose={() => setError(null)}>
          {error}
        </Notification>
      )}
      <Table mt="md">
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Название</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>{groupRows}</Table.Tbody>
      </Table>
    </div>
  );
};