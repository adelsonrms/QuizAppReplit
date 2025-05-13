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
                Instrutor
              </button>
              <button 
                className={`tab-btn ${activeTab === 'student' ? 'active' : ''}`}
                onClick={() => switchTab('student')}
              >
                Aluno
              </button>
            </div>
          </div>
        </div>
        
        <div className="container mx-auto px-4 py-12">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h1 className="text-4xl font-poppins font-bold text-primary mb-4">
              Bem-vindo ao AMS-QUIZ
            </h1>
            <p className="text-lg text-text-dark mb-8">
              A plataforma de simulados online especializada em conteúdo sobre as Ilhas Cayman. 
              Escolha seu perfil para começar a utilizar nosso sistema.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/instructor">
                <a className="px-6 py-3 bg-primary text-white font-medium rounded-md hover:bg-primary-light transition-colors">
                  Acessar como Instrutor
                </a>
              </Link>
              <Link href="/student">
                <a className="px-6 py-3 border border-primary text-primary font-medium rounded-md hover:bg-primary hover:text-white transition-colors">
                  Acessar como Aluno
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
              <h3 className="text-xl font-semibold mb-2 text-center">Para Instrutores</h3>
              <p className="text-text-dark mb-4">
                Crie simulados personalizados para suas turmas, acompanhe o progresso dos alunos
                e visualize estatísticas detalhadas de desempenho.
              </p>
              <ul className="space-y-2 mb-4">
                <li className="flex items-start">
                  <i className="ri-check-line text-accent mt-1 mr-2"></i>
                  <span>Gere simulados com número personalizado de questões</span>
                </li>
                <li className="flex items-start">
                  <i className="ri-check-line text-accent mt-1 mr-2"></i>
                  <span>Compartilhe links exclusivos com os alunos</span>
                </li>
                <li className="flex items-start">
                  <i className="ri-check-line text-accent mt-1 mr-2"></i>
                  <span>Visualize estatísticas de desempenho por categoria</span>
                </li>
              </ul>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="mb-4 text-center">
                <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center mx-auto">
                  <i className="ri-book-open-line text-2xl text-white"></i>
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-center">Sobre as Ilhas Cayman</h3>
              <p className="text-text-dark mb-4">
                Aprenda sobre a história, geografia, cultura e economia das belas Ilhas Cayman
                através de nossos simulados interativos.
              </p>
              <div className="rounded-lg overflow-hidden mb-4">
                <img 
                  src="https://pixabay.com/get/ga750f8229d42056721520ad14ef7a1e4cec14e0f72da2f742fbbc30523e5ffe257ebfb46d283f49a8dde44d740427673c5d1e44d53abfc76ae7dc1f2652f16e2_1280.jpg" 
                  alt="Ilhas Cayman" 
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
              <h3 className="text-xl font-semibold mb-2 text-center">Para Alunos</h3>
              <p className="text-text-dark mb-4">
                Acesse simulados preparados pelos seus instrutores, teste seus conhecimentos
                e acompanhe seu progresso de aprendizado.
              </p>
              <ul className="space-y-2 mb-4">
                <li className="flex items-start">
                  <i className="ri-check-line text-accent mt-1 mr-2"></i>
                  <span>Responda questões interativas com imagens e alternativas</span>
                </li>
                <li className="flex items-start">
                  <i className="ri-check-line text-accent mt-1 mr-2"></i>
                  <span>Veja seu resultado detalhado após finalizar</span>
                </li>
                <li className="flex items-start">
                  <i className="ri-check-line text-accent mt-1 mr-2"></i>
                  <span>Acompanhe seu desempenho por categoria</span>
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
