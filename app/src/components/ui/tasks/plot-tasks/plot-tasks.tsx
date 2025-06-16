import { Card, Grid, Group, Title, Text, ActionIcon, Select } from "@mantine/core";
import { IconPencil, IconTrash } from "@tabler/icons-react";

export const PlotTasks = (props) => {
  return <Grid mt="md">
    {Object.entries(props.columns).map(([statusLabel, tasksInColumn]) => (
      <Grid.Col span={4} key={statusLabel}>
        <Title order={3}>{statusLabel}</Title>
        <div style={{ minHeight: '400px', padding: '8px', background: '#f5f5f5', borderRadius: '4px' }}>
          {tasksInColumn.map((task) => (
            <Card shadow="sm" padding="lg" mb="sm" key={task.id}>
              <Group justify="space-between">
                <Text fw={500}>{task.title}</Text>
                <Group>
                  <ActionIcon onClick={() => { props.setEditTask(task); props.openEdit(); }}>
                    <IconPencil size={16} />
                  </ActionIcon>
                  <ActionIcon onClick={() => props.handleDeleteTask(task.id)} color="red">
                    <IconTrash size={16} />
                  </ActionIcon>
                </Group>
              </Group>
              <Text size="sm" c="dimmed">{task.description}</Text>
              <Text size="sm">Приоритет: {task.priority}</Text>
              <Text size="sm">Навыки: {task.skills ? task.skills.join(', ') : 'Нет'}</Text>
              <Select
                size="xs"
                value={task.status}
                onChange={(value) => props.handleStatusChange(task.id, value || task.status)}
                data={props.statusOptions}
                mt="sm"
              />
            </Card>
          ))}
        </div>
      </Grid.Col>
    ))}
  </Grid>
}