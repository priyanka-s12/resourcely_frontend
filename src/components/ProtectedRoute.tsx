import { Outlet, Navigate } from 'react-router-dom';

const ProtectedRoute: React.FC = () => {
  const token = JSON.parse(localStorage.getItem('userToken') || 'null') as
    | string
    | null;

  return token ? <Outlet /> : <Navigate to="/" replace />;
};

export default ProtectedRoute;
