# 📋 TODO List API - Postman Collection Guide

## 🎯 Overview

This comprehensive Postman collection provides a complete testing suite for the TODO List API,
including authentication, CRUD operations for lists and tasks, advanced queries, and user isolation
testing.

## 🔧 Setup Instructions

### 1. Import the Collection

1. Open Postman
2. Click "Import" button
3. Select `postman-collection.json` file
4. The collection will be imported with all endpoints and variables

### 2. Environment Variables

The collection uses the following variables (automatically managed):

- `base_url`: http://localhost:3001 (API server URL)
- `auth_token`: JWT token (auto-populated after login)
- `user_id`: Current user ID (auto-populated)
- `list_id`: Current list ID (auto-populated after creating a list)
- `task_id`: Current task ID (auto-populated after creating a task)

## 🚀 Getting Started - Quick Test Flow

### Step 1: Start the Server

```bash
npm start
```

Ensure the server is running on http://localhost:3001

### Step 2: Authentication Flow

1. **Register New User** - Create your account
   - Uses strong password: `Password123!`
   - Auto-saves JWT token for subsequent requests
2. **Login User** - Authenticate existing user
   - Test that login works with email/password
   - Verifies JWT token generation

### Step 3: Lists Management

1. **Create New List** - Creates a list and saves the ID
2. **Get All Lists** - View all user's lists
3. **Get Specific List** - Retrieve list details
4. **Update List** - Modify list name/description
5. **Get Tasks in List** - View tasks within the list

### Step 4: Tasks Management

1. **Create Task in List** - Add a task to your list
2. **Get Specific Task** - Retrieve task details
3. **Update Task** - Modify task properties
4. **Mark Task as Complete** - Toggle completion status
5. **Update Task Deadline** - Change task deadline

### Step 5: Advanced Features

1. **Search Tasks** - Search by title/description
2. **Get Task Statistics** - View task analytics
3. **Get User Analytics** - Overall user statistics
4. **Get Tasks Due This Week** - Filter by deadline
5. **Get Overdue Tasks** - View past-due tasks

## 🔐 Authentication Testing

### User Isolation Tests

The collection includes scenarios to test user data isolation:

1. **Register Second User** - Create another account
2. **Login Second User** - Switch to second user
3. **Test Cross-User Access** - Verify users can't access each other's data
4. **Test Unauthorized Access** - Verify endpoints require authentication

## 📊 Collection Structure

```
🔐 Authentication
├── Register New User
├── Login User
└── Test Authentication

📋 Lists Management
├── Get All Lists
├── Create New List
├── Get Specific List
├── Update List
├── Get Tasks in List
└── Delete List

✅ Tasks Management
├── Create Task in List
├── Get Specific Task
├── Update Task
├── Mark Task as Complete
├── Update Task Deadline
└── Delete Task

🔍 Advanced Queries & Analytics
├── Search Tasks
├── Get Task Statistics
├── Get User Analytics
├── Get Tasks Due This Week
└── Get Overdue Tasks

🔄 Testing Scenarios
├── Register Second User
├── Login Second User
├── Test Cross-User Access (Should Fail)
└── Test Unauthorized Access (Should Fail)

🏥 System Health
├── Basic Health Check
├── API Information
└── OpenAPI Documentation
```

## 🎮 Interactive Features

### Auto-Token Management

- JWT tokens are automatically extracted and saved after login/registration
- All authenticated requests use the saved token
- No manual token copying required

### Auto-ID Management

- List IDs and Task IDs are automatically saved when created
- Subsequent requests use the saved IDs
- Enables smooth workflow testing

### Test Scripts

Each request includes test scripts that:

- Validate response status codes
- Extract and save important data
- Log success/failure messages
- Handle error scenarios

## 🔍 API Endpoint Reference

### Authentication Endpoints

| Method | Endpoint             | Description         |
| ------ | -------------------- | ------------------- |
| POST   | `/api/auth/register` | Register new user   |
| POST   | `/api/auth/login`    | Login existing user |

