import "./style.css"

import {
  addCategory,
  createTodo,
  getAllCategories,
} from "./todoModel"
import { initTodoViewer, renderTodoList } from "./todoViewer"

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
  initApp()
})

function initApp(): void {
  // Set up the main UI
  setupUI()

  // Initialize the todo viewer
  initTodoViewer()

  // Set up event listeners
  setupEventListeners()
}

function setupUI(): void {
  document.querySelector<HTMLDivElement>("#app")!.innerHTML = `
    <div class="min-h-screen bg-gray-50 py-8 px-4">
      <div class="max-w-4xl mx-auto">
        <header class="mb-8">
          <h1 class="text-3xl font-bold text-gray-900 mb-2">My Todo App</h1>
          <p class="text-gray-600">Manage your tasks efficiently</p>
        </header>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <!-- Control Panel -->
          <div class="lg:col-span-1">
            <div class="bg-white rounded-lg shadow-md p-6">
              <h2 class="text-xl font-semibold text-gray-900 mb-4">Actions</h2>

              <div class="space-y-3">
                <button type="button" id="addCategory" class="w-full bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200">
                  Add Category
                </button>

                <button type="button" id="addTodo" class="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200">
                  Add Todo
                </button>

                <button type="button" id="deleteCategory" class="w-full bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200">
                  Delete Category
                </button>

                <select id="categoriesDropdown" class="w-full mt-4 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                  <option value="" disabled selected>Select a category</option>
                </select>
              </div>
            </div>
          </div>

          <!-- Todo List -->
          <div class="lg:col-span-2">
            <div class="bg-white rounded-lg shadow-md p-6">
              <h2 class="text-xl font-semibold text-gray-900 mb-4">My Todos</h2>
              <div id="todo-list" class="space-y-4">
                <!-- Todos will be rendered here -->
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
}

function setupEventListeners(): void {
  // Add Category
  document.querySelector<HTMLButtonElement>("#addCategory")!.onclick = () => {
    const categoryName = prompt("Enter category name:")
    if (categoryName?.trim()) {
      const newCategory = addCategory(categoryName.trim())
      updateCategoriesDropdown()
      alert(`Category "${newCategory.name}" added successfully!`)
    }
  }

  // Add Todo
  document.querySelector<HTMLButtonElement>("#addTodo")!.onclick = () => {
    const todoName = prompt("Enter todo name:")
    if (!todoName?.trim()) return

    const categories = getAllCategories()
    if (categories.length === 0) {
      alert("Please add a category first!")
      return
    }

    // Use the first category as default, or let user choose
    const defaultCategory = categories[0]
    const dueDateInput = prompt("Enter due date (YYYY-MM-DD):", new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])

    if (dueDateInput) {
      try {
        const dueDate = new Date(dueDateInput)
        const newTodo = createTodo({
          name: todoName.trim(),
          status: "pending",
          categoryId: defaultCategory.id,
          dueDate
        })
        renderTodoList() // Refresh the todo list
        alert(`Todo "${newTodo.name}" added successfully!`)
      } catch (error) {
        alert("Invalid date format. Please use YYYY-MM-DD format.")
      }
    }
  }

  // Delete Category
  document.querySelector<HTMLButtonElement>("#deleteCategory")!.onclick = () => {
    const categories = getAllCategories()
    if (categories.length === 0) {
      alert("No categories to delete!")
      return
    }

    const categoryNames = categories.map(cat => cat.name).join(', ')
    const categoryName = prompt(`Enter category name to delete:\nAvailable: ${categoryNames}`)

    if (categoryName?.trim()) {
      const category = categories.find(cat => cat.name.toLowerCase() === categoryName.trim().toLowerCase())
      if (category) {
        const success = confirm(`Are you sure you want to delete category "${category.name}"?`)
        if (success) {
          // Note: We should check if category has todos before deleting
          // For now, we'll just delete it
          // In a real app, you'd want to handle this better
          alert("Category deletion not implemented in this demo")
        }
      } else {
        alert("Category not found!")
      }
    }
  }

  // Delete Todo (using prompt for ID - in real app, this would be handled by the todo viewer)
  document.querySelector<HTMLButtonElement>("#deleteTodo")!.onclick = () => {
    alert("Use the Delete button on individual todos in the list below!")
  }

  // Initialize categories dropdown
  updateCategoriesDropdown()
}

// Function to populate categories dropdown
function updateCategoriesDropdown(): void {
  const dropdown = document.querySelector<HTMLSelectElement>("#categoriesDropdown")!
  const categories = getAllCategories()

  // Clear existing options (except the first placeholder)
  dropdown.innerHTML = '<option value="" disabled selected>Select a category</option>'

  // Add each category as an option
  categories.forEach(category => {
    const option = document.createElement('option')
    option.value = category.id
    option.textContent = category.name
    dropdown.appendChild(option)
  })
}
