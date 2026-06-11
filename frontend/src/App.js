import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { Toaster } from 'sonner';
import { Helmet } from 'react-helmet-async';

const Home = lazy(() => import('./pages/Home'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const ApplyJob = lazy(() => import('./pages/ApplyJob'));
const Profile = lazy(() => import('./pages/Profile'));
const ViewProfile = lazy(() => import('./pages/ViewProfile'));
const SavedJobs = lazy(() => import('./pages/SavedJobs'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/ResetPassword'));
const VerifyEmail = lazy(() => import('./pages/VerifyEmail'));

const defaultMeta = {
  title: 'WorkHena | Jobs, Hiring, and Career Growth',
  description: 'WorkHena helps job seekers find great jobs and recruiters hire faster with smart matching, saved jobs, and streamlined hiring tools.',
  index: true
};

const routeMeta = [
  { path: '/', title: 'WorkHena | Find Jobs and Hire Talent', description: 'Browse jobs, match with the right opportunities, and manage hiring from one platform.', index: true },
  { path: '/login', title: 'Sign In | WorkHena', description: 'Sign in to your WorkHena account to continue your job search or hiring workflow.', index: false },
  { path: '/register', title: 'Create Account | WorkHena', description: 'Create a free WorkHena account for job seeking or recruiting.', index: false },
  { path: '/dashboard', title: 'Dashboard | WorkHena', description: 'View your WorkHena dashboard, job matches, applications, or hiring tools.', index: false },
  { path: '/apply/', title: 'Apply for Job | WorkHena', description: 'Submit your application and apply for this job on WorkHena.', index: false, matchPrefix: true },
  { path: '/profile', title: 'My Profile | WorkHena', description: 'Update your profile, skills, and public job-seeking details.', index: false },
  { path: '/view-profile/', title: 'View Profile | WorkHena', description: 'View a candidate profile on WorkHena.', index: false, matchPrefix: true },
  { path: '/saved-jobs', title: 'Saved Jobs | WorkHena', description: 'Review the jobs you saved on WorkHena.', index: false },
  { path: '/admin', title: 'Admin Dashboard | WorkHena', description: 'Manage users, jobs, and platform activity in the WorkHena admin dashboard.', index: false },
  { path: '/forgot-password', title: 'Forgot Password | WorkHena', description: 'Request a password reset link for your WorkHena account.', index: false },
  { path: '/reset-password', title: 'Reset Password | WorkHena', description: 'Set a new password for your WorkHena account.', index: false },
  { path: '/verify-email', title: 'Verify Email | WorkHena', description: 'Verify your WorkHena email address to unlock full account access.', index: false }
];

function RouteHead() {
  const { pathname } = useLocation();
  const matchedRoute = routeMeta.find((route) => (
    route.matchPrefix ? pathname.startsWith(route.path) : pathname === route.path
  ));
  const meta = matchedRoute || defaultMeta;
  const canonical = typeof window !== 'undefined' ? `${window.location.origin}${pathname}` : pathname;

  return (
    <Helmet>
      <title>{meta.title}</title>
      <meta name="description" content={meta.description} />
      <meta name="robots" content={meta.index ? 'index,follow' : 'noindex,nofollow'} />
      <link rel="canonical" href={canonical} />
      <meta property="og:type" content="website" />
      <meta property="og:title" content={meta.title} />
      <meta property="og:description" content={meta.description} />
      <meta property="og:url" content={canonical} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={meta.title} />
      <meta name="twitter:description" content={meta.description} />
    </Helmet>
  );
}

function AppLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 text-gray-600 dark:text-gray-300">
      Loading...
    </div>
  );
}

function App() {
  return (
    <Router>
      <RouteHead />
      <div className="App">
        <Toaster
          position="top-right"
          richColors
          closeButton
          toastOptions={{
            classNames: {
              closeButton: '!bg-red-500 !text-white !border-red-600 hover:!bg-red-600 !left-auto !right-2 !top-1/2 !-translate-y-1/2'
            }
          }}
        />
        <Suspense fallback={<AppLoading />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/apply/:jobId" element={<ApplyJob />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/view-profile/:userId" element={<ViewProfile />} />
            <Route path="/saved-jobs" element={<SavedJobs />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/verify-email" element={<VerifyEmail />} />
          </Routes>
        </Suspense>
      </div>
    </Router>
  );
}

export default App;