### Lists Endpoints

| Method | Endpoint                | Description        |
| ------ | ----------------------- | ------------------ |
| GET    | `/api/lists`            | Get all user lists |
| POST   | `/api/lists`            | Create new list    |
| GET    | `/api/lists/{id}`       | Get specific list  |
| PUT    | `/api/lists/{id}`       | Update list        |
| DELETE | `/api/lists/{id}`       | Delete list        |
| GET    | `/api/lists/{id}/tasks` | Get tasks in list  |

### Tasks Endpoints

| Method | Endpoint                          | Description              |
| ------ | --------------------------------- | ------------------------ |
| POST   | `/api/tasks/lists/{listId}/tasks` | Create task in list      |
| GET    | `/api/tasks/{id}`                 | Get specific task        |
| PUT    | `/api/tasks/{id}`                 | Update task              |
| DELETE | `/api/tasks/{id}`                 | Delete task              |
| PATCH  | `/api/tasks/{id}/completion`      | Update completion status |
| PATCH  | `/api/tasks/{id}/deadline`        | Update deadline          |
| GET    | `/api/tasks/{id}/statistics`      | Get task statistics      |

### Query Endpoints

| Method | Endpoint                      | Description         |
| ------ | ----------------------------- | ------------------- |
| GET    | `/api/tasks/search?q={query}` | Search tasks        |
| GET    | `/api/tasks/analytics`        | User analytics      |
| GET    | `/api/tasks/due-this-week`    | Tasks due this week |
| GET    | `/api/tasks/overdue`          | Overdue tasks       |

## 💡 Usage Tips

### 1. Run Requests in Order

- Start with Authentication
- Create Lists before Tasks
- Use the auto-populated IDs

### 2. Check Console Output

- Postman console shows detailed logs
- Success/failure messages help with debugging
- View extracted data (tokens, IDs)

### 3. Test Error Scenarios

- Try accessing other users' data
- Test with invalid IDs
- Test without authentication tokens

### 4. Customize Test Data

- Modify request bodies to test edge cases
- Try different priority levels: `low`, `medium`, `high`, `urgent`
- Test with various date formats for deadlines

## 🛠️ Troubleshooting

### Common Issues

**Server Not Running**

```
Error: connect ECONNREFUSED 127.0.0.1:3001
```

Solution: Start the server with `npm start`

**Authentication Failed**

```
{"error": "Authentication required"}
```

Solution: Run login request first to get a valid token

**Task Creation Failed**

```
{"error": "Request body validation failed"}
```

Solution: Check priority values: use `low`, `medium`, `high`, or `urgent`

**Route Not Found (Root Path)**

```
{"error": {"code": "ROUTE_NOT_FOUND", "message": "Route GET / not found"}}
```

This is NORMAL! The root path `/` has no route. Use the available endpoints:

- `/health` - Health check
- `/api` - API information
- `/docs` - API documentation
- `/api/auth/register` - Register user
- `/api/auth/login` - Login user
- `/api/lists` - Lists management

**Other Route Not Found Errors**

```
{"error": {"code": "ROUTE_NOT_FOUND"}}
```

Solution: Verify the endpoint URL matches the API structure

## 🎯 Testing Checklist

- [ ] User registration works with strong password
- [ ] User login returns JWT token
- [ ] JWT token is auto-saved and used
- [ ] Users can create lists
- [ ] Users can create tasks in lists
- [ ] Users can update task completion status
- [ ] Search functionality works
- [ ] User data isolation is enforced
- [ ] Unauthorized access is blocked
- [ ] Analytics endpoints return data

## 🔗 Related Documentation

- **API Documentation**: http://localhost:3001/docs (Swagger UI)
- **Health Check**: http://localhost:3001/health
- **API Info**: http://localhost:3001/api

---

## 🎉 Ready to Test!

This collection provides everything you need to test the TODO List API comprehensively. Import it
into Postman and start with the "Register New User" request to begin your testing journey!
