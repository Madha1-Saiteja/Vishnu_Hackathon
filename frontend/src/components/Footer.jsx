import { FaFacebookF, FaTwitter, FaLinkedinIn } from 'react-icons/fa';

export default function Footer() {
  return (
    <footer className="bg-red-600 text-white py-6">
      <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center">
        <div className="mb-4 md:mb-0">
          <h2 className="text-2xl font-bold">MediDoc AI</h2>
          <p className="text-gray-300">Revolutionizing Medical Documentation</p>
        </div>
        <div className="flex space-x-6">
          <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="hover:text-red-600">
            <FaFacebookF />
          </a>
          <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="hover:text-red-600">
            <FaTwitter />
          </a>
          <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="hover:text-red-600">
            <FaLinkedinIn />
          </a>
        </div>
      </div>
      <div className="mt-4 text-center text-gray-300">
        &copy; 2025 MediDoc AI. All rights reserved.
      </div>
    </footer>
  );
}