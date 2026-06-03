const Landing = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-600 to-primary-800">
      <div className="text-center text-white">
        <h1 className="text-5xl font-bold mb-4">Mentor Connect</h1>
        <p className="text-xl text-primary-100 mb-8">
          Connecting Students, Alumni & Mentors
        </p>
        <div className="space-x-4">
          <a href="/login"
            className="bg-white text-primary-600 px-6 py-3 rounded-lg font-semibold hover:bg-primary-50 transition-colors">
            Login
          </a>
          <a href="/register"
            className="border-2 border-white text-white px-6 py-3 rounded-lg font-semibold hover:bg-white hover:text-primary-600 transition-colors">
            Get Started
          </a>
        </div>
      </div>
    </div>
  );
};

export default Landing;