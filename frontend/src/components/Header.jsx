import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';


function Header() {
  

  return (
    <header className="fixed top-0 left-0 w-full z-50 bg-white shadow-lg p-4 flex flex-wrap justify-between items-center px-8">
      <motion.div
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 1 }}
      >
        <div className="flex items-center">
          <img
            src="../src/assets/logo.png"
            alt="MediDoc AI Logo"
            className="w-20 h-14"
          />
          <Link to="/" className="text-3xl font-bold text-red-600">
            MediDoc AI
          </Link>
        </div>
      </motion.div>

      <nav className="space-x-20 flex flex-wrap text-lg items-center">
        <Link to="/login" className="hover:text-red-600">
          Sign in
        </Link>
        <Link to="/signup" className="hover:text-red-600">
          Sign up
        </Link>
        <Link to="/analyze" className="bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700">
          Analyze report
        </Link>
        <Link to="/form">
          <button className="bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700">
            Transcribe
          </button>
        </Link>
        {/* Optional: Add a link to trigger document upload */}
        {/* <Link to="/document-upload" className="hover:text-red-600">
          Upload Document
        </Link> */}
      </nav>

    </header>
  );
}

export default Header;