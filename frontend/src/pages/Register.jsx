
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiMail, FiLock, FiUser, FiGlobe, FiEye, FiEyeOff } from 'react-icons/fi';
import { FaUserPlus, FaBuilding } from 'react-icons/fa';
import Input from '../components/Common/Input';
import Button from '../components/Common/Button';
import toast from 'react-hot-toast';
import { getErrorMessage } from '../utils/helpers';

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    tenantName: '',
    subdomain: '',
    adminEmail: '',
    adminPassword: '',
    confirmPassword: '',
    adminFullName: '',
    agreedToTerms: false,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    let newValue = type === 'checkbox' ? checked : value;

    if (name === 'subdomain') {
      newValue = newValue.toLowerCase().replace(/[^a-z0-9-]/g, '');
    }

    setFormData({ ...formData, [name]: newValue });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.adminPassword !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (!formData.agreedToTerms) {
      toast.error('You must agree to the Terms & Conditions');
      return;
    }

    setLoading(true);

    try {
      const { confirmPassword, agreedToTerms, ...apiData } = formData;
      await register(apiData);
      navigate('/login');
    } catch (error) {
      toast.error(getErrorMessage(error, 'Registration failed'));
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => setShowPassword(!showPassword);
  const toggleConfirmPasswordVisibility = () => setShowConfirmPassword(!showConfirmPassword);

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

            <div className="relative">
              <Input
                label="Password"
                name="adminPassword"
                type={showPassword ? "text" : "password"}
                value={formData.adminPassword}
                onChange={handleChange}
                placeholder="Min. 8 characters"
                icon={FiLock}
                required
              />
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="absolute right-3 top-[34px] text-gray-500 hover:text-gray-700 focus:outline-none"
              >
                {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
              </button>
            </div>

            <div className="relative">
              <Input
                label="Confirm Password"
                name="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Repeat password"
                icon={FiLock}
                required
              />
              <button
                type="button"
                onClick={toggleConfirmPasswordVisibility}
                className="absolute right-3 top-[34px] text-gray-500 hover:text-gray-700 focus:outline-none"
              >
                {showConfirmPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
              </button>
            </div>

            <div className="flex items-center">
              <input
                id="agreedToTerms"
                name="agreedToTerms"
                type="checkbox"
                checked={formData.agreedToTerms}
                onChange={handleChange}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label htmlFor="agreedToTerms" className="ml-2 block text-sm text-gray-900">
                I agree to the <a href="#" className="text-primary-600 hover:underline">Terms & Conditions</a>
              </label>
            </div>

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
