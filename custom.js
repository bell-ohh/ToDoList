// Get tasks saved in the browser, or start with an empty array.
let tasks = JSON.parse(localStorage.getItem("tasks") || "[]");

// Store the position of the task being edited.
let editingIndex = null;

// Start on the All view.
let currentFilter = "all";

// Find the task list, progress message, empty message, and input.
const list = document.getElementById("list");
const sub = document.getElementById("sub");
const empty = document.getElementById("empty");
const input = document.getElementById("inp");

// Find the All, Active, and Completed buttons at the top.
const filterButtons = document.querySelectorAll(".filters button[data-filter]");

// Change which tasks are visible when a filter button is clicked.
filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    if (currentFilter === button.dataset.filter) return;

    currentFilter = button.dataset.filter;
    editingIndex = null;

    // Highlight the selected filter button.
    filterButtons.forEach((item) => {
      item.setAttribute("aria-pressed", item === button);
    });

    render();
  });
});

// Save the tasks so they are still there after refreshing the page.
function save() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

// Display the tasks that belong in the selected view.
function render() {
  list.innerHTML = "";

  // Use each task's position in the full array so the controls
  // still change the correct task when a filter is selected.
  tasks.forEach((task, i) => {
    // Active shows only unfinished tasks.
    if (currentFilter === "active" && task.done) return;

    // Completed shows only finished tasks.
    if (currentFilter === "completed" && !task.done) return;

    // Create a row for this task.
    const li = document.createElement("li");

    // Apply your existing completed-task style.
    if (task.done) {
      li.className = "done";
    }

    if (editingIndex === i) {
      // Show the task's current text in an editing field.
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
        saveEdit(i, editInput.value);
      });

      // Close the editing field when Cancel is clicked.
      const cancelButton = document.createElement("button");
      cancelButton.type = "button";
      cancelButton.className = "cancel";
      cancelButton.textContent = "Cancel";
      cancelButton.addEventListener("click", cancelEdit);

      // Enter saves the change. Escape cancels it.
      editInput.addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
          saveEdit(i, editInput.value);
        }

        if (event.key === "Escape") {
          cancelEdit();
        }
      });

      li.appendChild(editInput);
      li.appendChild(saveButton);
      li.appendChild(cancelButton);
    } else {
      // Display the task name.
      const span = document.createElement("span");
      span.className = "txt";
      span.textContent = task.text;

      // Give this task its own Active / Completed dropdown.
      const statusSelect = document.createElement("select");
      statusSelect.className = "task-status";
      statusSelect.setAttribute("aria-label", `Status for ${task.text}`);

      // Each task can have one of these two statuses.
      statusSelect.add(new Option("Active", "active"));
      statusSelect.add(new Option("Completed", "completed"));

      // Show the task's saved status in its dropdown.
      statusSelect.value = task.done ? "completed" : "active";

      // Update this task when its dropdown changes.
      statusSelect.addEventListener("change", () => {
        task.done = statusSelect.value === "completed";
        save();
        render();
      });

      // Create the Edit button.
      const editButton = document.createElement("button");
      editButton.type = "button";
      editButton.className = "edit";
      editButton.textContent = "Edit";
      editButton.addEventListener("click", () => edit(i));

      // Create the Delete button.
      const deleteButton = document.createElement("button");
      deleteButton.type = "button";
      deleteButton.className = "del";
      deleteButton.textContent = "x";
      deleteButton.setAttribute("aria-label", `Delete ${task.text}`);
      deleteButton.addEventListener("click", () => remove(i));

      // Display the task name, status dropdown, Edit, and Delete.
      li.appendChild(span);
      li.appendChild(statusSelect);
      li.appendChild(editButton);
      li.appendChild(deleteButton);
    }

    // Add the finished row to the page.
    list.appendChild(li);
  });

  // Count completed tasks across the entire list.
  const done = tasks.filter((task) => task.done).length;

  sub.textContent = tasks.length
    ? `${done} of ${tasks.length} done`
    : "Start adding your tasks below.";

  // Show a message when the selected view is empty.
  const emptyMessages = {
    all: "Nothing here - enjoy the quiet.",
    active: "No active tasks.",
    completed: "No completed tasks."
  };

  empty.textContent = emptyMessages[currentFilter];
  empty.style.display = list.childElementCount ? "none" : "block";
}

// Add a new task when the + button is clicked.
function add() {
  const text = input.value.trim();

  // Skip an empty task.
  if (!text) return;

  // Every new task starts as Active.
  tasks.unshift({ text: text, done: false });

  input.value = "";
  editingIndex = null;

  save();
  render();
}

// Remove the task whose Delete button was clicked.
function remove(i) {
  tasks.splice(i, 1);
  editingIndex = null;

  save();
  render();
}

// Open the editing field for the selected task.
function edit(i) {
  editingIndex = i;
  render();

  const editInput = list.querySelector(".edit-input");

  if (editInput) {
    editInput.focus();
    editInput.select();
  }
}

// Save the new task name.
function saveEdit(i, newText) {
  const text = newText.trim();

  // Keep the editing field open if the name is empty.
  if (!text) return;

  tasks[i].text = text;
  editingIndex = null;

  save();
  render();
}

// Close the editing field and show the original task name.
function cancelEdit() {
  editingIndex = null;
  render();
}

// Press Enter in the new-task field to add a task.
input.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    add();
  }
});

// Display saved tasks when the page opens.
render();