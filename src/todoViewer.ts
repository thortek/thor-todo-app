import type { Todo } from './todoModel'
import { getAllTodos, getAllCategories, deleteTodo, editTodo } from './todoModel'

/**
 * Formats a date for display
 */
function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

/**
 * Gets the category name for a given category ID
 */
function getCategoryName(categoryId: string): string {
  const categories = getAllCategories()
  const category = categories.find(cat => cat.id === categoryId)
  return category ? category.name : 'Unknown Category'
}

/**
 * Returns TailwindCSS classes for status badges
 */
function getStatusClasses(status: Todo['status']): string {
  switch (status) {
    case 'pending':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200'
    case 'in-progress':
      return 'bg-blue-100 text-blue-800 border-blue-200'
    case 'completed':
      return 'bg-green-100 text-green-800 border-green-200'
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200'
  }
}

/**
 * Creates HTML for a single todo item
 */
function createTodoElement(todo: Todo): HTMLElement {
  const todoDiv = document.createElement('div')
  todoDiv.className = 'bg-white rounded-lg shadow-md border border-gray-200 p-4 mb-3 hover:shadow-lg transition-shadow duration-200'
  todoDiv.setAttribute('data-todo-id', todo.id)

  const categoryName = getCategoryName(todo.categoryId)
  const isOverdue = todo.dueDate < new Date() && todo.status !== 'completed'

  todoDiv.innerHTML = `
    <div class="flex items-start justify-between">
      <div class="flex-1">
        <div class="flex items-center gap-2 mb-2">
          <h3 class="text-lg font-semibold text-gray-900">${todo.name}</h3>
          <span class="px-2 py-1 text-xs font-medium rounded-full border ${getStatusClasses(todo.status)}">
            ${todo.status.replace('-', ' ').toUpperCase()}
          </span>
        </div>

        <div class="flex items-center gap-4 text-sm text-gray-600 mb-3">
          <span class="flex items-center gap-1">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
            </svg>
            ${categoryName}
          </span>

          <span class="flex items-center gap-1 ${isOverdue ? 'text-red-600 font-medium' : ''}">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
            </svg>
            ${formatDate(todo.dueDate)}
            ${isOverdue ? '(Overdue)' : ''}
          </span>
        </div>
      </div>

      <div class="flex gap-2 ml-4">
        <button class="edit-btn px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors duration-200" data-todo-id="${todo.id}">
          Edit
        </button>
        <button class="delete-btn px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600 transition-colors duration-200" data-todo-id="${todo.id}">
          Delete
        </button>
      </div>
    </div>
  `

  // Add event listeners for edit and delete buttons
  const editBtn = todoDiv.querySelector('.edit-btn') as HTMLButtonElement
  const deleteBtn = todoDiv.querySelector('.delete-btn') as HTMLButtonElement

  editBtn.addEventListener('click', () => handleEditTodo(todo.id))
  deleteBtn.addEventListener('click', () => handleDeleteTodo(todo.id))

  return todoDiv
}

/**
 * Handles editing a todo item
 */
function handleEditTodo(todoId: string): void {
  const todos = getAllTodos()
  const todo = todos.find(t => t.id === todoId)

  if (!todo) {
    alert('Todo not found')
    return
  }

  // Simple edit dialog - in a real app, you'd want a proper modal
  const newName = prompt('Enter new name:', todo.name)
  if (newName && newName.trim()) {
    const newStatus = prompt('Enter new status (pending/in-progress/completed):', todo.status) as Todo['status']
    if (newStatus && ['pending', 'in-progress', 'completed'].includes(newStatus)) {
      editTodo(todoId, { name: newName.trim(), status: newStatus })
      renderTodoList() // Re-render the list
    }
  }
}

/**
 * Handles deleting a todo item
 */
function handleDeleteTodo(todoId: string): void {
  if (confirm('Are you sure you want to delete this todo?')) {
    const success = deleteTodo(todoId)
    if (success) {
      renderTodoList() // Re-render the list
    } else {
      alert('Todo not found')
    }
  }
}

/**
 * Renders the complete todo list
 */
export function renderTodoList(): void {
  const todos = getAllTodos()
  const todoListContainer = document.getElementById('todo-list')

  if (!todoListContainer) {
    console.error('Todo list container not found')
    return
  }

  // Clear existing content
  todoListContainer.innerHTML = ''

  if (todos.length === 0) {
    todoListContainer.innerHTML = `
      <div class="text-center py-8 text-gray-500">
        <svg class="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
        </svg>
        <p class="text-lg">No todos yet</p>
        <p class="text-sm">Add your first todo to get started!</p>
      </div>
    `
    return
  }

  // Create and append todo elements
  todos.forEach(todo => {
    const todoElement = createTodoElement(todo)
    todoListContainer.appendChild(todoElement)
  })
}

/**
 * Initializes the todo viewer
 */
export function initTodoViewer(): void {
  // Initial render
  renderTodoList()
}