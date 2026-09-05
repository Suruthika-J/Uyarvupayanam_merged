# 🚀 Career Path API - Complete Guide

## 📋 Table of Contents
1. [Backend Setup](#backend-setup)
2. [API Endpoints](#api-endpoints)
3. [Postman Testing](#postman-testing)
4. [Frontend Integration](#frontend-integration)
5. [Error Handling](#error-handling)

---

## 🔧 Backend Setup

### 1. Folder Structure
```
backend/
├── config/
│   └── db.js
├── controllers/
│   ├── adminController.js
│   └── careerPathController.js
├── models/
│   ├── Admin.js
│   ├── User.js
│   └── CareerPath.js
├── routes/
│   ├── adminRoutes.js
│   └── careerPathRoutes.js
├── .env
├── server.js
└── createAdmin.js
```

### 2. Environment Variables (`.env`)
```env
MONGO_URI=mongodb+srv://uyarvupayanam_db_user:UyarvuPayanam1234@cluster0.i0sep1t.mongodb.net/uyarvuPayanam?retryWrites=true&w=majority
PORT=5000
JWT_SECRET=UyarvuPayanamSecretKey
```

### 3. Start Backend Server
```bash
cd backend
node server.js
```

Server will run on: `http://localhost:5000`

---

## 🌐 API Endpoints

### Base URL
```
http://localhost:5000/api/career-paths
```

### 1️⃣ CREATE Career Path
- **Method**: `POST`
- **URL**: `/api/career-paths`
- **Body** (JSON):
```json
{
  "title": "Engineering Career Path",
  "ageGroup": "14-16 years",
  "level": "Intermediate",
  "careerDirections": ["Mechanical Engineering", "Software Development", "Civil Engineering"],
  "description": "A comprehensive guide for students interested in engineering careers"
}
```

**Success Response** (201):
```json
{
  "success": true,
  "message": "Career path created successfully",
  "data": {
    "_id": "65a1b2c3d4e5f6g7h8i9j0k1",
    "title": "Engineering Career Path",
    "ageGroup": "14-16 years",
    "level": "Intermediate",
    "careerDirections": ["Mechanical Engineering", "Software Development", "Civil Engineering"],
    "description": "A comprehensive guide for students interested in engineering careers",
    "createdAt": "2026-03-02T14:30:00.000Z",
    "updatedAt": "2026-03-02T14:30:00.000Z"
  }
}
```

---

### 2️⃣ GET All Career Paths
- **Method**: `GET`
- **URL**: `/api/career-paths`

**Success Response** (200):
```json
{
  "success": true,
  "count": 3,
  "data": [
    {
      "_id": "65a1b2c3d4e5f6g7h8i9j0k1",
      "title": "Engineering Career Path",
      "ageGroup": "14-16 years",
      "level": "Intermediate",
      "careerDirections": ["Mechanical Engineering", "Software Development"],
      "description": "Engineering guide for students",
      "createdAt": "2026-03-02T14:30:00.000Z",
      "updatedAt": "2026-03-02T14:30:00.000Z"
    }
  ]
}
```

---

### 3️⃣ GET Single Career Path
- **Method**: `GET`
- **URL**: `/api/career-paths/:id`
- **Example**: `/api/career-paths/65a1b2c3d4e5f6g7h8i9j0k1`

**Success Response** (200):
```json
{
  "success": true,
  "data": {
    "_id": "65a1b2c3d4e5f6g7h8i9j0k1",
    "title": "Engineering Career Path",
    "ageGroup": "14-16 years",
    "level": "Intermediate",
    "careerDirections": ["Mechanical Engineering", "Software Development"],
    "description": "Engineering guide for students",
    "createdAt": "2026-03-02T14:30:00.000Z",
    "updatedAt": "2026-03-02T14:30:00.000Z"
  }
}
```

**Error Response** (404):
```json
{
  "success": false,
  "message": "Career path not found"
}
```

---

### 4️⃣ UPDATE Career Path
- **Method**: `PUT`
- **URL**: `/api/career-paths/:id`
- **Body** (JSON) - All fields optional:
```json
{
  "title": "Updated Engineering Path",
  "level": "Advanced"
}
```

**Success Response** (200):
```json
{
  "success": true,
  "message": "Career path updated successfully",
  "data": {
    "_id": "65a1b2c3d4e5f6g7h8i9j0k1",
    "title": "Updated Engineering Path",
    "ageGroup": "14-16 years",
    "level": "Advanced",
    "careerDirections": ["Mechanical Engineering", "Software Development"],
    "description": "Engineering guide for students",
    "createdAt": "2026-03-02T14:30:00.000Z",
    "updatedAt": "2026-03-02T15:00:00.000Z"
  }
}
```

---

### 5️⃣ DELETE Career Path
- **Method**: `DELETE`
- **URL**: `/api/career-paths/:id`

**Success Response** (200):
```json
{
  "success": true,
  "message": "Career path deleted successfully"
}
```

---

## 🧪 Postman Testing

### Step 1: Create a New Collection
1. Open Postman
2. Click **"New"** → **"Collection"**
3. Name it: **"Career Path API"**

### Step 2: Add Requests

#### ✅ Test 1: CREATE Career Path
1. **New Request** → Name: "Create Career Path"
2. **Method**: `POST`
3. **URL**: `http://localhost:5000/api/career-paths`
4. **Headers**:
   - `Content-Type: application/json`
5. **Body** → **raw** → **JSON**:
```json
{
  "title": "Medical Career Path",
  "ageGroup": "16-18 years",
  "level": "Advanced",
  "careerDirections": ["Doctor", "Nurse", "Pharmacist", "Medical Research"],
  "description": "Complete guide for students aspiring medical careers including MBBS, BDS, and allied health sciences"
}
```
6. Click **"Send"**
7. **Expected**: Status `201 Created`

---

#### ✅ Test 2: GET All Career Paths
1. **New Request** → Name: "Get All Career Paths"
2. **Method**: `GET`
3. **URL**: `http://localhost:5000/api/career-paths`
4. Click **"Send"**
5. **Expected**: Status `200 OK` with array of career paths

---

#### ✅ Test 3: GET Single Career Path
1. **New Request** → Name: "Get Career Path by ID"
2. **Method**: `GET`
3. **URL**: `http://localhost:5000/api/career-paths/{{careerPathId}}`
   - Replace `{{careerPathId}}` with actual ID from previous response
4. Click **"Send"**
5. **Expected**: Status `200 OK` with single career path

---

#### ✅ Test 4: UPDATE Career Path
1. **New Request** → Name: "Update Career Path"
2. **Method**: `PUT`
3. **URL**: `http://localhost:5000/api/career-paths/{{careerPathId}}`
4. **Body** → **raw** → **JSON**:
```json
{
  "level": "Expert",
  "description": "Updated comprehensive medical career guide"
}
```
5. Click **"Send"**
6. **Expected**: Status `200 OK` with updated data

---

#### ✅ Test 5: DELETE Career Path
1. **New Request** → Name: "Delete Career Path"
2. **Method**: `DELETE`
3. **URL**: `http://localhost:5000/api/career-paths/{{careerPathId}}`
4. Click **"Send"**
5. **Expected**: Status `200 OK` with success message

---

## 💻 Frontend Integration

### Option 1: Using Axios (Recommended)

```javascript
import { careerPathService } from '../services/careerPathService'

// CREATE
const handleCreate = async () => {
  const newPath = {
    title: "Engineering Path",
    ageGroup: "14-16 years",
    level: "Intermediate",
    careerDirections: ["Software", "Mechanical", "Civil"],
    description: "Engineering guide"
  }
  
  try {
    const result = await careerPathService.createCareerPath(newPath)
    console.log("Created:", result.data)
  } catch (error) {
    console.error("Error:", error.response?.data)
  }
}

// GET ALL
const fetchAll = async () => {
  const result = await careerPathService.getAllCareerPaths()
  console.log("Career Paths:", result.data)
}

// UPDATE
const handleUpdate = async (id) => {
  const updates = { level: "Advanced" }
  const result = await careerPathService.updateCareerPath(id, updates)
  console.log("Updated:", result.data)
}

// DELETE
const handleDelete = async (id) => {
  await careerPathService.deleteCareerPath(id)
  console.log("Deleted successfully")
}
```

---

### Option 2: Using Fetch API

```javascript
// CREATE
const createCareerPath = async (data) => {
  const response = await fetch('http://localhost:5000/api/career-paths', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data)
  })
  return await response.json()
}

// GET ALL
const getAllCareerPaths = async () => {
  const response = await fetch('http://localhost:5000/api/career-paths')
  return await response.json()
}

// UPDATE
const updateCareerPath = async (id, data) => {
  const response = await fetch(`http://localhost:5000/api/career-paths/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data)
  })
  return await response.json()
}

// DELETE
const deleteCareerPath = async (id) => {
  const response = await fetch(`http://localhost:5000/api/career-paths/${id}`, {
    method: 'DELETE'
  })
  return await response.json()
}
```

---

## ⚠️ Error Handling

### Common Errors

#### 1. 400 Bad Request
**Cause**: Missing required fields or invalid data

**Response**:
```json
{
  "success": false,
  "message": "All fields are required"
}
```

**Solution**: Ensure all fields are provided and valid

---

#### 2. 404 Not Found
**Cause**: Career path with given ID doesn't exist

**Response**:
```json
{
  "success": false,
  "message": "Career path not found"
}
```

**Solution**: Verify the ID exists in database

---

#### 3. 500 Server Error
**Cause**: Database connection issue or server error

**Response**:
```json
{
  "success": false,
  "message": "Failed to create career path",
  "error": "Database connection failed"
}
```

**Solution**: Check MongoDB connection and server logs

---

## 📝 Quick Test Checklist

- [ ] Backend server running on port 5000
- [ ] MongoDB connected successfully
- [ ] POST request creates career path
- [ ] GET request fetches all career paths
- [ ] GET by ID fetches single career path
- [ ] PUT request updates career path
- [ ] DELETE request removes career path
- [ ] Frontend form submits successfully
- [ ] Error handling works properly

---

## 🎯 Sample Data for Testing

```json
{
  "title": "Arts & Humanities Path",
  "ageGroup": "14-18 years",
  "level": "Beginner",
  "careerDirections": ["Journalism", "Creative Writing", "Graphic Design", "Fine Arts"],
  "description": "Explore creative careers in arts, literature, and design fields with comprehensive guidance"
}
```

```json
{
  "title": "Science Research Path",
  "ageGroup": "16-18 years",
  "level": "Advanced",
  "careerDirections": ["Biotechnology", "Chemistry", "Physics Research", "Data Science"],
  "description": "Advanced scientific research opportunities and career pathways for aspiring scientists"
}
```

---

## ✅ Success!

Your Career Path API is now ready to use! 🎉

**Next Steps**:
1. Test all endpoints in Postman
2. Integrate with your React frontend
3. Add authentication (if needed)
4. Deploy to production
