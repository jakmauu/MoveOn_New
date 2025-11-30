# 📋 MoveOn - Coach Features Documentation

## 🎯 Ringkasan Fitur Coach

Aplikasi web MoveOn telah dilengkapi dengan fitur lengkap untuk coach dalam mengelola trainees dan memberikan program latihan yang terstruktur. Berikut adalah daftar fitur yang telah diimplementasikan:

---

## ✨ Fitur Utama Coach

### 1. **Coach Dashboard** (`/coach/dashboard`)
Dashboard utama yang menampilkan overview lengkap aktivitas coach dan trainees.

**Komponen:**
- **KPI Cards (4 kartu statistik):**
  - Total Trainees (👥) - Jumlah trainee total dengan status active
  - Active Tasks (📋) - Total tugas yang sedang aktif
  - Total Hours Trained (⏱️) - Jam latihan kumulatif semua trainee
  - Notifications (🔔) - Notifikasi yang belum dibaca

- **Notifications Panel:**
  - Menampilkan update terbaru dari trainees
  - Tipe notifikasi: completion (✅), upcoming (⏰), inactive (⚠️)
  - Mark as read functionality
  - Tampilkan rating dari trainee yang menyelesaikan task

- **Trainees Overview Section:**
  - Filter berdasarkan status (All, Active, Inactive)
  - Daftar trainee dengan avatar, nama, email
  - Statistik quick view: workouts, streak, rating
  - Click untuk melihat detail trainee

- **Quick Actions (4 tombol):**
  - 📊 View Statistics → `/coach/trainees`
  - 📋 Manage Tasks → `/coach/tasks`
  - ➕ Create Task → `/coach/assign-task`
  - 📈 Progress Report → Dashboard (extensible)

**Teknologi:**
- React Hooks (useState)
- React Router (NavLink)
- Tailwind CSS untuk styling
- Mock data dari mockCoachData.js

---

### 2. **Coach Trainees Page** (`/coach/trainees`)
Halaman untuk melihat dan mengelola semua trainees dengan filtering dan view mode berbeda.

**Komponen:**
- **Search Bar:**
  - Pencarian real-time berdasarkan nama atau email trainee

- **Filter & View Toggle:**
  - Status filter: All, Active, Inactive dengan count
  - View mode toggle: Grid (default) atau List

- **Grid View:**
  - Card untuk setiap trainee
  - Menampilkan: avatar, nama, email, status badge
  - Statistik inline: Workouts, Hours, Streak (🔥), Rating (⭐)
  - Total Calories burned dengan gradient background
  - Join date di footer
  - Button "View Details" yang responsive

- **List View:**
  - Responsive table design
  - Kolom: Trainee, Workouts, Hours, Streak, Rating
  - Mobile-friendly dengan label teks
  - Click row untuk detail

- **Summary Statistics:**
  - Total Trainees, Avg Workouts, Total Hours, Avg Rating
  - Dengan warna-warna berbeda untuk setiap metrik

**Fitur Interaktif:**
- Sorting otomatis berdasarkan streak dan completed workouts
- Responsive design untuk mobile, tablet, desktop
- Hover effects pada cards/rows

---

### 3. **Trainee Detail Page** (`/coach/trainee/:id`)
Halaman detail untuk melihat statistik mendalam seorang trainee.

**Komponen:**
- **Header Section:**
  - Avatar besar dengan nama trainee
  - Email dan status badge (🟢 Active / ⚪ Inactive)
  - Join date badge
  - Close button (×)

- **Stats Overview Grid:**
  - 5 kartu statistik: Workouts Completed, Total Hours, Calories Burned, Avg Rating, Current Streak
  - Masing-masing dengan icon dan warna berbeda

