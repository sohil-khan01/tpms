import { useNavigate } from 'react-router-dom';
import { 
  Briefcase, 
  Users, 
  FileText, 
  TrendingUp, 
  CheckCircle, 
  Zap,
  Target,
  Award,
  ArrowRight
} from 'lucide-react';

const HomePage = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: <Briefcase className="w-8 h-8" />,
      title: "Smart ATS",
      description: "Intelligent applicant tracking system with AI-powered resume parsing"
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "Talent Management",
      description: "Comprehensive candidate management and hiring pipeline"
    },
    {
      icon: <FileText className="w-8 h-8" />,
      title: "JD Matching",
      description: "Automated job description matching with candidate profiles"
    },
    {
      icon: <TrendingUp className="w-8 h-8" />,
      title: "Analytics",
      description: "Real-time insights and hiring metrics dashboard"
    },
    {
      icon: <CheckCircle className="w-8 h-8" />,
      title: "Online Testing",
      description: "Built-in assessment and interview scheduling platform"
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: "Fast & Efficient",
      description: "Streamline your recruitment process and save time"
    }
  ];

  const stats = [
    { number: "10K+", label: "Candidates" },
    { number: "500+", label: "Companies" },
    { number: "95%", label: "Success Rate" },
    { number: "24/7", label: "Support" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md shadow-sm z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <Target className="w-8 h-8 text-blue-600" />
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                8BIT SYSTEM 
              </span>
            </div>
            <button
              onClick={() => navigate('/login')}
              className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-200 flex items-center space-x-2"
            >
              <span>Login</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center space-x-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full mb-6">
            <Award className="w-5 h-5" />
            <span className="text-sm font-semibold">Next-Gen Recruitment Platform</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6 leading-tight">
            Transform Your
            <span className="block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Hiring Process
            </span>
          </h1>
          
          <p className="text-xl text-gray-600 mb-10 max-w-3xl mx-auto">
            Streamline recruitment with our AI-powered Talent & Performance Management System. 
            Find, assess, and hire the best candidates faster than ever.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button
              onClick={() => navigate('/register')}
              className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold text-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-200 flex items-center space-x-2"
            >
              <span>Register for Test</span>
              <ArrowRight className="w-5 h-5" />
            </button>
            <button
              onClick={() => navigate('/login')}
              className="px-8 py-4 bg-white text-gray-700 rounded-xl font-semibold text-lg border-2 border-gray-200 hover:border-blue-600 hover:text-blue-600 transition-all duration-200"
            >
              Admin Login
            </button>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                  {stat.number}
                </div>
                <div className="text-gray-600 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Powerful Features
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Everything you need to manage your recruitment process efficiently
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300 border border-gray-100"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center text-white mb-6">
                  {feature.icon}
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl p-12 text-center text-white shadow-2xl">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Ready to Get Started?
            </h2>
            <p className="text-xl mb-8 opacity-90">
              Join hundreds of companies already using TPMS to streamline their hiring
            </p>
            <button
              onClick={() => navigate('/register')}
              className="px-10 py-4 bg-white text-blue-600 rounded-xl font-bold text-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-200 inline-flex items-center space-x-2"
            >
              <span>Register Now</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Target className="w-8 h-8 text-blue-400" />
            <span className="text-2xl font-bold">TPMS</span>
          </div>
          <p className="text-gray-400 mb-4">
            Talent & Performance Management System
          </p>
          <p className="text-gray-500 text-sm">
            © 2026 TPMS. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
