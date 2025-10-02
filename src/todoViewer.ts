import type { Todo } from './todoModel'
import { getAllTodos, getAllCategories, deleteTodo, editTodo, clearCompletedTodos } from './todoModel'
import { showAlertModal, showConfirmModal, showFormModal } from './modalService'

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

  editBtn.addEventListener('click', () => {
    void handleEditTodo(todo.id)
  })
  deleteBtn.addEventListener('click', () => {
    void handleDeleteTodo(todo.id)
  })

  return todoDiv
}

/**
 * Handles editing a todo item
 */
async function handleEditTodo(todoId: string): Promise<void> {
  const todos = getAllTodos()
  const todo = todos.find(t => t.id === todoId)

  if (!todo) {
    await showAlertModal({
      title: 'Todo not found',
      message: 'The selected todo could not be located. It may have already been removed.'
    })
    return
  }

  const categories = getAllCategories()
  if (categories.length === 0) {
    await showAlertModal({
      title: 'No categories available',
      message: 'Add a category before editing todos.'
    })
    return
  }

  const formValues = await showFormModal({
    title: 'Edit todo',
    message: 'Update the details of your todo.',
    confirmLabel: 'Save changes',
    fields: [
      {
        name: 'name',
        label: 'Todo name',
        type: 'text',
        required: true,
        initialValue: todo.name
      },
      {
        name: 'status',
        label: 'Status',
        type: 'select',
        required: true,
        options: [
          { label: 'Pending', value: 'pending' },
          { label: 'In progress', value: 'in-progress' },
          { label: 'Completed', value: 'completed' }
        ],
        initialValue: todo.status
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
        initialValue: todo.categoryId
      },
      {
        name: 'dueDate',
        label: 'Due date',
        type: 'date',
        required: true,
        initialValue: todo.dueDate.toISOString().split('T')[0]
      }
    ]
  })

  if (!formValues) return

  const name = formValues.name.trim()
  if (!name) {
    await showAlertModal({
      title: 'Todo name required',
      message: 'Please provide a name before saving your changes.'
    })
    return
  }

  const status = formValues.status as Todo['status']
  if (!['pending', 'in-progress', 'completed'].includes(status)) {
    await showAlertModal({
      title: 'Invalid status',
      message: 'Choose a valid status for this todo.'
    })
    return
  }

  const dueDate = new Date(formValues.dueDate)
  if (Number.isNaN(dueDate.getTime())) {
    await showAlertModal({
      title: 'Invalid due date',
      message: 'Please select a valid due date.'
    })
    return
  }

  editTodo(todoId, {
    name,
    status,
    categoryId: formValues.categoryId,
    dueDate
  })
  renderTodoList()

  await showAlertModal({
    title: 'Todo updated',
    message: `Todo "${name}" was updated successfully.`
  })
}

/**
 * Handles deleting a todo item
 */
async function handleDeleteTodo(todoId: string): Promise<void> {
  const todos = getAllTodos()
  const todo = todos.find(t => t.id === todoId)

  if (!todo) {
    await showAlertModal({
      title: 'Todo not found',
      message: 'The todo you tried to delete was not found.'
    })
    return
  }

  const confirmed = await showConfirmModal({
    title: 'Delete todo',
    message: `Are you sure you want to delete "${todo.name}"?`,
    confirmLabel: 'Delete',
    cancelLabel: 'Cancel',
    variant: 'danger'
  })

  if (!confirmed) return

  const success = deleteTodo(todoId)
  if (success) {
    renderTodoList()
    await showAlertModal({
      title: 'Todo deleted',
      message: `Todo "${todo.name}" was deleted.`
    })
  } else {
    await showAlertModal({
      title: 'Todo not found',
      message: 'The todo could not be deleted because it no longer exists.'
    })
  }
}

/**
 * Handles clearing all completed todos
 */
async function handleClearCompleted(): Promise<void> {
  const todos = getAllTodos()
  const completedCount = todos.filter(t => t.status === 'completed').length

  if (completedCount === 0) {
    return
  }

  const confirmed = await showConfirmModal({
    title: 'Clear completed todos',
    message: `Are you sure you want to remove ${completedCount} completed todo${completedCount > 1 ? 's' : ''}?`,
    confirmLabel: 'Clear',
    cancelLabel: 'Cancel',
    variant: 'danger'
  })

  if (!confirmed) return

  const deletedCount = clearCompletedTodos()
  renderTodoList()

  await showAlertModal({
    title: 'Completed todos cleared',
    message: `${deletedCount} completed todo${deletedCount > 1 ? 's' : ''} removed successfully.`
  })
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

  // Update the header with Clear Completed button
  updateTodoListHeader()

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
 * Updates the todo list header with the Clear Completed button
 */
function updateTodoListHeader(): void {
  const headerContainer = document.querySelector('.lg\\:col-span-2 .bg-white h2')
  
  if (!headerContainer || !headerContainer.parentElement) {
    return
  }

  const todos = getAllTodos()
  const hasCompletedTodos = todos.some(t => t.status === 'completed')

  // Check if button already exists
  let existingButton = headerContainer.parentElement.querySelector('#clearCompletedBtn') as HTMLButtonElement

  if (hasCompletedTodos) {
    if (!existingButton) {
      // Create the button container if it doesn't exist
      const buttonContainer = document.createElement('div')
      buttonContainer.className = 'flex items-center justify-between mb-4'
      
      // Move the h2 into the container
      const h2 = headerContainer.parentElement.querySelector('h2')
      if (h2) {
        h2.className = 'text-xl font-semibold text-gray-900'
        buttonContainer.appendChild(h2)
        
        // Create the Clear Completed button
        const clearButton = document.createElement('button')
        clearButton.id = 'clearCompletedBtn'
        clearButton.type = 'button'
        clearButton.className = 'bg-red-500 hover:bg-red-600 text-white text-sm font-medium py-2 px-4 rounded-lg transition-colors duration-200'
        clearButton.textContent = 'Clear Completed'
        clearButton.addEventListener('click', () => {
          void handleClearCompleted()
        })
        
        buttonContainer.appendChild(clearButton)
        
        // Insert the container before the todo-list div
        const todoListDiv = document.getElementById('todo-list')
        if (todoListDiv) {
          todoListDiv.parentElement?.insertBefore(buttonContainer, todoListDiv)
        }
      }
    }
  } else {
    // Remove the button if no completed todos
    if (existingButton) {
      const buttonContainer = existingButton.parentElement
      const h2 = buttonContainer?.querySelector('h2')
      
      if (buttonContainer && h2 && buttonContainer.parentElement) {
        // Move h2 back out of the container
        buttonContainer.parentElement.insertBefore(h2, buttonContainer)
        h2.className = 'text-xl font-semibold text-gray-900 mb-4'
        // Remove the button container
        buttonContainer.remove()
      }
    }
  }
}

/**
 * Initializes the todo viewer
 */
export function initTodoViewer(): void {
  // Initial render
  renderTodoList()
}