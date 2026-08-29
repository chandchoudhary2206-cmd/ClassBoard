# ClassBoard - Unified Academic & Student Management System

## Overview

**ClassBoard** is a full-stack MERN web application for schools,
colleges, coaching institutes, and training centers. It provides a
centralized platform where administrators, teachers, and students can
manage academic activities, study materials, assignments, attendance,
announcements, and classroom communication.

This project is intended as an **Industrial Training** project and
should follow production-quality software engineering practices.

------------------------------------------------------------------------

# Constraints

-   No AI features
-   No email verification or email notifications
-   MongoDB as the only database
-   Store uploaded files locally in the backend `uploads/` directory
-   Use REST APIs
-   JWT Authentication
-   Responsive UI

------------------------------------------------------------------------

# Technology Stack

## Frontend

-   React.js
-   Tailwind CSS
-   React Router
-   Axios

## Backend

-   Node.js
-   Express.js
-   JWT Authentication
-   bcrypt
-   Multer

## Database

-   MongoDB

## File Storage

Store uploaded files locally.

    server/
    └── uploads/
        ├── profile-images/
        ├── study-materials/
        ├── assignments/
        ├── submissions/
        ├── announcements/

Store only metadata in MongoDB.

------------------------------------------------------------------------

# User Roles

## Admin

-   Dashboard
-   Manage Teachers
-   Manage Students
-   Manage Departments
-   Manage Courses
-   Manage Subjects
-   Manage Academic Years
-   Manage Semesters
-   Manage Sections
-   Create Classes
-   Assign Teachers
-   Enroll Students
-   Manage Timetable
-   Manage Study Materials
-   Manage Announcements
-   View Reports
-   System Settings

## Teacher

-   Dashboard
-   Assigned Classes
-   Upload Study Materials
-   Create Assignments
-   View Submissions
-   Grade Assignments
-   Take Attendance
-   Post Announcements
-   Calendar

## Student

-   Dashboard
-   View Assigned Classes
-   Download Study Materials
-   Submit Assignments
-   View Attendance
-   View Timetable
-   View Announcements
-   View Grades
-   Update Profile

Students cannot manually join or leave classes.

------------------------------------------------------------------------

# Academic Hierarchy

Department → Course → Academic Year → Semester → Section

Example:

B.Tech → Computer Science → Semester 5 → Section A

The administrator assigns: - Subjects - Teachers - Students

ClassBoard automatically creates subject classrooms and enrolls every
student in the section.

------------------------------------------------------------------------

# Core Modules

-   Authentication
-   User Management
-   Student Management
-   Teacher Management
-   Department Management
-   Course Management
-   Subject Management
-   Academic Structure
-   Class Management
-   Study Materials
-   Assignments
-   Attendance
-   Announcements
-   Timetable
-   Reports
-   Dashboard
-   Settings

------------------------------------------------------------------------

# Functional Requirements

FR1 Authentication

FR2 Role-Based Authorization

FR3 Student Management

FR4 Teacher Management

FR5 Academic Structure Management

FR6 Subject Management

FR7 Class Management

FR8 Automatic Student Enrollment

FR9 Study Material Upload

FR10 Assignment Management

FR11 Assignment Submission

FR12 Attendance Management

FR13 Announcement Management

FR14 Timetable

FR15 Reports

FR16 Dashboard

FR17 Search & Filters

FR18 File Upload

FR19 Profile Management

FR20 Administration

------------------------------------------------------------------------

# Non-Functional Requirements

-   JWT Authentication
-   Password Hashing
-   Responsive Design
-   REST API
-   MVC Architecture
-   MongoDB
-   Secure Local File Storage
-   Average Response Time \< 2 Seconds

------------------------------------------------------------------------

# Database Collections

-   Users
-   Students
-   Teachers
-   Departments
-   Courses
-   Subjects
-   AcademicYears
-   Semesters
-   Sections
-   Classes
-   Enrollments
-   StudyMaterials
-   Assignments
-   Submissions
-   Attendance
-   Announcements
-   Timetable
-   ActivityLogs

------------------------------------------------------------------------

# Recommended Folder Structure

    client/
      src/
        components/
        pages/
        layouts/
        hooks/
        services/
        context/

    server/
      controllers/
      models/
      routes/
      middleware/
      config/
      uploads/
      utils/
      app.js

------------------------------------------------------------------------

# Deliverables

1.  IEEE SRS (40--60 Pages)
2.  Software Design Document
3.  ER Diagram
4.  Use Case Diagram
5.  Class Diagram
6.  Activity Diagram
7.  Sequence Diagram
8.  DFD Level 0 & 1
9.  Database Schema
10. REST API Documentation
11. API Collection
12. UI Wireframes
13. Admin Dashboard
14. Teacher Dashboard
15. Student Dashboard
16. Testing Strategy
17. Deployment Guide
18. Future Scope

------------------------------------------------------------------------

# UI Guidelines

-   Light Theme
-   Modern Dashboard
-   Professional Design
-   Responsive Layout
-   Rounded Cards
-   Soft Shadows
-   Blue Primary
-   Emerald Accent

------------------------------------------------------------------------

# Goal

Build a production-ready academic management platform using React.js,
Node.js, Express.js, MongoDB, JWT Authentication, Multer, and local file
storage.
