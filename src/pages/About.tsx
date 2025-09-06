import React from 'react';
import { Link } from 'react-router';
import Button from '../components/ui/button/Button';
import ComponentCard from '../components/common/ComponentCard';

const About: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="mb-6">
          <img
            src="/images/logo.png"
            alt="Immense Technologies Logo"
            className="w-24 h-24 mx-auto mb-4 rounded-lg"
          />
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Immense Technologies
          </h1>
          <p className="text-xl font-medium text-gray-700 dark:text-gray-300">
            Think Immense.
          </p>
        </div>
      </div>

      {/* About */}
      <ComponentCard title="About Immense Technologies">
        <div className="text-center py-8">
          <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed max-w-4xl mx-auto">
            "At Immense Technologies, we believe innovation should be as immense as the challenges we face. We're driven to create AI-powered solutions that go beyond limits, turning bold ideas into real-world impact. For us, technology isn't just a tool — it's the key to unlocking immense possibilities."
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
            Ready to unlock immense possibilities with AI-powered solutions?
            Let's create something extraordinary together!
          </p>
          <div className="flex justify-center gap-4">
            <Button variant="outline">
              Contact Immense Technologies
            </Button>
            <Button variant="outline">
              Explore Our Solutions
            </Button>
          </div>
        </div>
      </ComponentCard>

      {/* Back Button */}
      <div className="text-center pt-6">
        <Link to="/interview">
          <Button>
            Back to Immense Interview Assistant
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default About;