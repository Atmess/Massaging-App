import { Outlet } from 'react-router-dom';

export default function MiddleboardLayout() {
  return (
    <div className="min-h-screen bg-slate-500 flex justify-center py-8 px-4">
      {/* Your "middleboard" / whiteboard container */}
      <div className="w-full max-w-4xl min-w-3xl bg-slate-500 border border-slate-700 rounded-2xl shadow-2xl p-6 sm:p-10 text-slate-100">
        <Outlet />{' '}
        {/* 👈 Child routes (Dashboard, Profile, Posts, etc.) render right here */}
      </div>
    </div>
  );
}
