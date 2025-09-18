export interface Category {
    id: string; // unique identifier
    name: string; // category name
}

export interface Todo {
    readonly id: string; // unique identifier
    readonly name: string; // brief description
    readonly status: "pending" | "in-progress" | "completed"; // current state
    readonly categoryId: string; // links to a category
    readonly dueDate: Date; // deadline
}

// NEW: Add this input type for creating todos
export interface CreateTodoInput {
    name: string;
    status?: "pending" | "in-progress" | "completed"; // Optional, defaults to "pending"
    categoryId: string;
    dueDate: Date | string; // Accept both Date and string
}

const store = { 
    todos: [] as Todo[],
    categories: [] as Category[]
}

// Function to create a new Todo
export function createTodo(input: CreateTodoInput): Todo {
    const newTodo = {
       id: generateId(), // auto-generate unique ID
        name: input.name,
        status: input.status || "pending", // default to 'pending'
        categoryId: input.categoryId,
        dueDate: typeof input.dueDate === 'string' ? new Date(input.dueDate) : input.dueDate
    };
    // Create new array with the added todo
    store.todos = [...store.todos, newTodo];
    console.log(`New todo was added with name: ${newTodo.name} to this existing store of todos:`, store.todos);
    return newTodo;
}

function generateId(): string {
    // Get current time to ensure uniqueness
    const now = Date.now();
    
    // Generate random string: convert random number to base-36 and clean it up
    const randomStr = Math.random().toString(36).substring(2, 8);
    
    return `${now}-${randomStr}`;
}

// Function to create a new Category
export function addCategory(name: string): Category {
    const newCategory = {
        id: generateId(), // auto-generate unique ID
        name
    };
    store.categories = [...store.categories, newCategory];
    console.log(`New category was added with name: ${newCategory.name} to this existing store of categories:`, store.categories);
    return newCategory;
}

export function deleteTodo(id: string): boolean {
    const originalLength = store.todos.length;
    // Create a new array excluding the todo with the given id
    store.todos = store.todos.filter(todo => todo.id !== id);
    console.log(`Updated todos after deletion of todo with id ${id}: `, store.todos);
    return store.todos.length < originalLength; // Return true if a todo was deleted
}

export function deleteCategory(id: string): boolean {
    const originalLength = store.categories.length;
    // Create a new array excluding the category with the given id
    store.categories = store.categories.filter(category => category.id !== id);
    console.log(`Updated categories after deletion of category with id ${id}: `, store.categories);
    return store.categories.length < originalLength; // Return true if a category was deleted
}

export function getAllCategories(): Category[] {
    return [...store.categories]; // Return a copy
}