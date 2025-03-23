import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Section from '../components/Section';
import Button from '../components/Button';
import { motion } from 'framer-motion';

const Signup = () => {
  const navigate = useNavigate();
  const [userType, setUserType] = useState('employee'); // 'employee' or 'admin'
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    employeeId: ''
  });
  const [error, setError] = useState('');

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    // Store user data in localStorage (in a real app, this would be a backend API call)
    const userData = {
      ...formData,
      userType,
      id: Date.now().toString()
    };

    try {
      // Get existing users or initialize empty array
      const existingUsers = JSON.parse(localStorage.getItem('users') || '[]');
      
      // Check if email already exists
      if (existingUsers.some(user => user.email === formData.email)) {
        setError('Email already exists');
        return;
      }

      // Add new user
      existingUsers.push(userData);
      localStorage.setItem('users', JSON.stringify(existingUsers));

      // Store current user
      localStorage.setItem('currentUser', JSON.stringify(userData));

      // Redirect based on user type
      if (userType === 'admin') {
        navigate('/admin-dashboard');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setError('Error creating account');
      console.error(err);
    }
  };

  return (
    <Section className="pt-[160px]">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative flex flex-col items-center"
        >
          <div className="relative w-full max-w-[600px] rounded-[20px] border border-n-1/10 bg-n-8/80 p-8 backdrop-blur">
            <h2 className="text-3xl font-bold text-center mb-8">Sign Up</h2>

            {/* User Type Selection */}
            <div className="flex justify-center gap-4 mb-6">
              <Button
                className={userType === 'employee' ? 'bg-primary-1' : 'bg-n-6'}
                onClick={() => setUserType('employee')}
              >
                Employee
              </Button>
              <Button
                className={userType === 'admin' ? 'bg-primary-1' : 'bg-n-6'}
                onClick={() => setUserType('admin')}
              >
                Admin
              </Button>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <input
                type="text"
                name="name"
                placeholder="Full Name"
                value={formData.name}
                onChange={handleInputChange}
                className="input"
                required
              />
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleInputChange}
                className="input"
                required
              />
              {userType === 'employee' && (
                <input
                  type="text"
                  name="employeeId"
                  placeholder="Employee ID"
                  value={formData.employeeId}
                  onChange={handleInputChange}
                  className="input"
                  required
                />
              )}
              <input
                type="password"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleInputChange}
                className="input"
                required
              />
              <input
                type="password"
                name="confirmPassword"
                placeholder="Confirm Password"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className="input"
                required
              />

              {error && (
                <p className="text-red-500 text-center">{error}</p>
              )}

              <Button className="mt-2" type="submit">
                Sign Up
              </Button>
            </form>

            <p className="text-n-4 text-center mt-6">
              Already have an account?{' '}
              <Link to="/login" className="text-primary-1 hover:text-primary-2">
                Log In
              </Link>
            </p>
          </div>
        </motion.div>
      </div>

      <style jsx>{`
        .input {
          width: 100%;
          padding: 12px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          color: white;
          transition: all 0.3s;
        }
        .input:focus {
          border-color: #00bcd4;
          outline: none;
        }
      `}</style>
    </Section>
  );
};

export default Signup;
