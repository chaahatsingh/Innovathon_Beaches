import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Section from '../components/Section';
import Button from '../components/Button';
import { motion } from 'framer-motion';

const Login = () => {
  const navigate = useNavigate();
  const [userType, setUserType] = useState('employee');
  const [formData, setFormData] = useState({
    email: '',
    password: ''
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

    try {
      // Get users from localStorage
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      
      // Find user with matching email and password
      const user = users.find(u => 
        u.email === formData.email && 
        u.password === formData.password &&
        u.userType === userType
      );

      if (!user) {
        setError('Invalid credentials or wrong user type');
        return;
      }

      // Store current user
      localStorage.setItem('currentUser', JSON.stringify(user));

      // Redirect based on user type
      if (user.userType === 'admin') {
        navigate('/admin-dashboard');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setError('Error logging in');
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
            <h2 className="text-3xl font-bold text-center mb-8">Log In</h2>

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
                type="email"
                name="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleInputChange}
                className="input"
                required
              />
              <input
                type="password"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleInputChange}
                className="input"
                required
              />

              {error && (
                <p className="text-red-500 text-center">{error}</p>
              )}

              <Button className="mt-2" type="submit">
                Log In
              </Button>
            </form>

            <p className="text-n-4 text-center mt-6">
              Don't have an account?{' '}
              <Link to="/signup" className="text-primary-1 hover:text-primary-2">
                Sign Up
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

export default Login;
