import { Card, Grid, Group, Title, Text, ActionIcon, Select } from "@mantine/core";
import { IconPencil, IconTrash } from "@tabler/icons-react";
import { useState } from "react";

export const PlotTasks = (props) => {
  const [draggedTaskId, setDraggedTaskId] = useState(null);

  const statusMap = {
    new: "Новая",
    in_progress: "В работе",
    completed: "Завершена",
  };

  const priorityMap = {
    low: "Низкий",
    medium: "Средний",
    high: "Высокий",
  };

  const reverseStatusMap = {
    "Новая": "new",
    "В работе": "in_progress",
    "Завершена": "completed",
  };

  const getDisplayStatus = (status) => statusMap[status] || status;

  const getDisplayPriority = (priority) => priorityMap[priority] || priority;

  const handleDragStart = (e, taskId) => {
    console.log("Drag start for task:", taskId); 
    setDraggedTaskId(taskId);
    e.dataTransfer.setData("text/plain", taskId.toString()); 
    e.dataTransfer.effectAllowed = "move";
    e.target.style.opacity = "0.5";
  };

  const handleDragEnd = (e) => {
    console.log("Drag end"); 
    e.target.style.opacity = "1";
    setDraggedTaskId(null);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e, newStatusLabel) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData("text/plain");
    console.log("Dropped task:", taskId, "to status:", newStatusLabel); 
    if (taskId && props.handleStatusChange) {
      props.handleStatusChange(parseInt(taskId, 10), newStatusLabel); 
    }
  };

  const handleSelectChange = (taskId, value) => {
    if (props.handleStatusChange && value) {
      console.log("Select change for task:", taskId, "to status:", value); 
      props.handleStatusChange(taskId, value);
    }
  };

  return (
    <Grid mt="md">
      {Object.entries(props.columns).map(([statusLabel, tasksInColumn]) => (
        <Grid.Col
          span={4}
          key={statusLabel}
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, statusLabel)}
          style={{ minHeight: "400px" }} 
        >
          <Title order={3}>{statusLabel}</Title>
          <div
            style={{
              minHeight: "400px",
              padding: "8px",
              background: "#f5f5f5",
              borderRadius: "4px",
              border: draggedTaskId ? "2px dashed #ccc" : "none",
            }}
          >
            {tasksInColumn.map((task) => (
              <Card
                shadow="sm"
                padding="lg"
                mb="sm"
                key={task.id}
                draggable={true}
                onDragStart={(e) => handleDragStart(e, task.id)}
                onDragEnd={handleDragEnd}
                style={{ cursor: "grab", userSelect: "none" }} 
              >
                <Group justify="space-between">
                  <Text fw={500}>{task.title}</Text>
                  <Group>
                    <ActionIcon
                      onClick={() => {
                        props.setEditTask(task);
                        props.openEdit();
                      }}
                    >
                      <IconPencil size={16} />
                    </ActionIcon>
                    <ActionIcon
                      onClick={() => props.handleDeleteTask(task.id)}
                      color="red"
                    >
                      <IconTrash size={16} />
                    </ActionIcon>
                  </Group>
                </Group>
                <Text size="sm" c="dimmed">
                  {task.description}
                </Text>
                <Text size="sm">Приоритет: {getDisplayPriority(task.priority)}</Text>
                <Text size="sm">
                  Навыки: {task.skills ? task.skills.join(", ") : "Нет"}
                </Text>
                <Select
                  size="xs"
                  value={getDisplayStatus(task.status)}
                  onChange={(value) => handleSelectChange(task.id, value)}
                  data={Object.values(statusMap)}
                  mt="sm"
                  allowDeselect={false}
                />
              </Card>
            ))}
          </div>
        </Grid.Col>
      ))}
    </Grid>
  );
};