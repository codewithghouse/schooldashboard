# School–Parent Academic Visibility Platform

**Current Status: STEP 2 COMPLETE** (MVP Ready)

## Features Live

### 1. Unified Authentication
- **Role Detection**: Auto-redirects users to `/school`, `/teacher`, or `/parent` based on Firestore `users` collection.
- **Onboarding Flow**: 
  - School Admin: redirected to `/school-onboarding` if school not created.
  - Teachers/Parents: Auto-detected via email matching (`teachers` or `students` lists) and user profile created.

### 2. School Admin Dashboard
- **Register School**: One-time setup.
- **Manage Classes**: Add classes/sections.
- **Manage Teachers**: Invite teachers by email (creates `teachers` doc).
- **Manage Students**: 
  - Manual Add.
  - **Excel Import**: Bulk upload students using `.xlsx` parsing. linking to `classes`.
- **Syllabus**: Upload PDF to Cloudinary, map to chapters.

### 3. Teacher Dashboard
- **My Classes**: Auto-filters classes assigned to current teacher (MVP: shows all if not restricted, but logic in place).
- **Weekly Updates**: Log chapter progress, homework %, student status (Good/Average/Needs Attention).
- **Test Results**:
  - Create Test (Subject, Date, Chapters).
  - Bulk Entry of Marks.
  - Tag Weak Areas per student.

### 4. Parent Dashboard
- **Child View**: Auto-fetches linked students.
- **Progress Tracking**: 
  - View Exam Results + Weak Topics highlights.
  - View Weekly Updates + Teacher Notes.

## Firestore Model Implemented
- `schools`, `users`, `classes`, `teachers`, `students`, `syllabus`, `weeklyUpdates`, `tests`, `results`.

## Setup
1. **Env Vars**:
   - Firebase config.
   - Cloudinary config (`VITE_CLOUDINARY_CLOUD_NAME`, `VITE_CLOUDINARY_UPLOAD_PRESET`).
2. **Commands**:
   ```bash
   npm install
   npm run dev
   ```