- **Tabbed Content:**
  - **Overview Tab (📊):**
    - Performance Summary dengan 3 progress bar:
      - Completion Rate (completion rate %)
      - Consistency Score (based on streak)
      - Quality Score (based on average rating)
    - Quick Actions Panel: Send Message, Assign Task, View Report, Settings

  - **Recent Activities Tab (⏱️):**
    - List workout history
    - Info: tanggal, nama workout, durasi, kalori
    - Responsive layout

  - **Assigned Tasks Tab (📋):**
    - Daftar task yang di-assign ke trainee ini
    - Info: title, difficulty badge, due date, description
    - Exercise count dan duration

---

### 4. **Assign Task Wizard** (`/coach/assign-task`)
Multi-step form wizard untuk membuat dan assign task kepada trainees.

**Step-by-Step Flow:**

**Step 1: Choose Template (or Custom)**
- 5 workout templates dengan icon:
  - 💪 Strength Training (60 min)
  - 🏃 Cardio Session (45 min)
  - ⚡ HIIT Training (30 min)
  - 🧘 Flexibility & Yoga (40 min)
  - 🎯 Core Workout (35 min)
- Option untuk membuat custom title
- Interactive template selection dengan border highlight

**Step 2: Task Details**
- Task Title input (required)
- Description textarea
- Duration input (10-180 min)
- Difficulty level select (Beginner/Intermediate/Advanced)
- Due Date input (required)
- Additional Notes textarea

**Step 3: Add Exercises**
- Form untuk menambah exercise:
  - Exercise Name (required)
  - Sets, Reps
  - Duration, Intensity
- List view dari exercises yang sudah ditambah
- Delete button untuk setiap exercise
- Counter total exercises

**Step 4: Select Trainees**
- Checkbox untuk memilih trainees
- Info setiap trainee: avatar, nama, email, status, rating
- Selected counter badge (✅ X trainees selected)
- Task summary section dengan recap semua info

**UI Features:**
- Progress indicator (4 steps)
- Previous/Next buttons
- Cancel button
- Submit button (Assign Task) di step terakhir
- Form validation

---

### 5. **Manage Tasks Page** (`/coach/tasks`)
Halaman untuk melihat, mengedit, dan menghapus semua tasks.

**Komponen:**
- **Search & Filter:**
  - Search bar untuk task title/description
  - Filter by difficulty (All/Beginner/Intermediate/Advanced)
  - Sort by (Most Recent/Due Date/Difficulty)

- **Task Cards (Grid Layout):**
  - Setiap task dalam card dengan info:
    - Title dengan difficulty badge dan status badge
    - Description
    - Quick stats grid: Duration, Exercises count, Assigned to count, Created date
    - Trainees assigned (names list)
    - Exercises preview (3 first exercises + "more")
    - Action buttons: Edit, View Submissions, Delete (🗑️)

- **Empty State:**
  - Jika tidak ada task: tampilkan pesan dengan button create new task

- **Statistics Footer:**
  - Total Tasks, Active Tasks, Total Trainees Assigned
  - Dengan warna dan icon berbeda

---

### 6. **Updated Navigation**
Navbar App.jsx telah diupdate untuk show-hide menu sesuai user role.

**Conditional Navigation:**
- **Jika role = 'coach':**
  - Dashboard
  - Trainees
  - Tasks
  - Logout

- **Jika role = 'trainee' atau belum login:**
  - Home
  - Features
  - Chat
  - About
  - Contact
  - Login/Register buttons

---

## 🗂️ Struktur File

```
src/
├── pages/
│   ├── CoachDashboard.jsx           # Main dashboard
│   ├── CoachTraineesPage.jsx        # Trainees list & view
│   ├── CoachTraineeDetail.jsx       # Individual trainee detail
│   ├── CoachAssignTask.jsx          # Task creation wizard
│   ├── CoachTasks.jsx               # Task management
│   ├── Login.jsx                    # Updated dengan role selection
│   └── ...
├── data/
│   └── mockCoachData.js             # Mock data untuk semua fitur coach
├── context/
│   └── AuthContext.jsx              # Auth context (sudah ada)
├── App.jsx                          # Updated dengan role-based routing
└── main.jsx                         # Updated dengan semua routes

```

