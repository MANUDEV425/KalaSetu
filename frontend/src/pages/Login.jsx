import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabaseClient';

export default function Login() {
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    const { data, error } = await signIn({ email, password });

    if (error) {
      setSubmitting(false);
      setError(error.message);
      return;
    }

    // Fetch the profile directly here rather than relying on AuthContext's
    // profile state - that updates asynchronously via onAuthStateChange and
    // may not be ready yet on this render, which would redirect based on a
    // stale/missing role.
    const userId = data?.user?.id;

    if (!userId) {
      setSubmitting(false);
      navigate('/');
      return;
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single();

    setSubmitting(false);

    if (profileError || !profile) {
      setError('Logged in, but we could not load your profile. Please try again.');
      return;
    }

    navigate(profile.role === 'artisan' ? '/dashboard' : '/');
  }

  return (
    <div className="max-w-md mx-auto mt-12 bg-white p-8 rounded-xl shadow-md">
      <h1 className="text-2xl font-semibold text-kala-700 mb-6">Welcome back</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="email"
          placeholder="Email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-kala-500"
        />
        <input
          type="password"
          placeholder="Password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-kala-500"
        />

        {error && <p className="text-red-600 text-sm">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-kala-600 hover:bg-kala-700 text-white py-2 rounded-md font-medium transition disabled:opacity-60"
        >
          {submitting ? 'Logging in...' : 'Log In'}
        </button>
      </form>

      <p className="text-sm text-gray-500 mt-4 text-center">
        Don't have an account?{' '}
        <Link to="/signup" className="text-kala-600 hover:underline">Sign up</Link>
      </p>
    </div>
  );
}
