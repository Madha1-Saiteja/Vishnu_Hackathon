import React from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom';
// import { Link } from 'react-router-dom'
// function Header() {
//   return (
//     <div className='h-20 flex items-center justify-between bg-[#db310f] px-20'>
//       <h1 className='fonts text-white text-3xl'>
//         My Website
//       </h1>
//       <ul className='flex text-white text-xl gap-20 items-center'>
//         <Link to={'/login'}>Sign in</Link>
//         <Link to={'/signup'} className='border py-2 px-4 hover:bg-red-700 rounded-md'>Sign up</Link>
//       </ul>
//     </div>
//   )
// }
// export default Header

function Header() {
  return (
    <header className="fixed top-0 left-0 w-full z-50 bg-white shadow-lg p-4 flex flex-wrap justify-between items-center px-8">
      <motion.div
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 1 }}
      >
      <div className='flex items-center'>
      <img src="../src/assets/logo.png" alt="" className="flex items-center  justify-centerw-20 h-14" />
        <Link to="/" className="text-3xl font-bold text-red-600">MediDoc AI</Link>
      </div>
      </motion.div>
      <nav className="space-x-20 flex flex-wrap text-lg items-center">
        <Link to="/login" className="hover:text-red-600">Sign in</Link>
        <Link to="/signup" className="hover:text-red-600">Sign up</Link>  
        <Link to="form" className="">
          <button className="bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700">
            Transcribe
          </button>
        </Link>      
      </nav>
    </header>
  );
}

export default Header;