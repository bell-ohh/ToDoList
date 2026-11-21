
 // Get tasks saved in the browser, or start with an empty array.
let tasks = JSON.parse(localStorage.getItem("tasks") || "[]");

// Store which task is being edited; null means no task is being edited.
let editingIndex = null;

// Find the HTML element with the ID "list".
const list = document.getElementById("list");

// Find the HTML element that displays the task progress.
const sub = document.getElementById("sub");

// Find the HTML element that displays the empty-list message.
const empty = document.getElementById("empty");

// Find the input field where users type new tasks.
const input = document.getElementById("inp");

// Create a function called save.
function save() {
  // Convert the tasks array to JSON text and save it in the browser.
  localStorage.setItem("tasks", JSON.stringify(tasks));
} // End the save function.

// Create a function that updates the displayed task list.
function render() {
  // Remove all existing task elements from the list.
  list.innerHTML = "";

  // Loop through every task; t is the task and i is its position.
  tasks.forEach((t, i) => {
    // Create a new HTML list item.
    const li = document.createElement("li");

    // Check whether the task is completed.
    if (t.done) {
      // Add the "done" CSS class to completed tasks.
      li.className = "done";
    } // End the completed-task check.

    // Check whether this task is currently being edited.
    if (editingIndex === i) {
      // Create a text input for editing the task.
      const editInput = document.createElement("input");

      // Set the input type to text.
      editInput.type = "text";

      // Add a CSS class for styling the editing input.
      editInput.className = "edit-input";

      // Display the task's existing text in the input.
      editInput.value = t.text;

      // Limit the input to 100 characters.
      editInput.maxLength = 100;

      // Create a Save button.
      const saveButton = document.createElement("button");

      // Add a CSS class to the Save button.
      saveButton.className = "save";

      // Display the word Save on the button.
      saveButton.textContent = "Save";

      // Listen for a click on the Save button.
      saveButton.addEventListener("click", () => {
        // Save the updated text for this task.
        saveEdit(i, editInput.value);
      }); // End the Save button click listener.

      // Create a Cancel button.
      const cancelButton = document.createElement("button");

      // Add a CSS class to the Cancel button.
      cancelButton.className = "cancel";

      // Display the word Cancel on the button.
      cancelButton.textContent = "Cancel";

      // Run cancelEdit when the Cancel button is clicked.
      cancelButton.addEventListener("click", cancelEdit);

      // Listen for keyboard presses inside the editing input.
      editInput.addEventListener("keydown", (e) => {
        // Check whether the Enter key was pressed.
        if (e.key === "Enter") {
          // Save the edited task.
          saveEdit(i, editInput.value);
        } // End the Enter key check.

        // Check whether the Escape key was pressed.
        if (e.key === "Escape") {
          // Cancel editing without saving the changes.
          cancelEdit();
        } // End the Escape key check.
      }); // End the keyboard listener.

      // Add the editing input to the list item.
      li.appendChild(editInput);

      // Add the Save button to the list item.
      li.appendChild(saveButton);

      // Add the Cancel button to the list item.
      li.appendChild(cancelButton);

    } else {
      // Create a div that acts as the task completion box.
      const box = document.createElement("div");

      // Give the box its CSS class.
      box.className = "box";

      // Change the task's completion status when clicked.
      box.addEventListener("click", () => toggle(i));

      // Create a span to display the task text.
      const span = document.createElement("span");

      // Give the span its CSS class.
      span.className = "txt";

      // Display the task's text inside the span.
      span.textContent = t.text;

      // Create an Edit button.
      const editButton = document.createElement("button");

      // Give the Edit button its CSS class.
      editButton.className = "edit";

      // Display the word Edit on the button.
      editButton.textContent = "Edit";

      // Start editing this task when clicked.
      editButton.addEventListener("click", () => edit(i));

      // Create a Delete button.
      const deleteButton = document.createElement("button");

      // Give the Delete button its CSS class.
      deleteButton.className = "del";

      // Display an x on the Delete button.
      deleteButton.textContent = "x";

      // Remove this task when the Delete button is clicked.
      deleteButton.addEventListener("click", () => remove(i));

      // Add the completion box to the list item.
      li.appendChild(box);

      // Add the task text to the list item.
      li.appendChild(span);

      // Add the Edit button to the list item.
      li.appendChild(editButton);

      // Add the Delete button to the list item.
      li.appendChild(deleteButton);
    } // End the editing condition.

    // Add the task's list item to the main task list.
    list.appendChild(li);
  }); // End the loop through tasks.

  // Count the number of completed tasks.
  const done = tasks.filter((t) => t.done).length;

  // Choose which progress message to display.
  sub.textContent = tasks.length
    // Display the completed-task count when tasks exist.
    ? `${done} of ${tasks.length} done`
    // Display instructions when there are no tasks.
    : "Start adding your tasks below.";

  // Hide the empty message when tasks exist, or show it when none exist.
  empty.style.display = tasks.length ? "none" : "block";

  // Save the current tasks.
  save();
} // End the render function.

// Create a function to add a new task.
function add() {
  // Get the text entered into the new-task input.
  const v = input.value;

  // Check whether the input is empty.
  if (!v) {
    // Stop the function if the input is empty.
    return;
  } // End the empty-input check.

  // Add a new incomplete task to the beginning of the array.
  tasks.unshift({ text: v, done: false });

  // Clear the input field.
  input.value = "";

  // Stop editing any previously selected task.
  editingIndex = null;

  // Update the displayed task list.
  render();
} // End the add function.

// Create a function to change a task's completion status.
function toggle(i) {
  // Switch the task's done value between true and false.
  tasks[i].done = !tasks[i].done;

  // Update the displayed task list.
  render();
} // End the toggle function.

// Create a function to delete a task.
function remove(i) {
  // Remove one task from the array at position i.
  tasks.splice(i, 1);

  // Exit editing mode.
  editingIndex = null;

  // Update the displayed task list.
  render();
} // End the remove function.

// Create a function to start editing a task.
function edit(i) {
  // Store the position of the task being edited.
  editingIndex = i;

  // Update the list to display the editing input.
  render();

  // Find the editing input using its CSS class.
  const editInput = document.querySelector(".edit-input");

  // Check whether the editing input exists.
  if (editInput) {
    // Place the cursor inside the input.
    editInput.focus();

    // Highlight the existing text.
    editInput.select();
  } // End the input check.
} // End the edit function.

// Create a function to save changes to a task.
function saveEdit(i, newText) {
  // Check whether the edited text is empty.
  if (!newText) {
    // Stop if the user entered no text.
    return;
  } // End the empty-text check.

  // Replace the task's existing text with the new text.
  tasks[i].text = newText;

  // Exit editing mode.
  editingIndex = null;

  // Update the displayed task list and save the changes.
  render();
} // End the saveEdit function.

// Create a function to cancel editing.
function cancelEdit() {
  // Exit editing mode without changing the task text.
  editingIndex = null;

  // Restore the normal task display.
  render();
} // End the cancelEdit function.

// Listen for keyboard presses in the new-task input.
input.addEventListener("keydown", (e) => {
  // Check whether the Enter key was pressed.
  if (e.key === "Enter") {
    // Add the new task.
    add();
  } // End the Enter key check.
}); // End the keyboard listener.

// Display the saved tasks when the page first loads.
render();
