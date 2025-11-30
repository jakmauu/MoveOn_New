# 👥 Add Trainee Flow - Coach Feature Documentation

## 📋 Skenario & Flow

### **Pertanyaan Utama:**
> "Bagaimana cara coach menambahkan trainee? Apakah trainee harus sudah terdaftar di database terlebih dahulu?"

**Jawaban: YA, trainee HARUS sudah terdaftar (register) di database terlebih dahulu!**

---

## 🔄 Alur Sistem Add Trainee

### **Flow Diagram:**

```
┌─────────────────────────────────────────────────────────────┐
│                    SISTEM ADD TRAINEE                       │
└─────────────────────────────────────────────────────────────┘

1️⃣  TRAINEE REGISTER
    ↓
    Trainee membuat akun sendiri (Register page)
    ↓
    Data tersimpan di database: users (role: "trainee")
    ↓

2️⃣  COACH LOGIN
    ↓
    Coach login ke dashboard
    ↓

3️⃣  COACH ADD TRAINEE
    ↓
    Coach buka halaman "Add Trainee"
    ↓
    Sistem FETCH semua user dengan role "trainee" dari database
    ↓
    Coach melihat list trainee yang tersedia (sudah register)
    ↓
    Coach pilih trainee yang ingin di-add
    ↓

4️⃣  ESTABLISH CONNECTION
    ↓
    Sistem CREATE relationship: coach_id ←→ trainee_id
    ↓
    Data tersimpan di database: coach_trainees (pivot/junction table)
    ↓

5️⃣  TRAINEE MELIHAT COACH
    ↓
    Trainee masuk ke dashboard
    ↓
    Trainee bisa melihat mereka sudah terikat dengan coach ini
    ↓
    Trainee bisa melihat task/tugas dari coach ini
    ↓
```

---

## 🏗️ Database Schema (Backend)

