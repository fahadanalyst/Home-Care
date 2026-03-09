import React, { useState, useEffect } from 'react';
import { useAuth } from './context/AuthContext';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './pages/Dashboard';
import { GAFCProgressNote } from './pages/GAFCProgressNote';
import { GAFCCarePlan } from './pages/GAFCCarePlan';
import { ClinicalForms } from './pages/ClinicalForms';
import { PhysicianSummary } from './pages/PhysicianSummary';
import { RequestForServices } from './pages/RequestForServices';
import { PatientResourceData } from './pages/PatientResourceData';
import { PhysicianOrders } from './pages/PhysicianOrders';
import { MDSAssessment } from './pages/MDSAssessment';
import { NursingAssessment } from './pages/NursingAssessment';
import { MedicationAdministrationRecord } from './pages/MedicationAdministrationRecord';
import { TreatmentAdministrationRecord } from './pages/TreatmentAdministrationRecord';
import { ClinicalNoteForm } from './pages/ClinicalNoteForm';
import { AdmissionAssessment } from './pages/AdmissionAssessment';
import { DischargeSummary } from './pages/DischargeSummary';
import { UserManagement } from './pages/UserManagement';
import { Patients } from './pages/Patients';
import { Schedule } from './pages/Schedule';
import { ClinicalNotes } from './pages/ClinicalNotes';
import { Compliance } from './pages/Compliance';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { Shield, Lock, Mail, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { Button } from './components/Button';
import { supabase, waitForSupabaseInitialization, withTimeout } from './services/supabase';

import { Logo } from './components/Logo';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Login attempt started for:', email);
    setLoading(true);
    setError(null);

    try {
      // Supabase initialization is already handled in main.tsx and AuthContext
      console.log('Login: Supabase status check...');
    } catch (initErr: any) {
      console.warn('Login: Initialization check failed:', initErr);
    }
    
    let isTimedOut = false;
    const loginTimeout = setTimeout(() => {
      console.warn('Login request timed out after 120s');
      isTimedOut = true;
      setLoading(false);
      setError('Login request timed out. This usually happens if the database connection is interrupted or the service is cold-starting. Please try again or refresh the page.');
    }, 120000);

    try {
      console.log('Calling supabase.auth.signInWithPassword for:', email);
      const startTime = Date.now();
      
      // Increase timeout to 110s to give it more room before the global 120s timeout
      const { data, error } = (await withTimeout(
        supabase.auth.signInWithPassword({ 
          email: email.trim(), 
          password 
        }),
        110000
      )) as any;
      
      const duration = Date.now() - startTime;
      console.log(`Supabase sign in response received after ${duration}ms:`, { hasData: !!data, hasError: !!error });
      
      if (isTimedOut) return;
      clearTimeout(loginTimeout);
      
      if (error) {
        console.error('Sign in error details:', error);
        if (error.message === 'Invalid login credentials' || error.message === 'Supabase not configured') {
          setError('Invalid email or password. Please check your credentials and try again.');
        } else if (error.message.includes('Database error querying schema') || error.message.includes('timeout')) {
          setError('Connection error or timeout. This can happen during service cold-starts. Please try again in a few seconds.');
        } else {
          setError(error.message);
        }
      } else {
        console.log('Sign in successful, verifying session...');
        // We don't need to manually verify here as AuthContext will pick it up
        // but we can do a quick check to be sure
        const { data: sessionData } = await supabase.auth.getSession();
        console.log('Session check result:', !!sessionData?.session?.user);
      }
    } catch (err: any) {
      if (isTimedOut) return;
      clearTimeout(loginTimeout);
      console.error('Unexpected login error caught:', err);
      
      if (err.message?.includes('timeout')) {
        setError('Login request timed out. The service might be cold-starting. Please try again.');
      } else {
        setError(err.message || 'An unexpected error occurred.');
      }
    } finally {
      if (!isTimedOut) {
        setLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-zinc-200 p-8 space-y-8">
        <div className="text-center flex flex-col items-center">
          <Logo size={80} className="mb-4" />
          <h1 className="text-2xl font-bold text-partners-blue-dark italic">Partners Home</h1>
          <p className="text-partners-gray uppercase tracking-widest text-xs font-bold">Nursing Services HIPAA Portal</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-1">
            <label className="text-sm font-medium text-zinc-700">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-zinc-200 focus:ring-2 focus:ring-partners-blue-dark outline-none transition-all"
                placeholder="admin@clinicaflow.com"
                required
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-zinc-700">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-12 py-3 rounded-xl border border-zinc-200 focus:ring-2 focus:ring-partners-blue-dark outline-none transition-all"
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 transition-colors p-1"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {error && (
            <div className="p-4 bg-red-50 border border-red-100 rounded-xl flex items-start gap-3">
              <AlertCircle className="text-red-600 shrink-0" size={18} />
              <p className="text-sm text-red-600 font-medium">{error}</p>
            </div>
          )}

          <Button type="submit" className="w-full py-4 text-lg" disabled={loading}>
            {loading ? 'Signing In...' : 'Sign In'}
          </Button>
        </form>

        <div className="pt-4 border-t border-zinc-100 text-center">
          <p className="text-xs text-zinc-400">
            This is a HIPAA-compliant system. All access is monitored and logged.
          </p>
        </div>
      </div>
    </div>
  );
};

