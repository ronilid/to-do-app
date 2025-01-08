import React, { useEffect, useState } from "react";
import "./App.css";
import Input from "./components/layouts/Input";
import DropDown from "./components/layouts/DropDown";
import CommentData from "./components/commentsBlock/CommentData";

// Constants
const BACKEND_URL = "http://localhost:3000/tasks";
const STATUS_NAMES_ENUM = {
  1: "Draft",
  2: "In Progress",
  3: "On Hold",
  4: "Completed",
  5: "Deleted",
};
const PRIORITIES = ["Low", "Medium", "High", "Urgent"];
//

const App = () => {
  const [tasks, setTasks] = useState([]); // State for tasks
  const [newTask, setNewTask] = useState({ title: "", description: "" }); // State for new task
  const [editingTaskId, setEditingTaskId] = useState(null); // Tracks the ID of the task being edited

  // Fetch tasks from the backend
  useEffect(() => {
    fetch(BACKEND_URL)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Failed to fetch tasks: ${response.statusText}`);
        }
        return response.json();
      })
      .then((data) => setTasks(data))
      .catch((error) => {
        console.error("Error fetching tasks:", error);
        setTasks([]);
      });
  }, []);

  const setTaskFieldHandler = (event) => setNewTask({ ...newTask, [event.target.id]: event.target.value });

  const handleAddTask = (e) => {
    e.preventDefault();

    const taskToAdd = {
      title: newTask.title.trim(),
      description: newTask.description?.trim() || "",
      due_date: newTask.due_date || null,
      priority_id: newTask.priority_id || 1,
      status_id: newTask.status_id || 1,
    };
    if (!taskToAdd.due_date) {
      delete taskToAdd.due_date;
    }
    console.log("Task being sent:", taskToAdd);

    fetch(BACKEND_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(taskToAdd),
    })
      .then((response) => {
        if (!response.ok) {
          return response.json().then((err) => {
            console.error("Server error:", err);
            throw new Error("Failed to add task");
          });
        }
        return response.json();
      })
      .then((data) => {
        console.log("Task added successfully:", data);
        setTasks((prevTasks) => [data.task, ...prevTasks]);
        setNewTask({ title: "", description: "", due_date: "" });
      })
      .catch((error) => console.error("Error adding task:", error));
  };

  const handleEditTask = (e) => {
    e.preventDefault();

    if (!newTask.title || newTask.title.trim() === "") {
      alert("Title is required!");
      return;
    }

    const taskToUpdate = {
      ...newTask,
      title: newTask.title.trim(),
      description: newTask.description?.trim() || "",
    };

    fetch(`${BACKEND_URL}/${editingTaskId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(taskToUpdate),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to update task");
        }
        return response.json();
      })
      .then((data) => {
        setTasks((prevTasks) => prevTasks.map((task) => (task.task_id === editingTaskId ? { ...task, ...taskToUpdate } : task)));
        setNewTask({ title: "", description: "", due_date: "" }); // Reset form
        setEditingTaskId(null); // Clear editing state
      })
      .catch((error) => console.error("Error updating task:", error));
  };

  const handleEdit = (task) => {
    setNewTask(task); // Populate the form with the task's current data
    setEditingTaskId(task.task_id); // Set the ID of the task being edited
  };

  const handleDelete = (id) => {
    console.log(`Attempting to delete task with ID: ${id}`);
    fetch(`http://localhost:3000/tasks/${id}`, {
      method: "DELETE",
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to delete task");
        }
        console.log(`Task with ID: ${id} deleted successfully`);
        setTasks((prevTasks) => prevTasks.filter((task) => task.task_id !== id));
      })
      .catch((error) => console.error("Error deleting task:", error));
  };

  const handleTaskCompletion = (taskId) => {
    const task = tasks.find((t) => t.task_id === taskId);
    if (!task) return;

    const newStatus = task.status_id === 4 ? 2 : 4;

    fetch(`${BACKEND_URL}/${taskId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...task, status_id: newStatus }),
    })
      .then((response) => {
        if (!response.ok) throw new Error("Failed to update task status");
        return response.json();
      })
      .then(() => {
        setTasks((prevTasks) => prevTasks.map((t) => (t.task_id === taskId ? { ...t, status_id: newStatus } : t)));
      })
      .catch((error) => console.error("Error updating task status:", error));
  };

  return (
    <div className="container">
      <h1>To Do List</h1>
      <form onSubmit={editingTaskId ? handleEditTask : handleAddTask} style={{ display: "flex", flexDirection: "column", boxSizing: "border-box", gap: "10px" }}>
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <Input id={"title"} placeholder="Title" value={newTask.title} onChange={setTaskFieldHandler} required={true} />
          <Input id={"description"} type="text" placeholder="Description" value={newTask.description} onChange={setTaskFieldHandler} />
          <Input id={"due_date"} type="date" value={newTask.due_date || ""} onChange={setTaskFieldHandler} />
        </div>
        <div style={{ display: "flex", gap: "10px", justifyContent: "space-between" }}>
          <DropDown title={"Priority:"} options={PRIORITIES} id="priority-select" className="priority-select-form" value={newTask.priority_id || 1} onChange={(e) => setNewTask({ ...newTask, priority_id: parseInt(e.target.value) })} htmlFor="priority-select" />
          <DropDown title={"Status:"} options={Object.values(STATUS_NAMES_ENUM)} id="status-select" className="status-select-form" value={newTask.status_id || 1} onChange={(e) => setNewTask({ ...newTask, status_id: parseInt(e.target.value) })} htmlFor="status-select" />
        </div>
        <div>
          <DropDown title={"Assign To:"} options={["User 1", "User 2"]} id="status-select" className="status-select-form" value={newTask.status_id || 1} onChange={(e) => setNewTask({ ...newTask, status_id: parseInt(e.target.value) })} htmlFor="user-select" />
        </div>
        <button type="submit">{editingTaskId ? "Save Changes" : "Add Task"}</button>
      </form>
      <ul>
        {tasks
          .filter((task) => task && task.title)
          .map((task) => (
            <li key={task.task_id} style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div className={`checkbox ${task.status_id === 4 ? "completed" : ""}`} onClick={() => handleTaskCompletion(task.task_id)} />
              <div>
                <CommentData title={task.title} description={task.description} due_date={task.due_date} status={STATUS_NAMES_ENUM[task.status_id]} priority={PRIORITIES[task.priority_id - 1]} />
              </div>
              <div style={{ display: "flex", gap: "10px" }}>
                <button onClick={() => handleDelete(task.task_id)}>Delete</button>
                <button onClick={() => handleEdit(task)}>Edit</button>
              </div>
            </li>
          ))}
      </ul>
    </div>
  );
};

export default App;
