import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiMail, FiLock, FiUser, FiGlobe } from 'react-icons/fi';
import { FaUserPlus,FaBuilding } from 'react-icons/fa';
import Input from '../components/Common/Input';
import Button from '../components/Common/Button';
import toast from 'react-hot-toast';

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    tenantName: '',
    subdomain: '',
    adminEmail: '',
    adminPassword: '',
    adminFullName: '',
  });

  const handleChange = (e) => {
    let value = e.target.value;
    if (e.target.name === 'subdomain') {
      value = value.toLowerCase().replace(/[^a-z0-9-]/g, '');
    }
    setFormData({ ...formData, [e.target.name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await register(formData);
      navigate('/login');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary-500 via-secondary-600 to-primary-600 flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-2xl p-8 animate-slide-up">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-secondary-600 to-primary-600 bg-clip-text text-transparent">
              Create Account
            </h2>
            <p className="text-gray-600 mt-2">Start your free trial today</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="Organization Name"
              name="tenantName"
              value={formData.tenantName}
              onChange={handleChange}
              placeholder="Acme Inc."
              icon={FaBuilding}
              required
            />

            <div>
              <Input
                label="Subdomain"
                name="subdomain"
                value={formData.subdomain}
                onChange={handleChange}
                placeholder="acme"
                icon={FiGlobe}
                required
              />
              <p className="mt-1 text-xs text-gray-500">
                Your URL: {formData.subdomain || 'acme'}.yourapp.com
              </p>
            </div>

            <Input
              label="Admin Full Name"
              name="adminFullName"
              value={formData.adminFullName}
              onChange={handleChange}
              placeholder="John Doe"
              icon={FiUser}
              required
            />

            <Input
              label="Admin Email"
              name="adminEmail"
              type="email"
              value={formData.adminEmail}
              onChange={handleChange}
              placeholder="admin@acme.com"
              icon={FiMail}
              required
            />

            <Input
              label="Password"
              name="adminPassword"
              type="password"
              value={formData.adminPassword}
              onChange={handleChange}
              placeholder="Min. 8 characters"
              icon={FiLock}
              required
            />

            <Button
              type="submit"
              variant="primary"
              className="w-full"
              loading={loading}
            >
              <FaUserPlus />
              Create Account
            </Button>
          </form>

          <p className="text-center mt-6 text-sm text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="text-primary-600 font-medium hover:text-primary-700">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