const RoleProtectedRoute: React.FC<{ children: React.ReactNode; allowedRoles: string[] }> = ({ children, allowedRoles }) => {
  const { profile, loading } = useAuth();
  
  if (loading) return null;
  
  if (!profile || !allowedRoles.includes(profile.role)) {
    return <Navigate to="/" replace />;
  }
  
  return <>{children}</>;
};

const Layout: React.FC = () => {
  return (
    <div className="flex h-screen bg-zinc-50 overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default function App() {
  const { user, loading } = useAuth();
  const [configError, setConfigError] = useState<string | null>(null);

  useEffect(() => {
    const checkConfig = () => {
      if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
        setConfigError('Supabase configuration is missing. Please add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your environment variables in the Secrets panel.');
      }
    };
    checkConfig();
  }, []);

  if (configError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50 p-4 text-center">
        <div className="max-w-md bg-white p-8 rounded-3xl shadow-xl border border-zinc-200">
          <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Shield size={32} />
          </div>
          <h2 className="text-xl font-bold text-zinc-900 mb-2">Configuration Required</h2>
          <p className="text-zinc-600 mb-6">{configError}</p>
          <div className="text-xs text-zinc-400 bg-zinc-50 p-4 rounded-xl text-left">
            <p className="font-bold mb-1">Steps to fix:</p>
            <ol className="list-decimal ml-4 space-y-1">
              <li>Open the Secrets panel in AI Studio.</li>
              <li>Add <code>VITE_SUPABASE_URL</code> with your project URL.</li>
              <li>Add <code>VITE_SUPABASE_ANON_KEY</code> with your anon key.</li>
              <li>The app will restart automatically.</li>
            </ol>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-zinc-50 p-4">
        <div className="max-w-md w-full flex flex-col items-center space-y-6 animate-pulse">
          <Logo size={100} />
          <div className="text-center">
            <h1 className="text-3xl font-bold text-partners-blue-dark italic">Partners Home</h1>
            <p className="text-partners-gray uppercase tracking-widest text-sm font-bold mt-2">Nursing Services</p>
          </div>
          <div className="w-48 h-1 bg-zinc-200 rounded-full overflow-hidden">
            <div className="h-full bg-partners-blue-dark animate-[loading_1.5s_ease-in-out_infinite]"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route 
          path="/login" 
          element={!user ? <Login /> : <Navigate to="/" replace />} 
        />

        {/* Protected Routes */}
        <Route 
          path="/" 
          element={user ? <Layout /> : <Navigate to="/login" replace />}
        >
          <Route index element={<Dashboard />} />
          <Route 
            path="patients" 
            element={
              <RoleProtectedRoute allowedRoles={['admin', 'manager', 'frontdesk', 'clinical_worker', 'nurse']}>
                <Patients />
              </RoleProtectedRoute>
            } 
          />
          <Route 
            path="schedule" 
            element={
              <RoleProtectedRoute allowedRoles={['admin', 'manager', 'frontdesk', 'clinical_worker']}>
                <Schedule />
              </RoleProtectedRoute>
            } 
          />
          <Route 
            path="notes" 
            element={
              <RoleProtectedRoute allowedRoles={['admin', 'manager', 'clinical_worker', 'nurse']}>
                <ClinicalNotes />
              </RoleProtectedRoute>
            } 
          />
          <Route 
            path="clinical-forms" 
            element={
              <RoleProtectedRoute allowedRoles={['admin', 'manager', 'clinical_worker', 'nurse', 'reviewer']}>
                <ClinicalForms />
              </RoleProtectedRoute>
            } 
          />
          <Route 
            path="progress-note" 
            element={
              <RoleProtectedRoute allowedRoles={['admin', 'manager', 'clinical_worker', 'nurse', 'reviewer']}>
                <GAFCProgressNote />
              </RoleProtectedRoute>
            } 
          />
          <Route 
            path="care-plan" 
            element={
              <RoleProtectedRoute allowedRoles={['admin', 'manager', 'clinical_worker', 'nurse', 'reviewer']}>
                <GAFCCarePlan />
              </RoleProtectedRoute>
            } 
          />
          <Route 
            path="physician-summary" 
            element={
              <RoleProtectedRoute allowedRoles={['admin', 'manager', 'clinical_worker', 'nurse', 'reviewer']}>
                <PhysicianSummary />
              </RoleProtectedRoute>
            } 
          />
          <Route 
            path="request-for-services" 
            element={
              <RoleProtectedRoute allowedRoles={['admin', 'manager', 'clinical_worker', 'nurse', 'reviewer']}>
                <RequestForServices />
              </RoleProtectedRoute>
            } 
          />
          <Route 
            path="patient-resource-data" 
            element={
              <RoleProtectedRoute allowedRoles={['admin', 'manager', 'clinical_worker', 'nurse', 'reviewer']}>
                <PatientResourceData />
              </RoleProtectedRoute>
            } 
          />
          <Route 
            path="physician-orders" 
            element={
              <RoleProtectedRoute allowedRoles={['admin', 'manager', 'clinical_worker', 'nurse', 'reviewer']}>
                <PhysicianOrders />
              </RoleProtectedRoute>
            } 
          />
          <Route 
            path="mds-assessment" 
            element={
              <RoleProtectedRoute allowedRoles={['admin', 'manager', 'clinical_worker', 'nurse', 'reviewer']}>
                <MDSAssessment />
              </RoleProtectedRoute>
            } 
          />
          <Route 
            path="nursing-assessment" 
            element={
              <RoleProtectedRoute allowedRoles={['admin', 'manager', 'clinical_worker', 'nurse', 'reviewer']}>
                <NursingAssessment />
              </RoleProtectedRoute>
            } 
          />
          <Route 
            path="mar" 
            element={
              <RoleProtectedRoute allowedRoles={['admin', 'manager', 'clinical_worker', 'nurse', 'reviewer']}>
                <MedicationAdministrationRecord />
              </RoleProtectedRoute>
            } 
          />
          <Route 
            path="tar" 
            element={
              <RoleProtectedRoute allowedRoles={['admin', 'manager', 'clinical_worker', 'nurse', 'reviewer']}>
                <TreatmentAdministrationRecord />
              </RoleProtectedRoute>
            } 
          />
          <Route 
            path="clinical-note-form" 
            element={
              <RoleProtectedRoute allowedRoles={['admin', 'manager', 'clinical_worker', 'nurse', 'reviewer']}>
                <ClinicalNoteForm />
              </RoleProtectedRoute>
            } 
          />
          <Route 
            path="admission-assessment" 
            element={
              <RoleProtectedRoute allowedRoles={['admin', 'manager', 'clinical_worker', 'nurse', 'reviewer']}>
                <AdmissionAssessment />
              </RoleProtectedRoute>
            } 
          />
          <Route 
            path="discharge-summary" 
            element={
              <RoleProtectedRoute allowedRoles={['admin', 'manager', 'clinical_worker', 'nurse', 'reviewer']}>
                <DischargeSummary />
              </RoleProtectedRoute>
            } 
          />
          <Route 
            path="compliance" 
            element={
              <RoleProtectedRoute allowedRoles={['admin', 'reviewer']}>
                <Compliance />
              </RoleProtectedRoute>
            } 
          />
          <Route 
            path="settings" 
            element={
              <RoleProtectedRoute allowedRoles={['admin']}>
                <UserManagement />
              </RoleProtectedRoute>
            } 
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </Router>
  );
}
