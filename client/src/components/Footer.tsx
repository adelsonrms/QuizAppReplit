import React from 'react';
import { Link } from 'wouter';

const Footer: React.FC = () => {
  return (
    <footer className="bg-primary text-secondary py-8 mt-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="font-poppins font-semibold text-lg mb-4">AMS-QUIZ</h3>
            <p className="mb-4 text-sm opacity-80">Plataforma de simulados online especializada em conteúdo sobre as Ilhas Cayman.</p>
            <div className="flex space-x-4">
              <a href="#" className="text-secondary hover:text-accent transition-colors">
                <i className="ri-facebook-fill text-xl"></i>
              </a>
              <a href="#" className="text-secondary hover:text-accent transition-colors">
                <i className="ri-instagram-line text-xl"></i>
              </a>
              <a href="#" className="text-secondary hover:text-accent transition-colors">
                <i className="ri-twitter-fill text-xl"></i>
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="font-poppins font-semibold text-lg mb-4">Links Rápidos</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/about">
                  <a className="text-secondary hover:text-accent transition-colors">Sobre Nós</a>
                </Link>
              </li>
              <li>
                <Link href="/courses">
                  <a className="text-secondary hover:text-accent transition-colors">Cursos</a>
                </Link>
              </li>
              <li>
                <Link href="/resources">
                  <a className="text-secondary hover:text-accent transition-colors">Recursos</a>
                </Link>
              </li>
              <li>
                <Link href="/faq">
                  <a className="text-secondary hover:text-accent transition-colors">FAQ</a>
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-poppins font-semibold text-lg mb-4">Contato</h3>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start">
                <i className="ri-mail-line mr-2 mt-1"></i>
                <span>contato@amsquiz.com</span>
              </li>
              <li className="flex items-start">
                <i className="ri-phone-line mr-2 mt-1"></i>
                <span>+55 (11) 9999-8888</span>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-secondary border-opacity-20 mt-8 pt-6 text-center text-sm opacity-80">
          <p>&copy; {new Date().getFullYear()} AMS-QUIZ. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
