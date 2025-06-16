import { Modal, TextInput, Select, Button } from '@mantine/core';

export const ModalEditTask = ({ editOpened, closeEdit, editTask, setEditTask, handleEditTask, priorityOptions, statusOptions }) => {
  return (
    <Modal opened={editOpened} onClose={closeEdit} title="Редактировать задачу">
      {editTask && (
        <>
          <TextInput
            label="Название"
            value={editTask.title}
            onChange={(e) => setEditTask({ ...editTask, title: e.currentTarget.value })}
            required
          />
          <TextInput
            label="Описание"
            value={editTask.description}
            onChange={(e) => setEditTask({ ...editTask, description: e.currentTarget.value })}
            mt="md"
          />
          <TextInput
            label="Навыки"
            value={editTask.skills ? editTask.skills.join(', ') : ''}
            onChange={(e) => setEditTask({ ...editTask, skills: e.currentTarget.value.split(',').map(s => s.trim()).filter(s => s) })}
            mt="md"
            placeholder="Введите навыки через запятую"
          />
          <TextInput
            label="ID группы"
            value={editTask.group_id || ''}
            onChange={(e) => setEditTask({ ...editTask, group_id: e.currentTarget.value ? parseInt(e.currentTarget.value) : null })}
            mt="md"
            type="number"
          />
          <TextInput
            label="Дата начала"
            value={editTask.dt_start || ''}
            onChange={(e) => setEditTask({ ...editTask, dt_start: e.currentTarget.value || null })}
            mt="md"
            type="datetime-local"
          />
          <TextInput
            label="Дата окончания"
            value={editTask.dt_end || ''}
            onChange={(e) => setEditTask({ ...editTask, dt_end: e.currentTarget.value || null })}
            mt="md"
            type="datetime-local"
          />
          <Select
            label="Приоритет"
            value={editTask.priority || 'low'}
            onChange={(value) => setEditTask({ ...editTask, priority: value || 'low' })}
            data={priorityOptions}
            mt="md"
          />
          <Select
            label="Статус"
            value={editTask.status || 'new'}
            onChange={(value) => setEditTask({ ...editTask, status: value || 'new' })}
            data={statusOptions}
            mt="md"
            required
          />
          <Button onClick={handleEditTask} mt="md" fullWidth>
            Сохранить
          </Button>
        </>
      )}
    </Modal>
  );
};