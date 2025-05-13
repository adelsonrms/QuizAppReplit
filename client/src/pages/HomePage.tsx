import React, { useState } from 'react';
import { useLocation, Link } from 'wouter';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const HomePage: React.FC = () => {
  const [, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState<'instructor' | 'student'>('instructor');
  
  const switchTab = (tab: 'instructor' | 'student') => {
    setActiveTab(tab);
    
    // Navigate to the corresponding page
    if (tab === 'instructor') {
      navigate('/instructor');
    } else {
      navigate('/student');
    }
  };
  
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-grow">
        <div className="bg-white shadow-sm">
          <div className="container mx-auto px-4">
            <div className="flex border-b border-neutral">
              <button 
                className={`tab-btn ${activeTab === 'instructor' ? 'active' : ''}`}
                onClick={() => switchTab('instructor')}
              >
                Instructor
              </button>
              <button 
                className={`tab-btn ${activeTab === 'student' ? 'active' : ''}`}
                onClick={() => switchTab('student')}
              >
                Student
              </button>
            </div>
          </div>
        </div>
        
        <div className="container mx-auto px-4 py-12">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h1 className="text-4xl font-poppins font-bold text-primary mb-4">
              Welcome to AMS-QUIZ
            </h1>
            <p className="text-lg text-gray-700 mb-8">
              The online quiz platform specialized in content about the Cayman Islands.
              Choose your profile to start using our system.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/instructor">
                <a className="px-6 py-3 bg-primary text-white font-medium rounded-md hover:bg-primary-light transition-colors">
                  Access as Instructor
                </a>
              </Link>
              <Link href="/student">
                <a className="px-6 py-3 border border-primary text-primary font-medium rounded-md hover:bg-primary hover:text-white transition-colors">
                  Access as Student
                </a>
              </Link>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="mb-4 text-center">
                <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto">
                  <i className="ri-user-line text-2xl text-white"></i>
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-center">For Instructors</h3>
              <p className="text-gray-700 mb-4">
                Create custom quizzes for your classes, track student progress,
                and view detailed performance statistics.
              </p>
              <ul className="space-y-2 mb-4">
                <li className="flex items-start">
                  <i className="ri-check-line text-accent mt-1 mr-2"></i>
                  <span>Generate quizzes with customized number of questions</span>
                </li>
                <li className="flex items-start">
                  <i className="ri-check-line text-accent mt-1 mr-2"></i>
                  <span>Share exclusive links with students</span>
                </li>
                <li className="flex items-start">
                  <i className="ri-check-line text-accent mt-1 mr-2"></i>
                  <span>View performance statistics by category</span>
                </li>
              </ul>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="mb-4 text-center">
                <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center mx-auto">
                  <i className="ri-book-open-line text-2xl text-white"></i>
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-center">About Cayman Islands</h3>
              <p className="text-gray-700 mb-4">
                Learn about the history, geography, culture, and economy of the beautiful Cayman Islands
                through our interactive quizzes.
              </p>
              <div className="rounded-lg overflow-hidden mb-4">
                <img 
                  src="https://pixabay.com/get/ga750f8229d42056721520ad14ef7a1e4cec14e0f72da2f742fbbc30523e5ffe257ebfb46d283f49a8dde44d740427673c5d1e44d53abfc76ae7dc1f2652f16e2_1280.jpg" 
                  alt="Cayman Islands" 
                  className="w-full h-48 object-cover"
                />
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="mb-4 text-center">
                <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto">
                  <i className="ri-graduation-cap-line text-2xl text-white"></i>
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-center">For Students</h3>
              <p className="text-gray-700 mb-4">
                Access quizzes prepared by your instructors, test your knowledge,
                and track your learning progress.
              </p>
              <ul className="space-y-2 mb-4">
                <li className="flex items-start">
                  <i className="ri-check-line text-accent mt-1 mr-2"></i>
                  <span>Answer interactive questions with images and alternatives</span>
                </li>
                <li className="flex items-start">
                  <i className="ri-check-line text-accent mt-1 mr-2"></i>
                  <span>See your detailed results after finishing</span>
                </li>
                <li className="flex items-start">
                  <i className="ri-check-line text-accent mt-1 mr-2"></i>
                  <span>Track your performance by category</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default HomePage;
