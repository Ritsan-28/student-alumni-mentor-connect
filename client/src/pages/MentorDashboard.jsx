import DashboardLayout from '../components/layout/DashboardLayout';
import useAuthStore from '../store/authStore';

const MentorDashboard = () => {
  const { user } = useAuthStore();
  return (
    <DashboardLayout>
      <div className="card text-center py-16">
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome, {user?.name?.split(' ')[0]}! ⭐
        </h1>
        <p className="text-gray-500 mt-2">
          Mentor Dashboard — full version coming in Sprint 5
        </p>
      </div>
    </DashboardLayout>
  );
};

export default MentorDashboard;