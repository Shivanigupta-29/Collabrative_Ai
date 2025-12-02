// frontend/src/pages/Home.js
import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  ArrowRight,
  Brain,
  Users,
  Zap,
  Shield,
  Globe,
  CheckCircle,
  Star,
  Play,
  Menu,
  X
} from 'lucide-react';
import { useState } from 'react';

const Home = () => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Redirect authenticated users to dashboard
  useEffect(() => {
    if (isAuthenticated && user) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, user, navigate]);

  const features = [
    {
      icon: Brain,
      title: 'AI-Powered Ideation',
      description: 'Generate creative ideas and solutions using advanced AI algorithms. Transform your brainstorming sessions with intelligent suggestions.',
      color: 'text-purple-600 bg-purple-100'
    },
    {
      icon: Users,
      title: 'Real-time Collaboration',
      description: 'Work together seamlessly with your team in real-time. Share whiteboards, chat, and collaborate on projects instantly.',
      color: 'text-blue-600 bg-blue-100'
    },
    {
      icon: Zap,
      title: 'Smart Project Management',
      description: 'Organize tasks with intelligent Kanban boards. Track progress and manage deadlines with AI-driven insights.',
      color: 'text-yellow-600 bg-yellow-100'
    },
    {
      icon: Shield,
      title: 'Enterprise Security',
      description: 'Advanced role-based access control and enterprise-grade security. Your data is always protected and private.',
      color: 'text-green-600 bg-green-100'
    },
    {
      icon: Globe,
      title: 'Document Versioning',
      description: 'Never lose your work with automatic version control. Track changes and collaborate on documents effortlessly.',
      color: 'text-indigo-600 bg-indigo-100'
    },
    {
      icon: Star,
      title: 'Analytics Dashboard',
      description: 'Get insights into team productivity and project progress. Make data-driven decisions with AI-powered analytics.',
      color: 'text-pink-600 bg-pink-100'
    }
  ];

  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'Product Manager at TechCorp',
      content: 'This platform has revolutionized how our team collaborates. The AI suggestions are incredibly helpful for brainstorming.',
      avatar: '/api/placeholder/64/64'
    },
    {
      name: 'Michael Chen',
      role: 'Lead Developer at StartupXYZ',
      content: 'The real-time collaboration features are seamless. We can work together from anywhere and stay perfectly synchronized.',
      avatar: '/api/placeholder/64/64'
    },
    {
      name: 'Emily Rodriguez',
      role: 'Design Director at CreativeAgency',
      content: 'The whiteboard feature is amazing for design reviews. Our remote team feels more connected than ever before.',
      avatar: '/api/placeholder/64/64'
    }
  ];

  const pricingPlans = [
    {
      name: 'Free',
      price: '$0',
      period: 'forever',
      description: 'Perfect for small teams getting started',
      features: [
        '3 projects',
        '5 team members',
        'Basic AI features',
        'Standard support',
        '1GB storage'
      ],
      buttonText: 'Get Started Free',
      popular: false
    },
    {
      name: 'Pro',
      price: '$15',
      period: 'per user/month',
      description: 'Best for growing teams and businesses',
      features: [
        'Unlimited projects',
        'Unlimited team members',
        'Advanced AI features',
        'Priority support',
        '100GB storage',
        'Custom integrations',
        'Analytics dashboard'
      ],
      buttonText: 'Start Pro Trial',
      popular: true
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      period: 'contact sales',
      description: 'For large organizations with specific needs',
      features: [
        'Everything in Pro',
        'Single sign-on (SSO)',
        'Advanced security',
        'Dedicated support',
        'Custom deployment',
        'SLA guarantee'
      ],
      buttonText: 'Contact Sales',
      popular: false
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-white shadow-sm fixed w-full top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
                  <div className="h-4 w-4 bg-white rounded-sm"></div>
                </div>
              </div>
              <div className="ml-3">
                <span className="text-xl font-bold text-gray-900">CollabAI</span>
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-700 hover:text-gray-900 font-medium">Features</a>
              <a href="#testimonials" className="text-gray-700 hover:text-gray-900 font-medium">Testimonials</a>
              <a href="#pricing" className="text-gray-700 hover:text-gray-900 font-medium">Pricing</a>
              <Link to="/login" className="text-gray-700 hover:text-gray-900 font-medium">Sign In</Link>
              <Link to="/register" className="btn-primary">
                Get Started
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="text-gray-700 hover:text-gray-900"
              >
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t">
              <a href="#features" className="block px-3 py-2 text-gray-700 hover:text-gray-900">Features</a>
              <a href="#testimonials" className="block px-3 py-2 text-gray-700 hover:text-gray-900">Testimonials</a>
              <a href="#pricing" className="block px-3 py-2 text-gray-700 hover:text-gray-900">Pricing</a>
              <Link to="/login" className="block px-3 py-2 text-gray-700 hover:text-gray-900">Sign In</Link>
              <Link to="/register" className="block px-3 py-2 btn-primary mx-3 text-center">Get Started</Link>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="pt-20 pb-16 bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Collaborate Smarter with
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600"> AI Power</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Transform your team's productivity with AI-powered ideation, real-time collaboration,
              and intelligent project management. The future of teamwork is here.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mt-6">
              <Link
                to="/register"
                className="bg-purple-600 hover:bg-purple-700 text-white font-semibold text-lg px-10 py-4 rounded-xl shadow-lg flex items-center justify-center transition-all duration-300"
              >
                Start Free Trial
                <ArrowRight className="ml-3 h-5 w-5" />
              </Link>

              <button
                className="border-2 border-purple-600 text-purple-600 hover:bg-purple-50 font-semibold text-lg px-10 py-4 rounded-xl flex items-center justify-center transition-all duration-300"
              >
                <Play className="mr-3 h-5 w-5" />
                Watch Demo
              </button>
            </div>

            <p className="text-sm text-gray-500 mt-4">
              No credit card required • 14-day free trial • Cancel anytime
            </p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Everything you need to collaborate
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Powerful features designed to enhance team productivity and creativity
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="card transform transition-all duration-500 hover:scale-105 hover:-translate-y-2 hover:shadow-2xl hover:bg-gradient-to-r hover:from-purple-50 hover:to-blue-50 rounded-xl border border-gray-200 hover:border-purple-500 group"
              >
                <div className="card-body">
                  <div className={`w-12 h-12 rounded-lg ${feature.color} flex items-center justify-center mb-4 transition-transform duration-300 group-hover:animate-wiggle`}>
                    <feature.icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600">
                    {feature.description}
                  </p>
                </div>
              </div>


            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Loved by teams worldwide
            </h2>
            <p className="text-xl text-gray-600">
              See what our customers are saying about CollabAI
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="card">
                <div className="card-body">
                  <div className="flex mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-gray-700 mb-4 italic">
                    "{testimonial.content}"
                  </p>
                  <div className="flex items-center">
                    <img
                      src={testimonial.avatar}
                      alt={testimonial.name}
                      className="h-12 w-12 rounded-full mr-4"
                    />
                    <div>
                      <p className="font-semibold text-gray-900">{testimonial.name}</p>
                      <p className="text-gray-600 text-sm">{testimonial.role}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Simple, transparent pricing
            </h2>
            <p className="text-xl text-gray-600">
              Choose the plan that's right for your team
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {pricingPlans.map((plan, index) => (
              <div key={index} className={`card ${plan.popular ? 'ring-2 ring-purple-600' : ''} relative`}>
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-purple-600 text-white px-4 py-1 rounded-full text-sm font-medium">
                      Most Popular
                    </span>
                  </div>
                )}
                <div className="card-body">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{plan.name}</h3>
                  <div className="mb-4">
                    <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                    <span className="text-gray-600 ml-2">{plan.period}</span>
                  </div>
                  <p className="text-gray-600 mb-6">{plan.description}</p>
                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center">
                        <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <button className={`w-full ${plan.popular ? 'btn-primary' : 'btn-outline'}`}>
                    {plan.buttonText}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-purple-600 to-blue-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to transform your team's collaboration?
          </h2>
          <p className="text-xl text-purple-100 mb-8">
            Join thousands of teams already using CollabAI to work smarter, not harder.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register" className="bg-white text-purple-600 hover:bg-gray-100 px-8 py-4 rounded-lg font-semibold text-lg transition-colors">
              Start Free Trial
            </Link>
            <button className="border-2 border-white text-white hover:bg-white hover:text-purple-600 px-8 py-4 rounded-lg font-semibold text-lg transition-colors">
              Contact Sales
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <div className="h-8 w-8 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
                  <div className="h-4 w-4 bg-white rounded-sm"></div>
                </div>
                <span className="ml-3 text-xl font-bold">CollabAI</span>
              </div>
              <p className="text-gray-400">
                The future of collaborative work, powered by artificial intelligence.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">Features</a></li>
                <li><a href="#" className="hover:text-white">Pricing</a></li>
                <li><a href="#" className="hover:text-white">Security</a></li>
                <li><a href="#" className="hover:text-white">Roadmap</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">About</a></li>
                <li><a href="#" className="hover:text-white">Blog</a></li>
                <li><a href="#" className="hover:text-white">Careers</a></li>
                <li><a href="#" className="hover:text-white">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">Help Center</a></li>
                <li><a href="#" className="hover:text-white">Documentation</a></li>
                <li><a href="#" className="hover:text-white">API Reference</a></li>
                <li><a href="#" className="hover:text-white">Status</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            <p>&copy; 2024 CollabAI. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;