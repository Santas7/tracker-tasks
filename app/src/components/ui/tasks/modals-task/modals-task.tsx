import { ModalCreateTask } from "./modal-create-task/modal-create-task";
import { ModalEditTask } from "./modal-edit-task/modal-edit.task";

export const ModalsTask = ({
  opened,
  close,
  newTask,
  setNewTask,
  handleCreateTask,
  editOpened,
  closeEdit,  
  editTask,
  setEditTask,
  handleEditTask,
  priorityOptions
}) => {
  console.log(priorityOptions)
  return <>
    <ModalCreateTask 
      opened={opened} 
      close={close} 
      newTask={newTask} 
      setNewTask={setNewTask} 
      handleCreateTask={handleCreateTask} 
    />
    <ModalEditTask 
      editOpened={editOpened} 
      closeEdit={closeEdit} 
      editTask={editTask} 
      setEditTask={setEditTask} 
      handleEditTask={handleEditTask} 
      priorityOptions={priorityOptions}
    /></>
};