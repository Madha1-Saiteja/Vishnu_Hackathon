import React, { useState } from 'react';

function Register() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const { username, email, password } = formData;
    
    if (!username || !email || !password) {
      alert("Please fill in all fields.");
      return;
    }
    
    console.log("Registering user:", { username, email, password });
  };

  return (
    <div className="max-w-md mx-auto mt-80 border-2 border-red-500 p-8 bg-white rounded-lg shadow-lg ">
      <h2 className="text-3xl font-bold mb-6 text-center text-red-600">Register</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-red-600 font-semibold mb-2">Username</label>
          <input
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-red-400 rounded focus:outline-none focus:ring-2 focus:ring-red-500"
            required
          />
        </div>
        <div>
          <label className="block text-red-600 font-semibold mb-2">Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-red-400 rounded focus:outline-none focus:ring-2 focus:ring-red-500"
            required
          />
        </div>
        <div>
          <label className="block text-red-600 font-semibold mb-2">Password</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-red-400 rounded focus:outline-none focus:ring-2 focus:ring-red-500"
            required
          />
        </div>
        <button
          type="submit"
          className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-2 rounded transition duration-200"
        >
          Register
        </button>
      </form>
    </div>
  );
}

export default Register;