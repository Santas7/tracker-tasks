import { Modal, TextInput, Select, Button } from "@mantine/core";

export const ModalCreateTask = ({
  opened,
  close,
  newTask,
  setNewTask,
  handleCreateTask,
}) => {
  return (
    <Modal opened={opened} onClose={close} title="Создать задачу">
      <TextInput
        label="Название"
        value={newTask.title}
        onChange={(e) =>
          setNewTask({ ...newTask, title: e.currentTarget.value })
        }
        required
      />
      <TextInput
        label="Описание"
        value={newTask.description}
        onChange={(e) =>
          setNewTask({ ...newTask, description: e.currentTarget.value })
        }
        mt="md"
      />
      <TextInput
        label="Навыки"
        value={newTask.skills}
        onChange={(e) =>
          setNewTask({ ...newTask, skills: e.currentTarget.value })
        }
        mt="md"
        placeholder="Введите навыки через запятую"
      />
      <TextInput
        label="ID группы"
        value={newTask.group_id}
        onChange={(e) =>
          setNewTask({ ...newTask, group_id: e.currentTarget.value })
        }
        mt="md"
        type="number"
      />
      <TextInput
        label="Дата начала"
        value={newTask.dt_start}
        onChange={(e) =>
          setNewTask({ ...newTask, dt_start: e.currentTarget.value })
        }
        mt="md"
        type="datetime-local"
      />
      <TextInput
        label="Дата окончания"
        value={newTask.dt_end}
        onChange={(e) =>
          setNewTask({ ...newTask, dt_end: e.currentTarget.value })
        }
        mt="md"
        type="datetime-local"
      />
      <Select
        label="Приоритет"
        value={newTask.priority}
        onChange={(value) =>
          setNewTask({ ...newTask, priority: value || "low" })
        }
        data={[
          { value: "low", label: "Низкий" },
          { value: "medium", label: "Средний" },
          { value: "high", label: "Высокий" },
        ]}
        mt="md"
      />
      <Select
        label="Статус"
        value={newTask.status}
        onChange={(value) => setNewTask({ ...newTask, status: value || "new" })}
        data={[
          { value: "new", label: "Новая" },
          { value: "in_progress", label: "В работе" },
          { value: "completed", label: "Завершена" },
        ]}
        mt="md"
        required
      />
      <Button onClick={handleCreateTask} mt="md" fullWidth>
        Сохранить
      </Button>
    </Modal>
  );
};
