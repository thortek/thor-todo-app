/* Todo name
Status
ID
Category
Due Date */

export interface Todo {
    readonly id: string; // unique identifier
    readonly name: string; // brief description
    readonly status: "pending" | "in-progress" | "completed"; // current state
    readonly categoryId: string; // links to a category
    readonly dueDate: Date; // deadline
}

// Example usage:
const exampleTodo: Todo = {
    id: "1",
    name: "Finish TypeScript project",
    status: "in-progress",
    categoryId: "work",
    dueDate: new Date("2023-12-31"),
};

// Function to create a new Todo
export function createTodo(input: Todo): Todo {
    return {
        id: generateId(), // auto-generate unique ID
        name: input.name,
        status: input.status || "pending", // default to 'pending'
        categoryId: input.categoryId,
        dueDate: typeof input.dueDate === 'string' ? new Date(input.dueDate) : input.dueDate
    };
}