---

## 🎨 Design System

### Color Scheme
- **Primary (Dark Blue):** `#001a3d` - Background utama
- **Secondary (Darker Blue):** `#002451` - Secondary background
- **Accent (Yellow):** `#fdbf00` - Primary CTA & highlights
- **Success (Green):** `#10b981` - Positive states
- **Warning (Red):** `#ef4444` - Alerts & notifications
- **Info (Blue):** `#3b82f6` - Information

### Typography
- Headings: Bold font weight, larger sizes
- Body: Regular weight, 14px-16px
- Labels: Small, semi-bold

### Spacing & Layout
- Max-width container: 80rem (1280px)
- Grid gaps: 4-8px (responsive)
- Padding: 6-16px (responsive)
- Responsive breakpoints: sm (640px), md (768px), lg (1024px)

---

## 📊 Mock Data Structure

### mockTrainees
- 4 trainee samples dengan data lengkap
- Setiap trainee punya: id, name, email, status, avatar, stats, recentActivities

### mockTasks
- 4 task templates dengan exercises detail
- Setiap task punya: id, title, description, duration, difficulty, exercises, dueDate, assignedTo, status

### workoutTemplates
- 5 template predefined untuk quick task creation

### taskNotifications
- 3 sample notifikasi dengan berbagai type

---

## 🚀 Cara Menggunakan

### Login sebagai Coach
1. Buka halaman `/login`
2. Masukkan email apapun
3. Pilih role: **Coach**
4. Klik "Log In"
5. Otomatis redirect ke `/coach/dashboard`

### Navigasi
- **Dashboard:** Lihat overview dan notifikasi
- **Trainees:** Lihat semua trainee dan filter
- **Trainee Detail:** Klik trainee untuk lihat detail & progress
- **Create Task:** Assign tugas dengan wizard
- **Manage Tasks:** Edit/delete/view task submissions

---

## 🔄 Integrasi Backend (Future)

Untuk production, replace mock data dengan API calls ke:
- `GET /api/trainees` - Ambil daftar trainee
- `GET /api/trainees/:id` - Detail trainee
- `GET /api/tasks` - Daftar task
- `POST /api/tasks` - Buat task baru
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Hapus task
- `POST /api/notifications` - Get notifications
- `PATCH /api/notifications/:id` - Mark as read

---

## ✅ Checklist Fitur

- ✅ Coach Dashboard dengan KPI cards
- ✅ Notifications system dengan mark as read
- ✅ Trainees listing dengan grid/list view
- ✅ Trainee detail dengan tabs (overview, activities, tasks)
- ✅ Assign Task wizard (4 steps)
- ✅ Task management page dengan search/filter
- ✅ Mock data untuk semua fitur
- ✅ Role-based navigation
- ✅ Responsive design (mobile, tablet, desktop)
- ✅ Interactive UI dengan hover effects
- ✅ Form validation & error handling

---

## 🎯 Next Steps

1. **Backend Integration:** Hubungkan dengan backend API
2. **Authentication:** Implement JWT token untuk session management
3. **Real-time Updates:** Tambahkan WebSocket untuk notifikasi real-time
4. **Analytics:** Tambahkan chart library untuk detailed analytics
5. **Export Data:** Export task assignments, reports to PDF/Excel
6. **Mobile App:** Develop mobile app menggunakan React Native

---

## 📝 Notes

- Semua data saat ini menggunakan mock data dari `mockCoachData.js`
- Login masih menggunakan in-memory auth (tidak connected ke database)
- File styling menggunakan Tailwind CSS utility classes
- Project sudah responsive dan mobile-friendly
- Semua komponen siap untuk di-integrate dengan backend API

---

**Version:** 1.0.0  
**Last Updated:** 28 Oktober 2024  
**Status:** ✅ Complete & Ready for Testing

