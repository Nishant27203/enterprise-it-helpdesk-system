import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ROLE_HOME_PATHS } from '../utils/constants';

const NotFoundPage = () => {
  const { user } = useAuth();
  const homePath = user ? ROLE_HOME_PATHS[user.role] : '/login';

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4">
      <h1 className="text-6xl font-bold text-slate-300">404</h1>
      <p className="mt-4 text-lg text-slate-600">Page not found</p>
      <Link
        to={homePath}
        className="mt-6 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700"
      >
        Go back home
      </Link>
    </div>
  );
};

export default NotFoundPage;