### **Tabel: users**
```sql
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('coach', 'trainee') NOT NULL,
    avatar VARCHAR(100),
    status ENUM('active', 'inactive') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### **Tabel: coach_trainees (Relationship/Pivot Table)**
```sql
CREATE TABLE coach_trainees (
    id INT PRIMARY KEY AUTO_INCREMENT,
    coach_id INT NOT NULL,
    trainee_id INT NOT NULL,
    status ENUM('pending', 'accepted', 'active', 'inactive') DEFAULT 'active',
    assigned_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (coach_id) REFERENCES users(id),
    FOREIGN KEY (trainee_id) REFERENCES users(id),
    UNIQUE KEY unique_coach_trainee (coach_id, trainee_id)
);
```

### **Tabel: tasks**
```sql
CREATE TABLE tasks (
    id INT PRIMARY KEY AUTO_INCREMENT,
    coach_id INT NOT NULL,
    title VARCHAR(150) NOT NULL,
    description TEXT,
    exercises JSON,
    difficulty ENUM('Beginner', 'Intermediate', 'Advanced'),
    duration INT, -- minutes
    due_date DATE,
    status ENUM('draft', 'published', 'completed') DEFAULT 'draft',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (coach_id) REFERENCES users(id)
);
```

### **Tabel: task_assignments**
```sql
CREATE TABLE task_assignments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    task_id INT NOT NULL,
    trainee_id INT NOT NULL,
    coach_id INT NOT NULL,
    status ENUM('assigned', 'in_progress', 'completed') DEFAULT 'assigned',
    assigned_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_date TIMESTAMP NULL,
    FOREIGN KEY (task_id) REFERENCES tasks(id),
    FOREIGN KEY (trainee_id) REFERENCES users(id),
    FOREIGN KEY (coach_id) REFERENCES users(id)
);
```

---

## 🎨 UI/UX: Add Trainee Page

### **Page Structure:**

```
┌──────────────────────────────────────────────────────────────┐
│  MoveOn                                  Coach Dashboard ▼   │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│  + Add New Trainee                                   [Search] │
│  ✓ 3 trainees already added                                  │
│                                                               │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│  Available Trainees                                          │
│  (Showing 8 trainees ready to add)                           │
│                                                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │   👤 Trainee 1   │  │   👤 Trainee 2   │  │   👤 Trainee 3   │   │
│  │ email@ex.com │  │ email@ex.com │  │ email@ex.com │       │
│  │              │  │              │  │              │       │
│  │ [+ ADD]      │  │ [+ ADD]      │  │ [+ ADD]      │       │
│  └──────────────┘  └──────────────┘  └──────────────┘       │
│                                                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │   👤 Trainee 4   │  │   👤 Trainee 5   │  │   👤 Trainee 6   │   │
│  │ email@ex.com │  │ email@ex.com │  │ email@ex.com │       │
│  │              │  │              │  │              │       │
│  │ [+ ADD]      │  │ [+ ADD]      │  │ [+ ADD]      │       │
│  └──────────────┘  └──────────────┘  └──────────────┘       │
│                                                               │
└──────────────────────────────────────────────────────────────┘
```

---

## 💻 Frontend Code Examples

### **1. New Component: CoachAddTraineesPage.jsx**

```jsx
import React, { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import axios from 'axios'

export default function CoachAddTraineesPage() {
  const { user } = useAuth()
  const [availableTrainees, setAvailableTrainees] = useState([])
  const [addedTrainees, setAddedTrainees] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    // Fetch available trainees (yang sudah register tapi belum di-add ke coach ini)
    fetchAvailableTrainees()
    fetchAddedTrainees()
  }, [])

  const fetchAvailableTrainees = async () => {
    try {
      // GET request ke backend untuk ambil semua trainee yang available
      const response = await axios.get(
        `/api/coach/${user.id}/available-trainees`,
        {
          headers: { Authorization: `Bearer ${user.token}` }
        }
      )
      setAvailableTrainees(response.data)
      setLoading(false)
    } catch (error) {
      console.error('Error fetching trainees:', error)
      setLoading(false)
    }
  }

  const fetchAddedTrainees = async () => {
    try {
      // GET request ke backend untuk ambil trainees yang sudah di-add
      const response = await axios.get(
        `/api/coach/${user.id}/trainees`,
        {
          headers: { Authorization: `Bearer ${user.token}` }
        }
      )
      setAddedTrainees(response.data)
    } catch (error) {
      console.error('Error fetching added trainees:', error)
    }
  }

  const handleAddTrainee = async (traineeId) => {
    try {
      // POST request ke backend untuk add trainee ke coach
      const response = await axios.post(
        `/api/coach/${user.id}/add-trainee`,
        { traineeId },
        {
          headers: { Authorization: `Bearer ${user.token}` }
        }
      )

      if (response.status === 201) {
        // Trainee berhasil di-add
        // Update UI: pindahkan dari available ke added
        const trainee = availableTrainees.find(t => t.id === traineeId)
        setAvailableTrainees(availableTrainees.filter(t => t.id !== traineeId))
        setAddedTrainees([...addedTrainees, trainee])

        // Show success notification
        alert(`✅ ${trainee.name} berhasil ditambahkan!`)
      }
    } catch (error) {
      console.error('Error adding trainee:', error)
      alert('❌ Gagal menambahkan trainee')
    }
  }

  const handleRemoveTrainee = async (traineeId) => {
    try {
      // DELETE request ke backend untuk remove trainee dari coach
      const response = await axios.delete(
        `/api/coach/${user.id}/remove-trainee/${traineeId}`,
        {
          headers: { Authorization: `Bearer ${user.token}` }
        }
      )

      if (response.status === 200) {
        // Trainee berhasil di-remove
        // Update UI
        const trainee = addedTrainees.find(t => t.id === traineeId)
        setAddedTrainees(addedTrainees.filter(t => t.id !== traineeId))
        setAvailableTrainees([...availableTrainees, trainee])

        alert(`✅ ${trainee.name} berhasil dihapus!`)
      }
    } catch (error) {
      console.error('Error removing trainee:', error)
      alert('❌ Gagal menghapus trainee')
    }
  }

  const filteredAvailable = availableTrainees.filter(t =>
    t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-[#001a3d] flex items-center justify-center">
        <p className="text-white text-xl">Loading trainees...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#001a3d] to-[#002451] text-white pb-20">
      {/* Header */}
      <div className="px-6 md:px-16 py-8 border-b border-white/10">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold text-yellow-400 mb-2">
            👥 Add Trainees
          </h1>
          <p className="text-white/70">
            Connect with trainees who have registered. You have {addedTrainees.length} active
            trainees.
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="px-6 md:px-16 py-10">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Your Trainees Section */}
          {addedTrainees.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold text-white mb-4">
                ✅ Your Active Trainees ({addedTrainees.length})
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {addedTrainees.map(trainee => (
                  <div
                    key={trainee.id}
                    className="bg-[#002451] rounded-lg border border-green-400/30 p-5"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="text-4xl">{trainee.avatar || '👤'}</div>
                      <span className="bg-green-400/20 text-green-300 text-xs px-2 py-1 rounded-full">
                        Connected
                      </span>
                    </div>
                    <h3 className="font-semibold text-white mb-1">{trainee.name}</h3>
                    <p className="text-sm text-white/60 mb-4">{trainee.email}</p>
                    <button
                      onClick={() => handleRemoveTrainee(trainee.id)}
                      className="w-full bg-red-500/20 hover:bg-red-500/30 text-red-300 py-2 rounded-lg transition text-sm font-medium"
                    >
                      🗑️ Disconnect
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Search Available Trainees */}
          <div>
            <h2 className="text-2xl font-bold text-white mb-4">
              🔍 Available Trainees to Add ({filteredAvailable.length})
            </h2>

            {/* Search Bar */}
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-[#002451] border border-white/10 focus:border-yellow-400 outline-none text-white placeholder-white/40 mb-6 transition"
            />

            {/* Available Trainees */}
            {filteredAvailable.length === 0 ? (
              <div className="bg-[#002451] rounded-lg border border-white/10 p-12 text-center">
                <p className="text-2xl mb-2">🎯 All set!</p>
                <p className="text-white/60">
                  No more trainees available to add or your search found nothing
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {filteredAvailable.map(trainee => (
                  <div
                    key={trainee.id}
                    className="bg-[#002451] rounded-lg border border-white/10 hover:border-yellow-400/50 transition p-5 flex flex-col"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="text-4xl">{trainee.avatar || '👤'}</div>
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                        trainee.status === 'active'
                          ? 'bg-green-400/20 text-green-300'
                          : 'bg-gray-400/20 text-gray-300'
                      }`}>
                        {trainee.status === 'active' ? '🟢 Active' : '⚪ Offline'}
                      </span>
                    </div>

                    <h3 className="font-semibold text-white mb-1">{trainee.name}</h3>
                    <p className="text-sm text-white/60 mb-4">{trainee.email}</p>

                    {/* Trainee Quick Info */}
                    <div className="bg-[#001f47] rounded p-3 mb-4 text-xs space-y-2">
                      <div className="flex justify-between">
                        <span className="text-white/60">Experience:</span>
                        <span className="text-yellow-400 font-bold">
                          {trainee.experience || 'Beginner'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/60">Member Since:</span>
                        <span className="text-blue-400 font-bold">
                          {new Date(trainee.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleAddTrainee(trainee.id)}
                      className="w-full bg-yellow-400 hover:bg-yellow-300 text-[#001a3d] py-2 rounded-lg transition font-semibold"
                    >
                      ➕ Add Trainee
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
```

---

## 🔌 Backend API Endpoints

### **1. GET /api/coach/:coachId/available-trainees**
**Purpose:** Ambil list semua trainee yang sudah register tapi belum di-add ke coach ini

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 5,
      "name": "Adi Pratama",
      "email": "adi@example.com",
      "avatar": "👨",
      "status": "active",
      "experience": "Intermediate",
      "createdAt": "2024-10-20T10:00:00Z"
    },
    {
      "id": 6,
      "name": "Sinta Kusuma",
      "email": "sinta@example.com",
      "avatar": "👩",
      "status": "active",
      "experience": "Beginner",
      "createdAt": "2024-10-18T15:30:00Z"
    }
  ]
}
```

---

### **2. GET /api/coach/:coachId/trainees**
**Purpose:** Ambil list trainees yang sudah di-add ke coach ini

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Budi Santoso",
      "email": "budi@example.com",
      "avatar": "👨",
      "status": "active",
      "stats": {
        "workoutsCompleted": 12,
        "totalHours": 24,
        "caloriesBurned": 5200,
        "averageRating": 4.5,
        "streak": 5
      },
      "connectedSince": "2024-09-15T08:00:00Z"
    }
  ]
}
```

---

### **3. POST /api/coach/:coachId/add-trainee**
**Purpose:** Add trainee ke coach (buat relationship baru)

**Request Body:**
```json
{
  "traineeId": 5
}
```

**Response:**
```json
{
  "success": true,
  "message": "Trainee berhasil ditambahkan",
  "data": {
    "coachTraineeId": 15,
    "coachId": 1,
    "traineeId": 5,
    "status": "active",
    "assignedDate": "2024-10-28T10:30:00Z"
  }
}
```

---

### **4. DELETE /api/coach/:coachId/remove-trainee/:traineeId**
**Purpose:** Disconnect/remove trainee dari coach

**Response:**
```json
{
  "success": true,
  "message": "Trainee berhasil dihapus",
  "data": {
    "removed": true,
    "traineeId": 5
  }
}
```

---

## 🖥️ Backend Implementation (Node.js/Express Example)

### **1. Routes Configuration**
```javascript
// routes/coach.js
const express = require('express')
const router = express.Router()
const { authenticateToken } = require('../middleware/auth')

// Get available trainees
router.get('/:coachId/available-trainees', authenticateToken, async (req, res) => {
  const { coachId } = req.params

  try {
    // Query: semua trainee (role='trainee') yang TIDAK di-add oleh coach ini
    const query = `
      SELECT u.id, u.name, u.email, u.avatar, u.status, 
             u.experience, u.created_at as createdAt
      FROM users u
      WHERE u.role = 'trainee'
      AND u.id NOT IN (
        SELECT trainee_id FROM coach_trainees 
        WHERE coach_id = ?
      )
      ORDER BY u.created_at DESC
    `

    const availableTrainees = await db.query(query, [coachId])
    res.json({ success: true, data: availableTrainees })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
})

// Get added trainees
router.get('/:coachId/trainees', authenticateToken, async (req, res) => {
  const { coachId } = req.params

  try {
    const query = `
      SELECT u.id, u.name, u.email, u.avatar, u.status,
             ct.assigned_date as connectedSince
      FROM users u
      INNER JOIN coach_trainees ct ON u.id = ct.trainee_id
      WHERE ct.coach_id = ? AND ct.status = 'active'
      ORDER BY ct.assigned_date DESC
    `

    const trainees = await db.query(query, [coachId])
    
    // Ambil stats untuk setiap trainee
    const traineesWithStats = await Promise.all(
      trainees.map(async (trainee) => {
        const statsQuery = `
          SELECT 
            COUNT(DISTINCT ta.id) as workoutsCompleted,
            COALESCE(SUM(t.duration), 0) / 60 as totalHours,
            COALESCE(SUM(ts.calories_burned), 0) as caloriesBurned,
            COALESCE(AVG(ts.rating), 0) as averageRating,
            COALESCE(MAX(ts.streak), 0) as streak
          FROM task_assignments ta
          LEFT JOIN tasks t ON ta.task_id = t.id
          LEFT JOIN trainee_submissions ts ON ta.id = ts.assignment_id
          WHERE ta.trainee_id = ? AND ta.status = 'completed'
        `
        const [stats] = await db.query(statsQuery, [trainee.id])
        return { ...trainee, stats }
      })
    )

    res.json({ success: true, data: traineesWithStats })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
})

// Add trainee to coach
router.post('/:coachId/add-trainee', authenticateToken, async (req, res) => {
  const { coachId } = req.params
  const { traineeId } = req.body

  try {
    // Check if trainee exists
    const traineeExists = await db.query(
      'SELECT id FROM users WHERE id = ? AND role = ?',
      [traineeId, 'trainee']
    )

    if (!traineeExists.length) {
      return res.status(404).json({
        success: false,
        error: 'Trainee tidak ditemukan'
      })
    }

    // Check if already connected
    const alreadyConnected = await db.query(
      'SELECT id FROM coach_trainees WHERE coach_id = ? AND trainee_id = ?',
      [coachId, traineeId]
    )

    if (alreadyConnected.length) {
      return res.status(400).json({
        success: false,
        error: 'Trainee sudah terhubung dengan coach ini'
      })
    }

    // Insert new relationship
    const result = await db.query(
      'INSERT INTO coach_trainees (coach_id, trainee_id, status, assigned_date) VALUES (?, ?, ?, NOW())',
      [coachId, traineeId, 'active']
    )

    res.status(201).json({
      success: true,
      message: 'Trainee berhasil ditambahkan',
      data: {
        coachTraineeId: result.insertId,
        coachId,
        traineeId,
        status: 'active'
      }
    })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
})

// Remove trainee from coach
router.delete('/:coachId/remove-trainee/:traineeId', authenticateToken, async (req, res) => {
  const { coachId, traineeId } = req.params

  try {
    const result = await db.query(
      'DELETE FROM coach_trainees WHERE coach_id = ? AND trainee_id = ?',
      [coachId, traineeId]
    )

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        error: 'Koneksi tidak ditemukan'
      })
    }

    res.json({
      success: true,
      message: 'Trainee berhasil dihapus',
      data: { removed: true, traineeId }
    })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
})

module.exports = router
```

---

## 📱 Integration Steps

### **Step 1: Add Route ke App.jsx**
```jsx
import CoachAddTraineesPage from './pages/CoachAddTraineesPage'

// Di dalam route config
{
  path: '/coach/add-trainees',
  element: <CoachAddTraineesPage />
}
```

### **Step 2: Add Navigation Button**
Di CoachDashboard.jsx atau navbar, tambahkan button:
```jsx
<NavLink to="/coach/add-trainees" className="...">
  👥 Add Trainees
</NavLink>
```

### **Step 3: Update Backend**
- Setup endpoint di server untuk fetch available trainees
- Implement POST endpoint untuk add trainee
- Implement DELETE endpoint untuk remove trainee

---

## ⚖️ Keuntungan & Pertimbangan

### **Keuntungan System Ini:**
✅ Trainee control atas data mereka sendiri (self-registration)  
✅ Coach dapat memilih trainee yang ingin dikelola  
✅ Menghindari coach menambah trainee tanpa persetujuan mereka  
✅ Fleksibel - satu trainee bisa punya banyak coach  
✅ Easy disconnect jika hubungan berakhir

### **Pertimbangan:**
⚠️ Trainee HARUS register dulu sebelum bisa di-add  
⚠️ Perlu mekanisme approval/request jika ingin membuat lebih formal  
⚠️ Keamanan: Pastikan setiap endpoint di-protect dengan auth  

---

## 🔐 Alternatif Flow (Optional)

### **Jika ingin sistem "Request & Accept":**

```
1. Coach SENDS REQUEST ke trainee
   ↓
2. Trainee MENERIMA NOTIFIKASI
   ↓
3. Trainee ACCEPT / DECLINE request
   ↓
4. Jika ACCEPT → Relationship di-create
   ↓
5. Coach bisa assign task
```

**Database tambahan:**
```sql
CREATE TABLE coach_requests (
    id INT PRIMARY KEY AUTO_INCREMENT,
    coach_id INT NOT NULL,
    trainee_id INT NOT NULL,
    status ENUM('pending', 'accepted', 'rejected') DEFAULT 'pending',
    sent_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    responded_date TIMESTAMP NULL,
    FOREIGN KEY (coach_id) REFERENCES users(id),
    FOREIGN KEY (trainee_id) REFERENCES users(id)
);
```

---

## 📝 Summary

| Aspek | Detail |
|-------|--------|
| **Trainee Requirement** | ✅ HARUS sudah register di database |
| **Coach Action** | Membuka halaman "Add Trainees" |
| **Available Trainees** | Semua user dengan role='trainee' yang belum connected |
| **Database Operation** | INSERT ke tabel `coach_trainees` |
| **API Endpoints** | GET available, GET added, POST add, DELETE remove |
| **Relationship Type** | Many-to-Many (1 coach bisa punya banyak trainee) |
| **Status Options** | pending / active / inactive |

---

Jadi kesimpulannya: **YA, Trainee HARUS sudah register terlebih dahulu!** 🎯

Apakah ada pertanyaan lebih lanjut tentang flow ini? 🤔
