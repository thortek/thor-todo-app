import "./style.css"
import "highlight.js/styles/github-dark.css"

import {
  addCategory,
  createTodo,
  deleteCategory,
  getAllCategories,
  getAllTodos,
} from "./todoModel"
import { initTodoViewer, renderTodoList } from "./todoViewer"
import { initChatViewer } from "./chatViewer"
import { initVisionViewer } from "./visionViewer"
import { ImageGenViewer } from "./imageGenViewer"
import {
  showAlertModal,
  showConfirmModal,
  showFormModal,
  setupModalHost,
} from "./modalService"

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
  initApp()
})

function initApp(): void {
  setupModalHost()
  // Set up the main UI
  setupUI()

  // Initialize the todo viewer (default view)
  initTodoViewer()

  // Set up event listeners
  setupEventListeners()
  
  // Set up navigation
  setupNavigation()
}

function setupUI(): void {
  document.querySelector<HTMLDivElement>("#app")!.innerHTML = `
    <div class="min-h-screen bg-gray-50 py-8 px-4">
      <div class="max-w-4xl mx-auto">
        <header class="mb-8">
          <h1 class="text-3xl font-bold text-gray-900 mb-2">My Todo App</h1>
          <p class="text-gray-600">Manage your tasks efficiently</p>
          
          <!-- Navigation Tabs -->
          <div class="flex gap-2 mt-4">
            <button id="nav-todos" class="nav-tab active px-4 py-2 rounded-lg font-medium transition-colors">
              📋 Todos
            </button>
            <button id="nav-chat" class="nav-tab px-4 py-2 rounded-lg font-medium transition-colors">
              💬 AI Chat
            </button>
            <button id="nav-vision" class="nav-tab px-4 py-2 rounded-lg font-medium transition-colors">
              🔍 Image Analysis
            </button>
            <button id="nav-imagegen" class="nav-tab px-4 py-2 rounded-lg font-medium transition-colors">
              🎨 Image Generation
            </button>
          </div>
        </header>

        <!-- Todo View -->
        <div id="todo-view" class="view-container">
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

        <!-- Chat View (hidden by default) -->
        <div id="chat-view" class="view-container hidden">
          <div id="chat-container"></div>
        </div>

        <!-- Vision View (hidden by default) -->
        <div id="vision-view" class="view-container hidden">
          <div id="vision-container"></div>
        </div>

        <!-- Image Generation View (hidden by default) -->
        <div id="imagegen-view" class="view-container hidden">
          <div id="imagegen-container"></div>
        </div>
      </div>
    </div>
  `
}

function setupEventListeners(): void {
  // Add Category
  const addCategoryButton = document.querySelector<HTMLButtonElement>('#addCategory')
  if (addCategoryButton) {
    addCategoryButton.onclick = async () => {
      try {
        const result = await showFormModal({
          title: 'Add category',
          message: 'Organize your tasks by grouping them into categories.',
          confirmLabel: 'Create category',
          fields: [
            {
              name: 'categoryName',
              label: 'Category name',
              type: 'text',
              placeholder: 'e.g. School',
              required: true
            }
          ]
        })

        if (!result) return

        const categoryName = result.categoryName.trim()
        if (!categoryName) {
          await showAlertModal({
            title: 'Category name required',
            message: 'Please provide a category name before saving.'
          })
          return
        }

        const newCategory = await addCategory(categoryName)
        updateCategoriesDropdown()

        await showAlertModal({
          title: 'Category added',
          message: `Category "${newCategory.name}" added successfully!`
        })
      } catch (error) {
        console.error('Error adding category:', error)
        await showAlertModal({
          title: 'Error',
          message: 'There was an error adding the category. Please try again.'
        })
      }
    }
  }

  // Add Todo
  const addTodoButton = document.querySelector<HTMLButtonElement>('#addTodo')
  if (addTodoButton) {
    addTodoButton.onclick = async () => {
      const categories = await getAllCategories()
      if (categories.length === 0) {
        await showAlertModal({
          title: 'Add a category first',
          message: 'Create a category before adding your first todo.'
        })
        return
      }

      const defaultDueDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split('T')[0]

      const result = await showFormModal({
        title: 'Add todo',
        message: 'Create a new todo and assign it to a category.',
        confirmLabel: 'Create todo',
        fields: [
          {
            name: 'name',
            label: 'Todo name',
            type: 'text',
            placeholder: 'e.g. Finish homework',
            required: true
          },
          {
            name: 'categoryId',
            label: 'Category',
            type: 'select',
            required: true,
            options: categories.map(category => ({
              label: category.name,
              value: category.id
            })),
            initialValue: categories[0]?.id
          },
          {
            name: 'dueDate',
            label: 'Due date',
            type: 'date',
            required: true,
            initialValue: defaultDueDate
          }
        ]
      })

      if (!result) return

      const name = result.name?.trim()
      if (!name) {
        await showAlertModal({
          title: 'Todo name required',
          message: 'Please provide a name for your todo.'
        })
        return
      }

      const dueDate = new Date(result.dueDate)
      if (Number.isNaN(dueDate.getTime())) {
        await showAlertModal({
          title: 'Invalid due date',
          message: 'Please select a valid due date.'
        })
        return
      }

      const newTodo = await createTodo({
        name,
        status: 'pending',
        categoryId: result.categoryId,
        dueDate
      })
      renderTodoList()
      updateCategoriesDropdown()

      await showAlertModal({
        title: 'Todo added',
        message: `Todo "${newTodo.name}" added successfully!`
      })
    }
  }

  // Delete Category
  const deleteCategoryButton = document.querySelector<HTMLButtonElement>('#deleteCategory')
  if (deleteCategoryButton) {
    deleteCategoryButton.onclick = async () => {
      const categories = await getAllCategories()
      if (categories.length === 0) {
        await showAlertModal({
          title: 'No categories to delete',
          message: 'Add a category before trying to delete one.'
        })
        return
      }

      const selection = await showFormModal({
        title: 'Delete category',
        message: 'Select the category you want to remove.',
        confirmLabel: 'Continue',
        cancelLabel: 'Back',
        fields: [
          {
            name: 'categoryId',
            label: 'Category',
            type: 'select',
            required: true,
            options: categories.map(category => ({
              label: category.name,
              value: category.id
            })),
            initialValue: categories[0]?.id
          }
        ]
      })

      if (!selection) return

      const category = categories.find(cat => cat.id === selection.categoryId)
      if (!category) {
        await showAlertModal({
          title: 'Category not found',
          message: 'The selected category could not be found.'
        })
        updateCategoriesDropdown()
        return
      }

      const todos = await getAllTodos()
      const hasTodos = todos.some(todo => todo.categoryId === category.id)
      if (hasTodos) {
        await showAlertModal({
          title: 'Cannot delete category',
          message: `Reassign or delete todos in "${category.name}" before removing this category.`
        })
        return
      }

      const confirmed = await showConfirmModal({
        title: 'Delete category',
        message: `This action cannot be undone. Delete "${category.name}"?`,
        confirmLabel: 'Delete',
        cancelLabel: 'Cancel',
        variant: 'danger',
        dismissible: false
      })

      if (!confirmed) return

      await deleteCategory(category.id)
      updateCategoriesDropdown()
      await showAlertModal({
        title: 'Category deleted',
        message: `Category "${category.name}" has been deleted.`
      })
    }
  }

  const deleteTodoButton = document.querySelector<HTMLButtonElement>('#deleteTodo')
  if (deleteTodoButton) {
    deleteTodoButton.onclick = async () => {
      await showAlertModal({
        title: 'Tip',
        message: 'Use the Delete button on individual todos in the list below.'
      })
    }
  }

  // Initialize categories dropdown
  updateCategoriesDropdown()
}

