import { Link } from 'react-router-dom';
import { Users, MessageSquare, Briefcase, Calendar, ArrowRight, Sparkles } from 'lucide-react';

const Landing = () => {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 antialiased">

      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center shadow-md shadow-indigo-200">
              <span className="text-white font-extrabold text-sm tracking-tight">MC</span>
            </div>
            <span className="font-bold text-slate-900 tracking-tight text-lg">Mentor Connect</span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/login" className="text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors">
              Login
            </Link>
            <Link to="/register" className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-all shadow-sm shadow-indigo-100 hover:shadow">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden bg-white border-b border-slate-100">
        {/* Subtle decorative background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full pointer-events-none opacity-40">
          <div className="absolute top-[-10%] left-[60%] w-[600px] h-[600px] bg-indigo-200 rounded-full blur-3xl" />
          <div className="absolute top-[20%] left-[10%] w-[400px] h-[400px] bg-sky-200 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32 text-center">
          <div className="inline-flex items-center gap-1.5 bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold px-3 py-1 rounded-full mb-6">
            <Sparkles className="h-3.5 w-3.5" /> Next-generation mentorship network
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.15]">
            Connect. Learn. <br />
            <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Grow Together.
            </span>
          </h1>
          <p className="text-lg sm:text-xl text-slate-500 mt-6 max-w-2xl mx-auto leading-relaxed">
            The bridge between students, alumni, and industry mentors — 
            mentorship, career guidance, and opportunities unified in one workspace.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-10">
            <Link
              to="/register"
              className="w-full sm:w-auto bg-indigo-600 text-white px-8 py-3.5 rounded-xl font-semibold hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-200 hover:shadow-xl hover:shadow-indigo-300"
            >
              Get Started Free <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/login"
              className="w-full sm:w-auto bg-slate-50 border border-slate-200 text-slate-700 px-8 py-3.5 rounded-xl font-semibold hover:bg-slate-100 transition-colors flex items-center justify-center"
            >
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">Everything you need to grow</h2>
          <p className="text-slate-500 mt-3 text-lg">One ecosystem, curated for real-world career trajectory mapping.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          
          {/* Feature 1 */}
          <div className="bg-white border border-slate-200/60 p-6 rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-1 group">
            <div className="w-12 h-12 bg-indigo-50 group-hover:bg-indigo-100 rounded-xl flex items-center justify-center mb-5 transition-colors">
              <Users className="h-6 w-6 text-indigo-600" />
            </div>
            <h3 className="font-bold text-slate-900 mb-2 text-lg">Find Mentors</h3>
            <p className="text-sm text-slate-500 leading-relaxed">
              Connect with experienced alumni and industry mentors active in your target field.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="bg-white border border-slate-200/60 p-6 rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-1 group">
            <div className="w-12 h-12 bg-emerald-50 group-hover:bg-emerald-100 rounded-xl flex items-center justify-center mb-5 transition-colors">
              <MessageSquare className="h-6 w-6 text-emerald-600" />
            </div>
            <h3 className="font-bold text-slate-900 mb-2 text-lg">Real-time Chat</h3>
            <p className="text-sm text-slate-500 leading-relaxed">
              Message your connections instantly and get active career guidance when you need it most.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="bg-white border border-slate-200/60 p-6 rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-1 group">
            <div className="w-12 h-12 bg-rose-50 group-hover:bg-rose-100 rounded-xl flex items-center justify-center mb-5 transition-colors">
              <Briefcase className="h-6 w-6 text-rose-600" />
            </div>
            <h3 className="font-bold text-slate-900 mb-2 text-lg">Jobs & Referrals</h3>
            <p className="text-sm text-slate-500 leading-relaxed">
              Access exclusive, warm referrals and internal opportunities posted directly by trusted alumni.
            </p>
          </div>

          {/* Feature 4 */}
          <div className="bg-white border border-slate-200/60 p-6 rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-1 group">
            <div className="w-12 h-12 bg-violet-50 group-hover:bg-violet-100 rounded-xl flex items-center justify-center mb-5 transition-colors">
              <Calendar className="h-6 w-6 text-violet-600" />
            </div>
            <h3 className="font-bold text-slate-900 mb-2 text-lg">Events & Workshops</h3>
            <p className="text-sm text-slate-500 leading-relaxed">
              Join specialized technical webinars, custom workshops, and networking panels.
            </p>
          </div>
        </div>
      </section>

      {/* Role Cards */}
      <section className="bg-slate-100/70 border-y border-slate-200/50 py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">Built for everyone</h2>
            <p className="text-slate-500 mt-3 text-lg">Whichever stage you're currently tackling, there's a space for you.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Student Card */}
            <div className="bg-white border border-slate-200/80 p-8 rounded-2xl shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
              <div>
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-indigo-50 text-2xl mb-5">🎓</div>
                <h3 className="font-bold text-slate-900 text-xl mb-2">Students</h3>
                <p className="text-sm text-slate-500 leading-relaxed mb-6">
                  Get structural guidance, streamline your portfolio development, find core mentors, and source hidden internships.
                </p>
              </div>
              <Link to="/register" className="text-indigo-600 text-sm font-semibold hover:text-indigo-700 flex items-center gap-1 group">
                Join as Student <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>

            {/* Alumni Card */}
            <div className="bg-white border border-slate-200/80 p-8 rounded-2xl shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
              <div>
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-sky-50 text-2xl mb-5">👔</div>
                <h3 className="font-bold text-slate-900 text-xl mb-2">Alumni</h3>
                <p className="text-sm text-slate-500 leading-relaxed mb-6">
                  Give back seamlessly on your own schedule, pass along organizational job referrals, and maintain your network.
                </p>
              </div>
              <Link to="/register" className="text-sky-600 text-sm font-semibold hover:text-sky-700 flex items-center gap-1 group">
                Join as Alumni <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>

            {/* Mentor Card */}
            <div className="bg-white border border-slate-200/80 p-8 rounded-2xl shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
              <div>
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-emerald-50 text-2xl mb-5">⭐</div>
                <h3 className="font-bold text-slate-900 text-xl mb-2">Mentors</h3>
                <p className="text-sm text-slate-500 leading-relaxed mb-6">
                  Shape incoming talent pools by passing along domain wisdom, sharing strategic engineering practices, and building your team.
                </p>
              </div>
              <Link to="/register" className="text-emerald-600 text-sm font-semibold hover:text-emerald-700 flex items-center gap-1 group">
                Join as Mentor <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center my-12 bg-gradient-to-tr from-slate-900 via-indigo-950 to-slate-900 rounded-3xl text-white shadow-xl shadow-slate-200 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-indigo-500/10 via-transparent to-transparent pointer-events-none" />
        <div className="relative z-10 max-w-2xl mx-auto">
          <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">Ready to get started?</h2>
          <p className="text-indigo-200/80 mt-4 mb-8 text-base sm:text-lg max-w-xl mx-auto leading-relaxed">
            Join your institutional professional ecosystem today — entirely free to setup.
          </p>
          <Link to="/register" className="inline-flex items-center gap-2 bg-white text-slate-900 font-bold px-8 py-3.5 rounded-xl hover:bg-indigo-50 transition-all shadow-md hover:shadow-lg">
            Create Your Account <ArrowRight className="h-4 w-4 text-indigo-600" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-slate-400 font-medium">
          <div className="flex items-center gap-2 text-slate-700">
            <div className="w-6 h-6 bg-indigo-600 rounded-md flex items-center justify-center">
              <span className="text-white font-bold text-xs">MC</span>
            </div>
            <span className="font-bold">Mentor Connect</span>
          </div>
          <div>
            © 2026 Mentor Connect. Built for students, by students.
          </div>
        </div>
      </footer>

    </div>
  );
};

export default Landing;