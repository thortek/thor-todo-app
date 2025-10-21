Yes! **APIDog is perfect** for testing your API service! It's essentially like Postman, so you can test all your endpoints before integrating them into your frontend.

## Setup Steps

### 1. Start Your Server
First, make sure your backend server is running:

```bash
cd server
npm start
# Or from root: npm run server
```

Your API should be available at `http://localhost:3000/api`

### 2. Create a New Collection in APIDog

Create a collection called "Todo App API" to organize your tests.

## Essential Tests to Create

### Test 1: GET All Todos ✅
**Purpose:** Verify you can fetch all todos

- **Method:** `GET`
- **URL:** `http://localhost:3000/api/todos`
- **Headers:** None needed
- **Body:** None
- **Expected Response:** `200 OK` with array of todos

```json
[
  {
    "id": "todo1",
    "name": "Complete project",
    "status": "active",
    "categoryId": "cat1",
    "dueDate": "2025-10-30",
    "createdAt": "2025-10-21T..."
  }
]
```

### Test 2: GET All Categories ✅
**Purpose:** Verify you can fetch all categories

- **Method:** `GET`
- **URL:** `http://localhost:3000/api/categories`
- **Headers:** None needed
- **Body:** None
- **Expected Response:** `200 OK` with array of categories

```json
[
  {
    "id": "cat1",
    "name": "Work"
  }
]
```

### Test 3: POST Create Todo ✨
**Purpose:** Test creating a new todo

- **Method:** `POST`
- **URL:** `http://localhost:3000/api/todos`
- **Headers:** 
  - `Content-Type: application/json`
- **Body (JSON):**
```json
{
  "name": "Test from APIDog",
  "categoryId": "cat1",
  "dueDate": "2025-10-25"
}
```
- **Expected Response:** `201 Created` with the new todo object

### Test 4: PUT Update Todo 📝
**Purpose:** Test updating an existing todo

- **Method:** `PUT`
- **URL:** `http://localhost:3000/api/todos/todo1` _(replace `todo1` with actual ID)_
- **Headers:**
  - `Content-Type: application/json`
- **Body (JSON):**
```json
{
  "name": "Updated from APIDog",
  "status": "completed"
}
```
- **Expected Response:** `200 OK` with updated todo

### Test 5: DELETE Todo 🗑️
**Purpose:** Test deleting a todo

- **Method:** `DELETE`
- **URL:** `http://localhost:3000/api/todos/todo1` _(use ID from test 3)_
- **Headers:** None needed
- **Body:** None
- **Expected Response:** `204 No Content` (empty response)

### Test 6: DELETE Clear Completed 🧹
**Purpose:** Test clearing all completed todos

- **Method:** `DELETE`
- **URL:** `http://localhost:3000/api/todos/completed/clear`
- **Headers:** None needed
- **Body:** None
- **Expected Response:** `200 OK`
```json
{
  "deletedCount": 2
}
```

### Test 7: POST Create Category 📁
**Purpose:** Test creating a new category

- **Method:** `POST`
- **URL:** `http://localhost:3000/api/categories`
- **Headers:**
  - `Content-Type: application/json`
- **Body (JSON):**
```json
{
  "name": "Personal"
}
```
- **Expected Response:** `201 Created` with new category

### Test 8: DELETE Category 🗑️
**Purpose:** Test deleting a category

- **Method:** `DELETE`
- **URL:** `http://localhost:3000/api/categories/cat2` _(use ID from test 7)_
- **Headers:** None needed
- **Body:** None
- **Expected Response:** `204 No Content`

## Testing Workflow (Recommended Order)

```
1. GET /categories          → See what categories exist
2. POST /categories         → Create a new category (save the ID!)
3. GET /todos              → See existing todos
4. POST /todos             → Create a todo (save the ID!)
5. GET /todos              → Verify new todo appears
6. PUT /todos/:id          → Update the todo
7. GET /todos              → Verify changes
8. DELETE /todos/:id       → Delete the todo
9. GET /todos              → Verify deletion
10. DELETE /categories/:id  → Clean up test category
```

## Pro Tips for APIDog Testing

### 1. **Use Environment Variables**
Set up a variable for your base URL:
- Variable name: `BASE_URL`
- Value: `http://localhost:3000/api`
- Then use: `{{BASE_URL}}/todos`

### 2. **Save Response IDs**
After creating a todo, APIDog can automatically save the `id` from the response:
- Go to "Tests" tab in request
- Add: Save response field `id` to variable `todoId`
- Use `{{todoId}}` in subsequent requests

### 3. **Create Test Assertions**
In APIDog's "Tests" tab, add assertions:
```javascript
// For GET /todos
pm.test("Status is 200", () => {
  pm.response.to.have.status(200);
});

pm.test("Response is array", () => {
  pm.expect(pm.response.json()).to.be.an('array');
});

// For POST /todos
pm.test("Todo created with ID", () => {
  const json = pm.response.json();
  pm.expect(json).to.have.property('id');
  pm.expect(json.name).to.equal('Test from APIDog');
});
```

### 4. **Test Error Cases**
Don't forget to test failures:
- POST with missing required fields → `400 Bad Request`
- GET/PUT/DELETE with invalid ID → `404 Not Found`
- DELETE category that's in use → `400 Bad Request`

## Quick Start Checklist

✅ Server running on port 3000  
✅ Create "Todo App API" collection in APIDog  
✅ Test GET endpoints first (read-only, safe)  
✅ Test POST to create data  
✅ Test PUT to update data  
✅ Test DELETE to remove data  
✅ Save IDs from responses for subsequent tests  
✅ Check status codes match expectations  
✅ Verify response data structure  

## Example APIDog Collection Structure

```
📁 Todo App API
  📂 Todos
    ├── GET All Todos
    ├── POST Create Todo
    ├── PUT Update Todo
    ├── DELETE Todo
    └── DELETE Clear Completed
  📂 Categories
    ├── GET All Categories
    ├── POST Create Category
    └── DELETE Category
```

This approach will help you verify your API works correctly **before** you integrate it into your frontend with section 3.2! 🚀