// Function to populate categories dropdown
async function updateCategoriesDropdown(): Promise<void> {
  const dropdown = document.querySelector<HTMLSelectElement>("#categoriesDropdown")!
  const categories = await getAllCategories()

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

// Setup navigation between views
function setupNavigation(): void {
  const todosBtn = document.querySelector<HTMLButtonElement>('#nav-todos')
  const chatBtn = document.querySelector<HTMLButtonElement>('#nav-chat')
  const visionBtn = document.querySelector<HTMLButtonElement>('#nav-vision')
  const imagegenBtn = document.querySelector<HTMLButtonElement>('#nav-imagegen')
  
  if (!todosBtn || !chatBtn || !visionBtn || !imagegenBtn) return

  todosBtn.addEventListener('click', () => {
    switchView('todos')
  })

  chatBtn.addEventListener('click', () => {
    switchView('chat')
  })

  visionBtn.addEventListener('click', () => {
    switchView('vision')
  })

  imagegenBtn.addEventListener('click', () => {
    switchView('imagegen')
  })
}

// Switch between views
function switchView(view: 'todos' | 'chat' | 'vision' | 'imagegen'): void {
  const todoView = document.querySelector<HTMLDivElement>('#todo-view')
  const chatView = document.querySelector<HTMLDivElement>('#chat-view')
  const visionView = document.querySelector<HTMLDivElement>('#vision-view')
  const imagegenView = document.querySelector<HTMLDivElement>('#imagegen-view')
  const todosBtn = document.querySelector<HTMLButtonElement>('#nav-todos')
  const chatBtn = document.querySelector<HTMLButtonElement>('#nav-chat')
  const visionBtn = document.querySelector<HTMLButtonElement>('#nav-vision')
  const imagegenBtn = document.querySelector<HTMLButtonElement>('#nav-imagegen')
  
  if (!todoView || !chatView || !visionView || !imagegenView || !todosBtn || !chatBtn || !visionBtn || !imagegenBtn) return

  // Hide all views
  todoView.classList.add('hidden')
  chatView.classList.add('hidden')
  visionView.classList.add('hidden')
  imagegenView.classList.add('hidden')
  
  // Deactivate all buttons
  todosBtn.classList.remove('active')
  chatBtn.classList.remove('active')
  visionBtn.classList.remove('active')
  imagegenBtn.classList.remove('active')

  // Show selected view and activate button
  if (view === 'todos') {
    todoView.classList.remove('hidden')
    todosBtn.classList.add('active')
  } else if (view === 'chat') {
    chatView.classList.remove('hidden')
    chatBtn.classList.add('active')
    
    // Initialize chat viewer when first switching to it
    if (!chatView.hasAttribute('data-initialized')) {
      initChatViewer()
      chatView.setAttribute('data-initialized', 'true')
    }
  } else if (view === 'vision') {
    visionView.classList.remove('hidden')
    visionBtn.classList.add('active')
    
    // Initialize vision viewer when first switching to it
    if (!visionView.hasAttribute('data-initialized')) {
      initVisionViewer()
      visionView.setAttribute('data-initialized', 'true')
    }
  } else if (view === 'imagegen') {
    imagegenView.classList.remove('hidden')
    imagegenBtn.classList.add('active')
    
    // Initialize image generation viewer when first switching to it
    if (!imagegenView.hasAttribute('data-initialized')) {
      new ImageGenViewer('imagegen-container')
      imagegenView.setAttribute('data-initialized', 'true')
    }
  }
}
