import "./style.css"

import {
  addCategory,
  createTodo,
  deleteCategory,
  deleteTodo,
  getAllCategories
} from "./todoModel"

document.querySelector<HTMLDivElement>("#app")!.innerHTML = `
  <div>
   <h1>Welcome to my Todo App</h1>

   <button type="button" id="addCategory">Add a Category</button>
   <button type="button" id="addTodo">Add a Todo item</button>
   <button type="button" id="deleteCategory">Delete a Category</button>
   <button type="button" id="deleteTodo">Delete a Todo item</button>

   <select id="categoriesDropdown">
     <option value="" disabled selected>Select a category</option>
   </select>

  </div>
`

document.querySelector<HTMLButtonElement>("#addCategory")!.onclick = () => {
  const categoryName = prompt("Enter category name:")
  if (categoryName) {
    const newCategory = addCategory(categoryName)
    updateCategoriesDropdown(); // Update dropdown after adding
    alert(`Category added with ID: ${newCategory.id} and name: ${newCategory.name}`)
  }
}

// Make similar onclick handlers for addTodo, deleteCategory, deleteTodo
document.querySelector<HTMLButtonElement>("#addTodo")!.onclick = () => {
  const todoName = prompt("Enter todo name:")
  const newCategory = addCategory("Default Category")
  
  if (todoName && newCategory) {
    const dueDate = new Date("2025-09-18")
    const newTodo = createTodo({ name: todoName, status: "pending", categoryId: newCategory.id, dueDate })
    alert(`Todo added with ID: ${newTodo.id}, name: ${newTodo.name}, categoryId: ${newTodo.categoryId}, dueDate: ${newTodo.dueDate}`)
  }
}

document.querySelector<HTMLButtonElement>("#deleteCategory")!.onclick = () => {
  const categoryId = prompt("Enter category ID to delete:")
  if (categoryId) {
    const success = deleteCategory(categoryId)
    alert(success ? `Category with ID ${categoryId} deleted.` : `Category with ID ${categoryId} not found.`)
  }
}

document.querySelector<HTMLButtonElement>("#deleteTodo")!.onclick = () => {
  const todoId = prompt("Enter todo ID to delete:")
  if (todoId) {
    const success = deleteTodo(todoId)
    alert(success ? `Todo with ID ${todoId} deleted.` : `Todo with ID ${todoId} not found.`)
  }
}

// Function to populate categories dropdown
function updateCategoriesDropdown() {
  const dropdown = document.querySelector<HTMLSelectElement>("#categoriesDropdown")!;
  const categories = getAllCategories();
  
  // Clear existing options (except the first placeholder)
  dropdown.innerHTML = '<option value="" disabled selected>Select a category</option>';
  
  // Add each category as an option
  categories.forEach(category => {
    const option = document.createElement('option');
    option.value = category.id;
    option.textContent = category.name;
    dropdown.appendChild(option);
  });
}
