import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { MainLayout } from '../layouts/MainLayout.js';
import { AdminLayout } from '../layouts/AdminLayout.js';
import { ProtectedRoute } from './ProtectedRoute.js';

// Auth Pages
import { Login } from '../pages/auth/Login.js';
import { Register } from '../pages/auth/Register.js';

// Student / Public Pages
import { Dashboard } from '../pages/student/Dashboard.js';
import { BrowseQuestions } from '../pages/student/BrowseQuestions.js';
import { QuestionDetails } from '../pages/student/QuestionDetails.js';
import { SubmitQuestion } from '../pages/student/SubmitQuestion.js';
import { EditQuestion } from '../pages/student/EditQuestion.js';
import { Companies } from '../pages/student/Companies.js';
import { CompanyDetails } from '../pages/student/CompanyDetails.js';
import { Bookmarks } from '../pages/student/Bookmarks.js';
import { MyContributions } from '../pages/student/MyContributions.js';
import { Profile } from '../pages/student/Profile.js';

// Admin Pages
import { AdminDashboard } from '../pages/admin/AdminDashboard.js';
import { AdminReports } from '../pages/admin/AdminReports.js';
import { AdminQuestions } from '../pages/admin/AdminQuestions.js';
import { AdminStudents } from '../pages/admin/AdminStudents.js';
import { AdminCompanies } from '../pages/admin/AdminCompanies.js';
import { AdminDrives } from '../pages/admin/AdminDrives.js';
import { AdminCategories } from '../pages/admin/AdminCategories.js';
import { AdminDuplicates } from '../pages/admin/AdminDuplicates.js';
import { AdminAuditLogs } from '../pages/admin/AdminAuditLogs.js';
import { AdminExport } from '../pages/admin/AdminExport.js';

// Public Error Pages
import { AccessDenied } from '../pages/public/AccessDenied.js';
import { NotFound } from '../pages/public/NotFound.js';

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Auth Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/access-denied" element={<AccessDenied />} />

      {/* Main Student Portal Layout */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/questions" element={<BrowseQuestions />} />
        <Route path="/questions/:id" element={<QuestionDetails />} />
        <Route path="/companies" element={<Companies />} />
        <Route path="/companies/:id" element={<CompanyDetails />} />

        {/* Authenticated Student Routes */}
        <Route
          path="/submit-question"
          element={
            <ProtectedRoute>
              <SubmitQuestion />
            </ProtectedRoute>
          }
        />
        <Route
          path="/questions/:id/edit"
          element={
            <ProtectedRoute>
              <EditQuestion />
            </ProtectedRoute>
          }
        />
        <Route
          path="/bookmarks"
          element={
            <ProtectedRoute>
              <Bookmarks />
            </ProtectedRoute>
          }
        />
        <Route
          path="/my-contributions"
          element={
            <ProtectedRoute>
              <MyContributions />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
      </Route>

      {/* Administrator Protected Portal */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute requireAdmin={true}>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="reports" element={<AdminReports />} />
        <Route path="questions" element={<AdminQuestions />} />
        <Route path="students" element={<AdminStudents />} />
        <Route path="companies" element={<AdminCompanies />} />
        <Route path="drives" element={<AdminDrives />} />
        <Route path="categories" element={<AdminCategories />} />
        <Route path="duplicates" element={<AdminDuplicates />} />
        <Route path="audit-logs" element={<AdminAuditLogs />} />
        <Route path="export" element={<AdminExport />} />
      </Route>

      {/* 404 Catch-All */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};
