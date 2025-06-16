import { Button, Modal, Select, TextInput } from "@mantine/core";

export const ModalEditTask = (props) => {
  return  <Modal opened={props.editOpened} onClose={props.closeEdit} title="Редактировать задачу">
    {props.editTask && (
      <>
        <TextInput
          label="Название"
          value={props.editTask.title}
          onChange={(e) => props.setEditTask({ ...props.editTask, title: e.currentTarget.value })}
          required
        />
        <TextInput
          label="Описание"
          value={props.editTask.description}
          onChange={(e) => props.setEditTask({ ...props.editTask, description: e.currentTarget.value })}
          mt="md"
        />
        <TextInput
          label="Навыки"
          value={props.editTask.skills ? props.editTask.skills.join(', ') : ''}
          onChange={(e) => props.setEditTask({ ...props.editTask, skills: e.currentTarget.value.split(',').map(s => s.trim()) })}
          mt="md"
          placeholder="Введите навыки через запятую"
        />
        <TextInput
          label="ID группы"
          value={props.editTask.group_id}
          onChange={(e) => props.setEditTask({ ...props.editTask, group_id: parseInt(e.currentTarget.value) })}
          mt="md"
          type="number"
        />
        <TextInput
          label="Дата начала"
          value={props.editTask.dt_start}
          onChange={(e) => props.setEditTask({ ...props.editTask, dt_start: e.currentTarget.value })}
          mt="md"
          type="datetime-local"
        />
        <TextInput
          label="Дата окончания"
          value={props.editTask.dt_end}
          onChange={(e) => props.setEditTask({ ...props.editTask, dt_end: e.currentTarget.value })}
          mt="md"
          type="datetime-local"
        />
        <Select
          label="Приоритет"
          value={props.editTask.priority}
          onChange={(value) => props.setEditTask({ ...props.editTask, priority: value || '' })}
          data={props.priorityOptions}
          mt="md"
        />
        <Select
          label="Статус"
          value={props.editTask.status}
          onChange={(value) => props.setEditTask({ ...props.editTask, status: value || props.editTask.status })}
          data={props.statusOptions}
          mt="md"
          required
        />
        <Button onClick={props.handleEditTask} mt="md" fullWidth>
          Сохранить
        </Button>
      </>
    )}
  </Modal>
};