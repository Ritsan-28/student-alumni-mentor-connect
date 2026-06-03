import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-9xl font-bold text-primary-600">404</h1>
        <p className="text-2xl font-semibold text-gray-900 mt-4">
          Page Not Found
        </p>
        <p className="text-gray-500 mt-2">
          The page you're looking for doesn't exist.
        </p>
        <Link to="/" className="btn-primary inline-block mt-6">
          Go Home
        </Link>
      </div>
    </div>
  );
};

export default NotFound;