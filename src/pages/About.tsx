import React from 'react';
import { Link } from 'react-router';
import Button from '../components/ui/button/Button';
import ComponentCard from '../components/common/ComponentCard';

const About: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          About AI Interview Assistant
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-400">
          Revolutionizing technical interview preparation with AI-powered insights
        </p>
      </div>

      {/* Mission */}
      <ComponentCard title="Our Mission">
        <div className="text-center py-8">
          <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
            To democratize technical interview preparation by providing personalized,
            AI-driven feedback that helps developers of all levels succeed in their career aspirations.
          </p>
        </div>
      </ComponentCard>

      {/* Features */}
      <ComponentCard title="Key Features">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-blue-600 text-xl">🤖</span>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                AI-Powered Analysis
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Advanced AI algorithms analyze your responses and provide detailed feedback
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-green-600 text-xl">📊</span>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                Comprehensive Reports
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Detailed performance analysis with strengths, weaknesses, and improvement suggestions
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-purple-600 text-xl">🎯</span>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                Multiple Domains
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Practice interviews across various technical domains and difficulty levels
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/20 rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-orange-600 text-xl">📈</span>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                Progress Tracking
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Monitor your improvement over time with detailed analytics and history
              </p>
            </div>
          </div>
        </div>
      </ComponentCard>

      {/* Developer Section */}
      <ComponentCard title="Meet the Developer">
        <div className="text-center py-8">
          <div className="w-32 h-32 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mx-auto mb-6 flex items-center justify-center">
            <span className="text-white text-4xl font-bold">D</span>
          </div>

          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Demo Developer
          </h3>
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-4">
            Full-Stack Developer & AI Enthusiast
          </p>

          <div className="flex justify-center gap-4 mb-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">50+</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Projects</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">3+</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Years Experience</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">10+</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Technologies</div>
            </div>
          </div>

          <p className="text-gray-700 dark:text-gray-300 max-w-2xl mx-auto leading-relaxed">
            Passionate about creating innovative solutions that make a difference.
            Specializing in modern web technologies, AI integration, and user-centric design.
            Always learning and exploring new ways to solve complex problems.
          </p>
        </div>
      </ComponentCard>

      {/* Technologies */}
      <ComponentCard title="Built With">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { name: 'React', icon: '⚛️' },
            { name: 'TypeScript', icon: '🔷' },
            { name: 'Tailwind CSS', icon: '🎨' },
            { name: 'Firebase', icon: '🔥' },
            { name: 'Python', icon: '🐍' },
            { name: 'Gemini AI', icon: '🤖' },
            { name: 'Node.js', icon: '🟢' },
            { name: 'Vite', icon: '⚡' }
          ].map((tech) => (
            <div key={tech.name} className="text-center p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
              <div className="text-2xl mb-2">{tech.icon}</div>
              <div className="font-medium text-gray-900 dark:text-white">{tech.name}</div>
            </div>
          ))}
        </div>
      </ComponentCard>

      {/* Contact */}
      <ComponentCard title="Get In Touch">
        <div className="text-center py-6">
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Have questions or feedback? We'd love to hear from you!
          </p>
          <div className="flex justify-center gap-4">
            <Button variant="outline">
              Contact Support
            </Button>
            <Button variant="outline">
              Report Issue
            </Button>
          </div>
        </div>
      </ComponentCard>

      {/* Back Button */}
      <div className="text-center pt-6">
        <Link to="/interview">
          <Button>
            Back to Interview Assistant
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default About;