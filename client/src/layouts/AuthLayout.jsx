const AuthLayout = ({ children }) => (
  <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-primary-900 px-4">
    <div className="w-full max-w-md">{children}</div>
  </div>
);

export default AuthLayout;
