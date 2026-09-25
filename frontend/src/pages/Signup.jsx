import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Signup() {
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    fullName: '',
    email: '',
    password: '',
    role: 'artisan',
    shopName: '',
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  function updateField(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    const { error } = await signUp({
      email: form.email,
      password: form.password,
      fullName: form.fullName,
      role: form.role,
      shopName: form.shopName,
    });

    setSubmitting(false);

    if (error) {
      setError(error.message);
      return;
    }

    navigate(form.role === 'artisan' ? '/dashboard' : '/');
  }

  return (
    <div className="max-w-md mx-auto mt-12 bg-white p-8 rounded-xl shadow-md">
      <h1 className="text-2xl font-semibold text-kala-700 mb-6">Create your KalaSetu account</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => updateField('role', 'artisan')}
            className={`flex-1 py-2 rounded-md border text-sm font-medium ${
              form.role === 'artisan'
                ? 'bg-kala-600 text-white border-kala-600'
                : 'bg-white text-gray-600 border-gray-300'
            }`}
          >
            I'm an Artisan
          </button>
          <button
            type="button"
            onClick={() => updateField('role', 'customer')}
            className={`flex-1 py-2 rounded-md border text-sm font-medium ${
              form.role === 'customer'
                ? 'bg-kala-600 text-white border-kala-600'
                : 'bg-white text-gray-600 border-gray-300'
            }`}
          >
            I'm a Customer
          </button>
        </div>

        <input
          type="text"
          placeholder="Full name"
          required
          value={form.fullName}
          onChange={(e) => updateField('fullName', e.target.value)}
          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-kala-500"
        />

        {form.role === 'artisan' && (
          <input
            type="text"
            placeholder="Shop / craft name"
            value={form.shopName}
            onChange={(e) => updateField('shopName', e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-kala-500"
          />
        )}

        <input
          type="email"
          placeholder="Email"
          required
          value={form.email}
          onChange={(e) => updateField('email', e.target.value)}
          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-kala-500"
        />

        <input
          type="password"
          placeholder="Password (min 6 characters)"
          required
          minLength={6}
          value={form.password}
          onChange={(e) => updateField('password', e.target.value)}
          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-kala-500"
        />

        {error && <p className="text-red-600 text-sm">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-kala-600 hover:bg-kala-700 text-white py-2 rounded-md font-medium transition disabled:opacity-60"
        >
          {submitting ? 'Creating account...' : 'Sign Up'}
        </button>
      </form>

      <p className="text-sm text-gray-500 mt-4 text-center">
        Already have an account?{' '}
        <Link to="/login" className="text-kala-600 hover:underline">Log in</Link>
      </p>
    </div>
  );
}
