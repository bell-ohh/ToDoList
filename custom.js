// Load the tasks saved in the browser, or start with an empty list.
const tasks = JSON.parse(localStorage.getItem("tasks") || "[]");

// Remember which task is being edited. null means no task is being edited.
let editingTaskIndex = null;

// Show every task when the page first opens.
let selectedFilter = "all";

// Find the task list, progress message, empty message, and new-task input.
const taskList = document.getElementById("list");
const progressMessage = document.getElementById("sub");
const emptyMessage = document.getElementById("empty");
const newTaskInput = document.getElementById("inp");

// Find the All, Active, and Completed filter buttons.
const filterButtons = document.querySelectorAll(".filters button[data-filter]");

// Change the visible tasks when a filter button is clicked.
filterButtons.forEach((filterButton) => {
  filterButton.addEventListener("click", () => {
    const clickedFilter = filterButton.dataset.filter;

    // Keep the current view if this filter is already selected.
    if (selectedFilter === clickedFilter) return;

    selectedFilter = clickedFilter;
    editingTaskIndex = null;

    // Highlight the button whose filter matches the selected filter.
    filterButtons.forEach((buttonToUpdate) => {
      const isSelected = buttonToUpdate.dataset.filter === selectedFilter;
      buttonToUpdate.setAttribute("aria-pressed", isSelected);
    });

    render();
  });
});

// Save the tasks so they are still there after the page refreshes.
function save() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

// Display the tasks that belong in the selected view.
function render() {
  taskList.innerHTML = "";

  // taskIndex is the task's position in the full list.
  // This keeps Edit and Delete connected to the right task in every view.
  tasks.forEach((task, taskIndex) => {
    // Active shows only unfinished tasks.
    if (selectedFilter === "active" && task.done) return;

    // Completed shows only finished tasks.
    if (selectedFilter === "completed" && !task.done) return;

    // Create a row for the task.
    const taskRow = document.createElement("li");

    // Apply the completed-task style when the task is finished.
    if (task.done) {
      taskRow.className = "done";
    }

    if (editingTaskIndex === taskIndex) {
      // Show the current task name in an editing field.
      const editInput = document.createElement("input");
      editInput.type = "text";
      editInput.className = "edit-input";
      editInput.value = task.text;
      editInput.maxLength = 100;
      editInput.setAttribute("aria-label", "Edit task name");

      // Save the edited task when Save is clicked.
      const saveButton = document.createElement("button");
      saveButton.type = "button";
      saveButton.className = "save";
      saveButton.textContent = "Save";

      saveButton.addEventListener("click", () => {
        saveEdit(taskIndex, editInput.value);
      });

      // Close the editing field when Cancel is clicked.
      const cancelButton = document.createElement("button");
      cancelButton.type = "button";
      cancelButton.className = "cancel";
      cancelButton.textContent = "Cancel";
      cancelButton.addEventListener("click", cancelEdit);

      // Enter saves the edit. Escape cancels it.
      editInput.addEventListener("keydown", (keyboardEvent) => {
        if (keyboardEvent.key === "Enter") {
          saveEdit(taskIndex, editInput.value);
        }

        if (keyboardEvent.key === "Escape") {
          cancelEdit();
        }
      });

      // Add the editing controls to this task's row.
      taskRow.appendChild(editInput);
      taskRow.appendChild(saveButton);
      taskRow.appendChild(cancelButton);
    } else {
      // Display the task name.
      const taskNameLabel = document.createElement("span");
      taskNameLabel.className = "txt";
      taskNameLabel.textContent = task.text;

      // Give this task its own Active / Completed dropdown.
      const taskStatusSelect = document.createElement("select");
      taskStatusSelect.className = "task-status";
      taskStatusSelect.setAttribute("aria-label", `Status for ${task.text}`);
      taskStatusSelect.add(new Option("Active", "active"));
      taskStatusSelect.add(new Option("Completed", "completed"));

      // Show the task's saved status in its dropdown.
      taskStatusSelect.value = task.done ? "completed" : "active";

      // Update this task when its status changes.
      taskStatusSelect.addEventListener("change", () => {
        task.done = taskStatusSelect.value === "completed";
        save();
        render();
      });

      // Open the editing field for this task.
      const editButton = document.createElement("button");
      editButton.type = "button";
      editButton.className = "edit";
      editButton.textContent = "Edit";
      editButton.addEventListener("click", () => edit(taskIndex));

      // Delete this task when its x button is clicked.
      const deleteButton = document.createElement("button");
      deleteButton.type = "button";
      deleteButton.className = "del";
      deleteButton.textContent = "x";
      deleteButton.setAttribute("aria-label", `Delete ${task.text}`);
      deleteButton.addEventListener("click", () => remove(taskIndex));

      // Add the task name, status dropdown, Edit, and Delete to the row.
      taskRow.appendChild(taskNameLabel);
      taskRow.appendChild(taskStatusSelect);
      taskRow.appendChild(editButton);
      taskRow.appendChild(deleteButton);
    }

    taskList.appendChild(taskRow);
  });

  // Count completed tasks across the full list.
  const completedTaskCount = tasks.filter((task) => task.done).length;

  progressMessage.textContent = tasks.length
    ? `${completedTaskCount} of ${tasks.length} done`
    : "Start adding your tasks below.";

  // Choose the message to show when the selected view is empty.
  const emptyMessagesByFilter = {
    all: "Nothing here - enjoy the quiet.",
    active: "No active tasks.",
    completed: "No completed tasks."
  };

  emptyMessage.textContent = emptyMessagesByFilter[selectedFilter];
  emptyMessage.style.display = taskList.childElementCount ? "none" : "block";
}

// Add a new task when the + button is clicked.
function add() {
  const taskText = newTaskInput.value.trim();

  // Skip an empty task.
  if (!taskText) return;

  // Every new task starts as Active.
  tasks.unshift({ text: taskText, done: false });

  newTaskInput.value = "";
  editingTaskIndex = null;

  save();
  render();
}

// Remove the task whose Delete button was clicked.
function remove(taskIndex) {
  tasks.splice(taskIndex, 1);
  editingTaskIndex = null;

  save();
  render();
}

// Open the editing field for the selected task.
function edit(taskIndex) {
  editingTaskIndex = taskIndex;
  render();

  const editInput = taskList.querySelector(".edit-input");

  if (editInput) {
    editInput.focus();
    editInput.select();
  }
}

// Save the new task name.
function saveEdit(taskIndex, editedTaskText) {
  const trimmedTaskText = editedTaskText.trim();

  // Keep the editing field open if the task name is empty.
  if (!trimmedTaskText) return;

  tasks[taskIndex].text = trimmedTaskText;
  editingTaskIndex = null;

  save();
  render();
}

// Close the editing field and display the saved task name.
function cancelEdit() {
  editingTaskIndex = null;
  render();
}

// Press Enter in the new-task input to add a task.
newTaskInput.addEventListener("keydown", (keyboardEvent) => {
  if (keyboardEvent.key === "Enter") {
    add();
  }
});

// Display the saved tasks when the page first loads.
render();