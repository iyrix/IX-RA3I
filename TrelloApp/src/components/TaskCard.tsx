import { useState } from "react";
import TrashIcon from "../icons/TrashIcon";
import { Id, Task } from "../types";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import DeleteModal from "./DeleteModal";
import { toast } from "react-toastify";

interface Props {
  task: Task;
  deleteTask: (id: Id) => void;
  updateTask: (id: Id, content: string) => void;
}

function TaskCard({ task, deleteTask, updateTask }: Props) {
  const [mouseIsOver, setMouseIsOver] = useState(false);
  const [editMode, setEditMode] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const {
    setNodeRef,
    attributes,
    listeners,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
    data: {
      type: "Task",
      task,
    },
    disabled: editMode,
  });

  const style = {
    transition,
    transform: CSS.Transform.toString(transform),
  };

  const toggleEditMode = () => {
    if(editMode === true)
      UpdateTaskName(task.id, task.title, task.content, task.columnId, task.order)

    setEditMode((prev) => !prev);
    setMouseIsOver(false);
  };

  if (isDragging) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className="
        opacity-30
      bg-mainBackgroundColor p-2.5 h-[100px] min-h-[100px] items-center flex text-left rounded-xl border-2 border-rose-500  cursor-grab relative
      "
      />
    );
  }

  if (editMode) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        {...attributes}
        {...listeners}
        className="bg-mainBackgroundColor p-2.5 h-[100px] min-h-[100px] items-center flex text-left rounded-xl hover:ring-2 hover:ring-inset hover:ring-rose-500 cursor-grab relative"
      >
        <textarea
          className="
        h-[90%]
        w-full resize-none border-none rounded bg-transparent text-white focus:outline-none
        "
          value={task.content}
          autoFocus
          placeholder="Task content here"
          onBlur={toggleEditMode}
          onKeyDown={(e) => {
            if (e.key === "Enter" && e.shiftKey) {
              toggleEditMode();
              UpdateTaskName(task.id, task.title, task.content, task.columnId, task.order)
            }
          }}
          onChange={(e) => updateTask(task.id, e.target.value)}
        />
      </div>
    );
  }

  return (
<>
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="bg-mainBackgroundColor p-2.5 h-[100px] min-h-[100px] items-center flex text-left rounded-xl hover:ring-2 hover:ring-inset hover:ring-rose-500 cursor-grab relative task"
      onMouseEnter={() => {
        setMouseIsOver(true);
      }}
      onMouseLeave={() => {
        setMouseIsOver(false);
      }}
    >
      <p className="my-auto h-[90%] w-full overflow-y-auto overflow-x-hidden whitespace-pre-wrap"
      onClick={toggleEditMode}>
        {task.content}
      </p>

      {mouseIsOver && (
        <button
          onClick={() => {
            setShowDeleteModal(true)
          }}
          className="stroke-white absolute right-4 top-1/2 -translate-y-1/2 bg-columnBackgroundColor p-2 rounded opacity-60 hover:opacity-100"
        >
          <TrashIcon />
        </button>
      )}
    </div>
    {showDeleteModal && (
        <DeleteModal
          onClose={() => setShowDeleteModal(false)}
          onDelete={() => {
            deleteTask(task.id);
            setShowDeleteModal(false);
          }}
        />
      )}
    </>
  );

  function UpdateTaskName(id: Id, title: string, content: string, colId: Id ,order: number | undefined) {
    fetch(`http://127.0.0.1:8000/boards/1/cards/${id}/`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      title: title || "Task",
      order: order || 1,
      board: 1,
      content: content,
      columnId: colId,
    }),
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Failed to delete column");
      }
      return response.json();
    })
    .then(() => {
      toast.success("Column Updated successfully");
    })
    .catch((error) => {
      console.error("Error updated column:", error.message);
      toast.error("Error updated column");
    });
  }
}

export default TaskCard;
