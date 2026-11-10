import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { FaEnvelope, FaLock, FaSpinner, FaUser, FaColumns, FaClock, FaChartLine } from 'react-icons/fa';
import axiosInstance, { errorMessage } from '../api/axiosInstance';
import { signIn } from '../auth';

const highlights = [
  { icon: FaColumns, title: 'A board that stays out of your way', body: 'Drag tasks between Priority, Upcoming, In Progress and Completed.' },
  { icon: FaClock, title: 'Focus timer built in', body: 'Run Pomodoro sessions against a task and watch the count fill up.' },
  { icon: FaChartLine, title: 'See where the time went', body: 'Every session and finished task lands in your history.' },
];

function Field({ id, label, icon: Icon, hint, ...input }) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-gunmetal mb-1.5">{label}</label>
      <div className="relative">
        <Icon className="absolute left-4 top-1/2 -translate-y-1/2 text-smoke" aria-hidden="true" />
        <input
          id={id}
          name={id}
          aria-describedby={hint ? `${id}-hint` : undefined}
          className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg bg-white text-gunmetal placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-completed focus:border-transparent transition-shadow"
          {...input}
        />
      </div>
      {hint && <p id={`${id}-hint`} className="mt-1 text-xs text-smoke">{hint}</p>}
    </div>
  );
}

/** Sign in, create an account, or step straight into a seeded demo workspace. */
const AuthPage = ({ mode }) => {
  const registering = mode === 'register';
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [busy, setBusy] = useState(null); // 'form' | 'demo' | null
  const [error, setError] = useState('');

  const change = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  const submit = async (e) => {
    e.preventDefault();
    if (registering && form.password.length < 8) {
      setError('Use a password of at least 8 characters.');
      return;
    }
    setBusy('form');
    try {
      const body = registering ? form : { email: form.email, password: form.password };
      const response = await axiosInstance.post(registering ? '/auth/register' : '/auth/login', body);
      signIn(response.data.data);
      toast.success(registering ? `Welcome, ${response.data.data.user.name}!` : 'Welcome back!');
    } catch (err) {
      setError(errorMessage(err, registering ? 'Could not create the account.' : 'Could not sign in.'));
      setBusy(null);
    }
  };

  const tryDemo = async () => {
    setBusy('demo');
    setError('');
    try {
      const response = await axiosInstance.post('/auth/demo');
      signIn(response.data.data);
      toast.success('Demo workspace ready. Have a look around!');
    } catch (err) {
      setError(errorMessage(err, 'Could not start the demo.'));
      setBusy(null);
    }
  };

  return (
    <div className="min-h-screen bg-sageMist flex items-center justify-center p-4 sm:p-8">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-4xl grid md:grid-cols-2 rounded-2xl overflow-hidden shadow-2xl bg-white"
      >
        <section className="hidden md:flex flex-col justify-between bg-gunmetal text-white p-10">
          <div>
            <div className="flex items-center gap-2 text-2xl font-bold"><span aria-hidden="true" className="grid place-items-center w-9 h-9 rounded-lg bg-completed">✓</span>TaskTrackr</div>
            <p className="mt-4 text-sageMist leading-relaxed">Plan the work on a Kanban board, then do it one focused session at a time.</p>
          </div>
          <ul className="space-y-6 mt-10">
            {highlights.map(({ icon: Icon, title, body }) => (
              <li key={title} className="flex gap-4">
                <span className="grid place-items-center w-10 h-10 shrink-0 rounded-lg bg-white/10"><Icon aria-hidden="true" /></span>
                <div>
                  <p className="font-semibold">{title}</p>
                  <p className="text-sm text-sageMist mt-0.5">{body}</p>
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section className="p-7 sm:p-10">
          <h1 className="text-3xl font-bold text-gunmetal md:hidden mb-1">TaskTrackr</h1>
          <h2 className="text-2xl font-bold text-gunmetal">{registering ? 'Create your account' : 'Welcome back'}</h2>
          <p className="text-smoke mt-1">{registering ? 'It takes a few seconds.' : 'Sign in to pick up where you left off.'}</p>

          <form onSubmit={submit} className="space-y-4 mt-7" noValidate={false}>
            {registering && (
              <Field id="name" label="Name" icon={FaUser} type="text" required maxLength={100} autoComplete="name" placeholder="Your name" value={form.name} onChange={change} />
            )}
            <Field id="email" label="Email" icon={FaEnvelope} type="email" required autoComplete="email" placeholder="you@example.com" value={form.email} onChange={change} />
            <Field
              id="password"
              label="Password"
              icon={FaLock}
              type="password"
              required
              minLength={registering ? 8 : undefined}
              autoComplete={registering ? 'new-password' : 'current-password'}
              placeholder={registering ? 'At least 8 characters' : 'Your password'}
              hint={registering ? 'At least 8 characters.' : undefined}
              value={form.password}
              onChange={change}
            />

            {error && <p role="alert" className="text-sm font-medium text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>}

            <button
              type="submit"
              disabled={busy !== null}
              className="w-full bg-completed text-white py-3 rounded-lg font-semibold hover:bg-primary-700 active:scale-[0.99] transition disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-completed"
            >
              {busy === 'form' && <FaSpinner className="animate-spin" aria-hidden="true" />}
              {registering ? 'Create account' : 'Sign in'}
            </button>
          </form>

          <div className="flex items-center gap-3 my-5 text-xs uppercase tracking-wider text-smoke">
            <span className="h-px flex-1 bg-gray-200" />or<span className="h-px flex-1 bg-gray-200" />
          </div>

          <button
            type="button"
            onClick={tryDemo}
            disabled={busy !== null}
            className="w-full border-2 border-gunmetal text-gunmetal py-3 rounded-lg font-semibold hover:bg-gunmetal hover:text-white transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-gunmetal"
          >
            {busy === 'demo' && <FaSpinner className="animate-spin" aria-hidden="true" />}
            Explore a demo workspace
          </button>
          <p className="mt-2 text-xs text-smoke text-center">No sign-up. Creates a throwaway account with sample tasks.</p>

          <p className="mt-7 text-sm text-smoke text-center">
            {registering ? 'Already have an account? ' : 'New here? '}
            <Link to={registering ? '/login' : '/register'} className="text-completed font-semibold hover:underline">
              {registering ? 'Sign in' : 'Create an account'}
            </Link>
          </p>
        </section>
      </motion.div>
    </div>
  );
};

export default AuthPage;
