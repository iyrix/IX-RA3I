import PlusIcon from "../icons/PlusIcon";
import { useEffect, useMemo, useState } from "react";
import { Column, Id, Task } from "../types";
import ColumnContainer from "./ColumnContainer";
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { SortableContext, arrayMove } from "@dnd-kit/sortable";
import { createPortal } from "react-dom";
import TaskCard from "./TaskCard";
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { fetchFromAPI } from "../utils/fetchUtil";


function KanbanBoard() {
  const [columns, setColumns] = useState<Column[]>([]);
  const columnsId = useMemo(() => columns.map((col) => col.id), [columns]);

  const [tasks, setTasks] = useState<Task[]>([]);
  const [activeColumn, setActiveColumn] = useState<Column | null>(null);
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 10,
      },
    })
  );

  const fetchData = async () => {
    try {
      const data = await fetchFromAPI('http://127.0.0.1:8000/boards/1/lists');

      const updatedColumns = data.lists.map((list: Column) => ({
        id: list.id.toString(),
        title: list.title,
        order: list.order,
        cards: list.cards.map((card: Task) => ({
          id: card.id,
          columnId: list.id,
          content: card.title,
        })),
      }));

      const updatedTasks = data.lists
        .flatMap((list: Column) => list.cards)
        .map((card: Task) => ({
          id: card.id,
          columnId: String(card.columnId),
          content: card.content,
          title: card.title,
          order: card.order,
        }));

      setColumns(updatedColumns);
      setTasks(updatedTasks);
    } catch (error) {
      console.error('Error fetching data:', (error as Error).message);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);


  //
  //TASKS CRUD
  //

  //Create a new task
  async function createTask(columnId: Id) {
    try {
      const order = (
        columns.find((col) => col.id === columnId)?.cards?.length + 1 || 1
      );

      const newTask: Task = {
        columnId,
        content: `Task ${tasks.length + 1}`,
        title: 'New Task',
        order: order || 1,
        board: 1,
      };

      const response = await fetchFromAPI('http://127.0.0.1:8000/boards/1/cards/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newTask),
      });

      setTasks([...tasks, { ...newTask, id: response.id }]);

      toast.success('Task created successfully');
    } catch (error) { 
      toast.error('Error creating task');
    }
  }

  //delete a task
  async function deleteTask(id: Id) {
    try {
      const newTasks = tasks.filter((task) => task.id !== id);
      setTasks(newTasks);

      const response = await fetchFromAPI(`http://127.0.0.1:8000/boards/1/cards/${id}/delete`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete column');
      }

      toast.success('Task deleted successfully');
    } catch (error) {
      console.error('Error deleting task:', (error as Error).message);
      toast.error('Error deleting task');
    }
  }

  //update a task
  function updateTask(id: Id, content: string) {
    const newTasks = tasks.map((task) => {
      if (task.id !== id) return task;
      return { ...task, content };
    });

    setTasks(newTasks);
  }

  
  //
  //LISTS CRUD
  //

  //create a list
  async function createNewColumn() {
    try {
      const columnToAdd: Column = {
        title: `Column ${columns.length + 1}`,
        cards: [],
        order: columns.length + 1,
        board: 1
      };

      const response = await fetchFromAPI('http://127.0.0.1:8000/boards/1/lists/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(columnToAdd),
      });

      setColumns([...columns, { ...columnToAdd, id: response.id }]);
      
      toast.success('New column created successfully');
    } catch (error) {
      toast.error('Error creating a new column');
    }
  }

  async function deleteColumn(id: Id) {
    try {
      const filteredColumns = columns.filter((col) => col.id !== id);
      setColumns(filteredColumns);

      const newTasks = tasks.filter((t) => t.columnId !== id);
      setTasks(newTasks);

      // Send DELETE request to the backend API
      const response = await fetchFromAPI(`http://127.0.0.1:8000/boards/1/lists/${id}/delete`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete column');
      }

      toast.success('Column deleted successfully');
    } catch (error) {
      console.error('Error deleting column:', (error as Error).message);
      toast.error('Error deleting column');
    }
  }


  function updateColumn(id: Id, title: string) {
    const newColumns = columns.map((col) => {
      if (col.id !== id) return col;
      return { ...col, title };
    });

    setColumns(newColumns);
  }

  //
  //Drag Component
  //
  
  function onDragStart(event: DragStartEvent) {
    if (event.active.data.current?.type === "Column") {
      setActiveColumn(event.active.data.current.column);
      return;
    }

    if (event.active.data.current?.type === "Task") {
      setActiveTask(event.active.data.current.task);
      return;
    }
  }

  function onDragEnd(event: DragEndEvent) {
    setActiveColumn(null);
    setActiveTask(null);

    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    if (activeId === overId) return;

    const isActiveAColumn = active.data.current?.type === "Column";
    if (!isActiveAColumn) return;

    console.log("DRAG END");

    setColumns((columns) => {
      const activeColumnIndex = columns.findIndex((col) => col.id === activeId);

      const overColumnIndex = columns.findIndex((col) => col.id === overId);

      fetch(`http://127.0.0.1:8000/boards/1/lists/${columns.filter((col) => col.id === activeId)[0].id}/`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: columns.filter((col) => col.id === activeId)[0].title,
          order: columns.filter((col) => col.id === overId)[0].order,
          board: 1
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

        fetch(`http://127.0.0.1:8000/boards/1/lists/${columns.filter((col) => col.id === overId)[0].id}/`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: columns.filter((col) => col.id === overId)[0].title,
          order: columns.filter((col) => col.id === activeId)[0].order,
          board: 1
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

      return arrayMove(columns, activeColumnIndex, overColumnIndex);
    });
  }

  function onDragOver(event: DragOverEvent) {
    const { active, over } = event;

    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    if (activeId === overId) return;

    const isActiveATask = active.data.current?.type === "Task";
    const isOverATask = over.data.current?.type === "Task";

    if (!isActiveATask) return;

    // Im dropping a Task over another Task
    if (isActiveATask && isOverATask) {
      setTasks((tasks) => {
        const activeIndex = tasks.findIndex((t) => t.id === activeId);
        const overIndex = tasks.findIndex((t) => t.id === overId);

        if (tasks[activeIndex].columnId != tasks[overIndex].columnId) {
          // Fix introduced after video recording
          tasks[activeIndex].columnId = tasks[overIndex].columnId;
          return arrayMove(tasks, activeIndex, overIndex - 1);
        }

        return arrayMove(tasks, activeIndex, overIndex);
      });
    }

    const isOverAColumn = over.data.current?.type === "Column";

    // Im dropping a Task over a column
    if (isActiveATask && isOverAColumn) {
      setTasks((tasks) => {
        const activeIndex = tasks.findIndex((t) => t.id === activeId);
        // console.log("SKJ", activeIndex)

        tasks[activeIndex].columnId = overId;
        console.log("DROPPING TASK OVER COLUMN", { activeIndex });
        // console.log("Cols",columns)
        return arrayMove(tasks, activeIndex, activeIndex);
      });
    }
  }
  
// console.log('List', columns)
// console.log('tasks', tasks)

  return (
    <div
      className="
        m-auto
        flex
        min-h-screen
        w-full
        items-center
        overflow-x-auto
        overflow-y-hidden
        px-[40px]
    "
    >
      <DndContext
        sensors={sensors}
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
        onDragOver={onDragOver}
      >
        <div className="m-auto flex gap-4">
          <div className="flex gap-4">
            <SortableContext items={columnsId}>
              {columns.map((col: any) => (
                <ColumnContainer
                  key={col.id}
                  column={col}
                  deleteColumn={deleteColumn}
                  updateColumn={updateColumn}
                  createTask={createTask}
                  deleteTask={deleteTask}
                  updateTask={updateTask}
                  tasks={tasks.filter((task) => task.columnId === col.id)}
                />
              ))}
            </SortableContext>
          </div>
          <button
            onClick={() => {
              createNewColumn();
            }}
            className="
      h-[60px]
      w-[350px]
      min-w-[350px]
      cursor-pointer
      rounded-lg
      bg-mainBackgroundColor
      border-2
      border-columnBackgroundColor
      p-4
      ring-rose-500
      hover:ring-2
      flex
      gap-2
      "
          >
            <PlusIcon />
            Add Column
          </button>
        </div>

        {createPortal(
          <DragOverlay>
            {activeColumn && (
              <ColumnContainer
                column={activeColumn}
                deleteColumn={deleteColumn}
                updateColumn={updateColumn}
                createTask={createTask}
                deleteTask={deleteTask}
                updateTask={updateTask}
                tasks={tasks.filter(
                  (task) => task.columnId === activeColumn.id
                )}
              />
            )}
            {activeTask && (
              <TaskCard
                task={activeTask}
                deleteTask={deleteTask}
                updateTask={updateTask}
              />
            )}
          </DragOverlay>,
          document.body
        )}
      </DndContext>
    </div>
  );
}

export default KanbanBoard;
