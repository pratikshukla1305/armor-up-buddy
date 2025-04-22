
import React from 'react';
import { Link } from 'react-router-dom';
import { Shield } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-shield-light py-12 border-t border-shield-border">
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center space-x-2 mb-4">
              <Shield className="h-6 w-6 text-shield-blue" />
              <span className="text-xl font-semibold">Shield</span>
            </Link>
            <p className="text-gray-600 mb-6 max-w-md">
              Revolutionizing crime reporting and evidence management with advanced AI analysis and secure data protection.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="w-8 h-8 rounded-full bg-white border border-shield-border flex items-center justify-center hover:border-shield-blue transition-all">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.46 6C21.69 6.35 20.86 6.58 20 6.69C20.88 6.16 21.56 5.32 21.88 4.31C21.05 4.81 20.13 5.16 19.16 5.36C18.37 4.5 17.26 4 16 4C13.65 4 11.73 5.92 11.73 8.29C11.73 8.63 11.77 8.96 11.84 9.27C8.28 9.09 5.11 7.38 3 4.79C2.63 5.42 2.42 6.16 2.42 6.94C2.42 8.43 3.17 9.75 4.33 10.5C3.62 10.5 2.96 10.3 2.38 10V10.03C2.38 12.11 3.86 13.85 5.82 14.24C5.19 14.41 4.53 14.42 3.89 14.28C4.16 15.14 4.7 15.9 5.45 16.44C6.2 16.98 7.11 17.27 8.05 17.27C6.26 18.69 3.98 19.38 2 19.18C3.9 20.55 6.16 21.27 8.46 21.25C16 21.25 20.33 15 20.33 9.53C20.33 9.34 20.33 9.15 20.32 8.97C21.16 8.36 21.88 7.6 22.46 6.71V6Z" fill="#007AFF" />
                </svg>
              </a>
              <a href="#" className="w-8 h-8 rounded-full bg-white border border-shield-border flex items-center justify-center hover:border-shield-blue transition-all">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M18 2H15C13.6739 2 12.4021 2.52678 11.4645 3.46447C10.5268 4.40215 10 5.67392 10 7V10H7V14H10V22H14V14H17L18 10H14V7C14 6.73478 14.1054 6.48043 14.2929 6.29289C14.4804 6.10536 14.7348 6 15 6H18V2Z" fill="#007AFF" />
                </svg>
              </a>
              <a href="#" className="w-8 h-8 rounded-full bg-white border border-shield-border flex items-center justify-center hover:border-shield-blue transition-all">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M16 8C17.5913 8 19.1174 8.63214 20.2426 9.75736C21.3679 10.8826 22 12.4087 22 14V21H18V14C18 13.4696 17.7893 12.9609 17.4142 12.5858C17.0391 12.2107 16.5304 12 16 12C15.4696 12 14.9609 12.2107 14.5858 12.5858C14.2107 12.9609 14 13.4696 14 14V21H10V14C10 12.4087 10.6321 10.8826 11.7574 9.75736C12.8826 8.63214 14.4087 8 16 8Z" fill="#007AFF" />
                  <path d="M6 9H2V21H6V9Z" fill="#007AFF" />
                  <path d="M4 6C5.10457 6 6 5.10457 6 4C6 2.89543 5.10457 2 4 2C2.89543 2 2 2.89543 2 4C2 5.10457 2.89543 6 4 6Z" fill="#007AFF" />
                </svg>
              </a>
              <a href="#" className="w-8 h-8 rounded-full bg-white border border-shield-border flex items-center justify-center hover:border-shield-blue transition-all">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2C14.717 2 15.056 2.01 16.122 2.06C17.187 2.11 17.912 2.277 18.55 2.525C19.21 2.779 19.766 3.123 20.322 3.678C20.8305 4.1779 21.224 4.78259 21.475 5.45C21.722 6.087 21.89 6.813 21.94 7.878C21.987 8.944 22 9.283 22 12C22 14.717 21.99 15.056 21.94 16.122C21.89 17.187 21.722 17.912 21.475 18.55C21.2247 19.2178 20.8311 19.8226 20.322 20.322C19.822 20.8303 19.2173 21.2238 18.55 21.475C17.913 21.722 17.187 21.89 16.122 21.94C15.056 21.987 14.717 22 12 22C9.283 22 8.944 21.99 7.878 21.94C6.813 21.89 6.088 21.722 5.45 21.475C4.78233 21.2245 4.17753 20.8309 3.678 20.322C3.16941 19.8222 2.77593 19.2175 2.525 18.55C2.277 17.913 2.11 17.187 2.06 16.122C2.013 15.056 2 14.717 2 12C2 9.283 2.01 8.944 2.06 7.878C2.11 6.812 2.277 6.088 2.525 5.45C2.77524 4.78218 3.1688 4.17732 3.678 3.678C4.17767 3.16923 4.78243 2.77573 5.45 2.525C6.088 2.277 6.812 2.11 7.878 2.06C8.944 2.013 9.283 2 12 2ZM12 7C10.6739 7 9.40215 7.52678 8.46447 8.46447C7.52678 9.40215 7 10.6739 7 12C7 13.3261 7.52678 14.5979 8.46447 15.5355C9.40215 16.4732 10.6739 17 12 17C13.3261 17 14.5979 16.4732 15.5355 15.5355C16.4732 14.5979 17 13.3261 17 12C17 10.6739 16.4732 9.40215 15.5355 8.46447C14.5979 7.52678 13.3261 7 12 7ZM18.5 6.75C18.5 6.41848 18.3683 6.10054 18.1339 5.86612C17.8995 5.6317 17.5815 5.5 17.25 5.5C16.9185 5.5 16.6005 5.6317 16.3661 5.86612C16.1317 6.10054 16 6.41848 16 6.75C16 7.08152 16.1317 7.39946 16.3661 7.63388C16.6005 7.8683 16.9185 8 17.25 8C17.5815 8 17.8995 7.8683 18.1339 7.63388C18.3683 7.39946 18.5 7.08152 18.5 6.75ZM12 9C12.7956 9 13.5587 9.31607 14.1213 9.87868C14.6839 10.4413 15 11.2044 15 12C15 12.7956 14.6839 13.5587 14.1213 14.1213C13.5587 14.6839 12.7956 15 12 15C11.2044 15 10.4413 14.6839 9.87868 14.1213C9.31607 13.5587 9 12.7956 9 12C9 11.2044 9.31607 10.4413 9.87868 9.87868C10.4413 9.31607 11.2044 9 12 9Z" fill="#007AFF" />
                </svg>
              </a>
            </div>
          </div>
          
          <div>
            <h4 className="text-sm font-semibold text-gray-900 uppercase mb-4">Product</h4>
            <ul className="space-y-2">
              <li><Link to="/" className="text-gray-600 hover:text-shield-blue transition-colors">Features</Link></li>
              <li><Link to="/" className="text-gray-600 hover:text-shield-blue transition-colors">Pricing</Link></li>
              <li><Link to="/" className="text-gray-600 hover:text-shield-blue transition-colors">Security</Link></li>
              <li><Link to="/" className="text-gray-600 hover:text-shield-blue transition-colors">AI Analysis</Link></li>
              <li><Link to="/" className="text-gray-600 hover:text-shield-blue transition-colors">Evidence Management</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-sm font-semibold text-gray-900 uppercase mb-4">Resources</h4>
            <ul className="space-y-2">
              <li><Link to="/" className="text-gray-600 hover:text-shield-blue transition-colors">Documentation</Link></li>
              <li><Link to="/" className="text-gray-600 hover:text-shield-blue transition-colors">API Reference</Link></li>
              <li><Link to="/" className="text-gray-600 hover:text-shield-blue transition-colors">Guides</Link></li>
              <li><Link to="/" className="text-gray-600 hover:text-shield-blue transition-colors">Support</Link></li>
              <li><Link to="/" className="text-gray-600 hover:text-shield-blue transition-colors">Community</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-sm font-semibold text-gray-900 uppercase mb-4">Company</h4>
            <ul className="space-y-2">
              <li><Link to="/" className="text-gray-600 hover:text-shield-blue transition-colors">About Us</Link></li>
              <li><Link to="/" className="text-gray-600 hover:text-shield-blue transition-colors">Blog</Link></li>
              <li><Link to="/" className="text-gray-600 hover:text-shield-blue transition-colors">Careers</Link></li>
              <li><Link to="/" className="text-gray-600 hover:text-shield-blue transition-colors">Press</Link></li>
              <li><Link to="/" className="text-gray-600 hover:text-shield-blue transition-colors">Contact</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="mt-12 pt-8 border-t border-shield-border flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-600 text-sm mb-4 md:mb-0">
            &copy; {new Date().getFullYear()} Shield. All rights reserved.
          </p>
          <div className="flex space-x-6">
            <Link to="/" className="text-sm text-gray-600 hover:text-shield-blue transition-colors">Privacy Policy</Link>
            <Link to="/" className="text-sm text-gray-600 hover:text-shield-blue transition-colors">Terms of Service</Link>
            <Link to="/" className="text-sm text-gray-600 hover:text-shield-blue transition-colors">Cookies</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
