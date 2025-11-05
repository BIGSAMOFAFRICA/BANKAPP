import { useState, FormEvent } from 'react';
import { useMutation } from '@apollo/client';
import { SIGNUP_USER } from '@/lib/graphql/types';
import { useRouter } from 'next/router';
import { setToken, removeToken } from '@/lib/auth';
import client from '@/lib/apolloClient';

export default function Signup() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    age: '',
    gender: '',
    occupation: '',
    incomeRange: '',
    password: '',
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const [signup, { loading: signupLoading }] = useMutation(SIGNUP_USER, {
    onCompleted: (data) => {
      // Replace any previous session and reset Apollo cache
      removeToken();
      setToken(data.signupUser.token);
      try {
        client.clearStore();
        client.resetStore();
      } catch {}
      
      alert(
        `Account created successfully! Your account number is: ${data.signupUser.user.accountNumber}`
      );
      router.replace('/dashboard');
    },
    onError: (error) => {
      alert(`Error: ${error.message}`);
    },
  });

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: '',
      });
    }
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Full name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.age) {
      newErrors.age = 'Age is required';
    } else if (parseInt(formData.age) < 18 || parseInt(formData.age) > 120) {
      newErrors.age = 'Age must be between 18 and 120';
    }

    if (!formData.gender) {
      newErrors.gender = 'Please select your gender';
    }

    if (!formData.occupation) {
      newErrors.occupation = 'Please select your occupation';
    }

    if (!formData.incomeRange) {
      newErrors.incomeRange = 'Please select your income range';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    signup({
      variables: {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        age: parseInt(formData.age),
        gender: formData.gender || undefined,
        occupation: formData.occupation || undefined,
        incomeRange: formData.incomeRange || undefined,
      },
    });
  };

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Create your account</h1>
          <p className="text-slate-600">Join BIGSAMOFAFRICA BANK for simple, secure banking</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 md:p-10">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Full Name */}
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-slate-700 mb-2"
              >
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all ${
                  errors.name ? 'border-red-500' : 'border-slate-300'
                }`}
                placeholder="Enter your full name"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-slate-700 mb-2"
              >
                Email Address <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all ${
                  errors.email ? 'border-red-500' : 'border-slate-300'
                }`}
                placeholder="your.email@example.com"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
              )}
            </div>

            {/* Age */}
            <div>
              <label
                htmlFor="age"
                className="block text-sm font-medium text-slate-700 mb-2"
              >
                Age <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                id="age"
                name="age"
                min="18"
                max="120"
                value={formData.age}
                onChange={handleChange}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all ${
                  errors.age ? 'border-red-500' : 'border-slate-300'
                }`}
                placeholder="Enter your age"
              />
              {errors.age && (
                <p className="mt-1 text-sm text-red-600">{errors.age}</p>
              )}
            </div>

            {/* Gender */}
            <div>
              <label
                htmlFor="gender"
                className="block text-sm font-medium text-slate-700 mb-2"
              >
                Gender <span className="text-red-500">*</span>
              </label>
              <select
                id="gender"
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all ${
                  errors.gender ? 'border-red-500' : 'border-slate-300'
                }`}
              >
                <option value="">Select your gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
              {errors.gender && (
                <p className="mt-1 text-sm text-red-600">{errors.gender}</p>
              )}
            </div>

            {/* Occupation */}
            <div>
              <label
                htmlFor="occupation"
                className="block text-sm font-medium text-slate-700 mb-2"
              >
                Occupation <span className="text-red-500">*</span>
              </label>
              <select
                id="occupation"
                name="occupation"
                value={formData.occupation}
                onChange={handleChange}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all ${
                  errors.occupation ? 'border-red-500' : 'border-slate-300'
                }`}
              >
                <option value="">Select your occupation</option>
                <option value="Student">Student</option>
                <option value="Civil Servant">Civil Servant</option>
                <option value="Business Owner">Business Owner</option>
                <option value="Engineer">Engineer</option>
                <option value="Other">Other</option>
              </select>
              {errors.occupation && (
                <p className="mt-1 text-sm text-red-600">{errors.occupation}</p>
              )}
            </div>

            {/* Income Range */}
            <div>
              <label
                htmlFor="incomeRange"
                className="block text-sm font-medium text-slate-700 mb-2"
              >
                Income Range <span className="text-red-500">*</span>
              </label>
              <select
                id="incomeRange"
                name="incomeRange"
                value={formData.incomeRange}
                onChange={handleChange}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all ${
                  errors.incomeRange ? 'border-red-500' : 'border-slate-300'
                }`}
              >
                <option value="">Select your income range</option>
                <option value="Below ₦50,000">Below ₦50,000</option>
                <option value="₦50,000–₦100,000">₦50,000–₦100,000</option>
                <option value="₦100,000–₦500,000">₦100,000–₦500,000</option>
                <option value="Above ₦500,000">Above ₦500,000</option>
              </select>
              {errors.incomeRange && (
                <p className="mt-1 text-sm text-red-600">{errors.incomeRange}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-slate-700 mb-2"
              >
                Password <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all ${
                  errors.password ? 'border-red-500' : 'border-slate-300'
                }`}
                placeholder="Enter your password (min. 6 characters)"
              />
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={signupLoading}
              className="w-full px-6 py-4 bg-slate-900 text-white font-semibold rounded-lg hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {signupLoading ? 'Creating Account…' : 'Create Account'}
            </button>

            <p className="text-sm text-slate-600 text-center">
              Already have an account?{' '}
              <a href="/login" className="text-slate-900 hover:underline">
                Login here
              </a>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
