import type { Todo, Category, CreateTodoInput } from './todoModel'

const API_BASE_URL = 'http://localhost:3000/api'

// Helper function for fetch requests
async function fetchJSON<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }))
    throw new Error(error.error || `HTTP error! status: ${response.status}`)
  }

  // Handle 204 No Content
  if (response.status === 204) {
    return null as T
  }

  return response.json()
}

// Todo API calls
export async function fetchAllTodos(): Promise<Todo[]> {
  return fetchJSON<Todo[]>(`${API_BASE_URL}/todos`)
}

export async function createTodoAPI(input: CreateTodoInput): Promise<Todo> {
  return fetchJSON<Todo>(`${API_BASE_URL}/todos`, {
    method: 'POST',
    body: JSON.stringify(input),
  })
}

export async function updateTodoAPI(
  id: string,
  updates: Partial<Pick<Todo, 'name' | 'status' | 'categoryId' | 'dueDate'>>
): Promise<Todo> {
  return fetchJSON<Todo>(`${API_BASE_URL}/todos/${id}`, {
    method: 'PUT',
    body: JSON.stringify(updates),
  })
}

export async function deleteTodoAPI(id: string): Promise<void> {
  return fetchJSON<void>(`${API_BASE_URL}/todos/${id}`, {
    method: 'DELETE',
  })
}

export async function clearCompletedTodosAPI(): Promise<{ deletedCount: number }> {
  return fetchJSON<{ deletedCount: number }>(`${API_BASE_URL}/todos/completed/clear`, {
    method: 'DELETE',
  })
}

// Category API calls
export async function fetchAllCategories(): Promise<Category[]> {
  return fetchJSON<Category[]>(`${API_BASE_URL}/categories`)
}

export async function createCategoryAPI(name: string): Promise<Category> {
  return fetchJSON<Category>(`${API_BASE_URL}/categories`, {
    method: 'POST',
    body: JSON.stringify({ name }),
  })
}

export async function deleteCategoryAPI(id: string): Promise<void> {
  return fetchJSON<void>(`${API_BASE_URL}/categories/${id}`, {
    method: 'DELETE',
  })
}
