import { Button, Modal, Select, TextInput } from "@mantine/core";

export const ModalCreateTask = (props) => {
  return <Modal opened={props.opened} onClose={props.close} title="Создать задачу">
    <TextInput
      label="Название"
      value={props.newTask.title}
      onChange={(e) => props.setNewTask({ ...props.newTask, title: e.currentTarget.value })}
      required
    />
    <TextInput
      label="Описание"
      value={props.newTask.description}
      onChange={(e) => props.setNewTask({ ...props.newTask, description: e.currentTarget.value })}
      mt="md"
    />
    <TextInput
      label="Навыки"
      value={props.newTask.skills}
      onChange={(e) => props.setNewTask({ ...props.newTask, skills: e.currentTarget.value })}
      mt="md"
      placeholder="Введите навыки через запятую"
    />
    <TextInput
      label="ID группы"
      value={props.newTask.group_id}
      onChange={(e) => props.setNewTask({ ...props.newTask, group_id: e.currentTarget.value })}
      mt="md"
      type="number"
    />
    <TextInput
      label="Дата начала"
      value={props.newTask.dt_start}
      onChange={(e) => props.setNewTask({ ...props.newTask, dt_start: e.currentTarget.value })}
      mt="md"
      type="datetime-local"
    />
    <TextInput
      label="Дата окончания"
      value={props.newTask.dt_end}
      onChange={(e) => props.setNewTask({ ...props.newTask, dt_end: e.currentTarget.value })}
      mt="md"
      type="datetime-local"
    />
    <Select
      label="Приоритет"
      value={props.newTask.priority}
      onChange={(value) => props.setNewTask({ ...props.newTask, priority: value || '' })}
      data={props.priorityOptions}
      mt="md"
    />
    <Select
      label="Статус"
      value={props.newTask.status}
      onChange={(value) => props.setNewTask({ ...props.newTask, status: value || 'new' })}
      data={props.statusOptions}
      mt="md"
      required
    />
    <Button onClick={props.handleCreateTask} mt="md" fullWidth>
      Сохранить
    </Button>
  </Modal>


};