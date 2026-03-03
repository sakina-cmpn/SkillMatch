// src/pages/Register.tsx
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [skills, setSkills] = useState('');
  const [semester, setSemester] = useState('');
  const [department, setDepartment] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [hackathonsParticipated, setHackathonsParticipated] = useState('');
  const [skillInput, setSkillInput] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const mergedSkills = [...skills.split(','), skillInput]
        .map(s => s.trim())
        .filter(Boolean)
        .filter((skill, index, arr) => arr.findIndex(s => s.toLowerCase() === skill.toLowerCase()) === index);

      const skillsArray = mergedSkills;

      // register user
      await register({
        name,
        email,
        password,
        skills: skillsArray,
        semester,
        department,
        githubUrl,
        hackathonsParticipated: Number(hackathonsParticipated) || 0,
      });

      // ✅ go to login page after register
      navigate('/login');

    } catch (err: any) {
      setError(err?.response?.data?.error || 'Registration failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const skillTags = [...skills.split(','), skillInput]
    .map(s => s.trim())
    .filter(Boolean)
    .filter((skill, index, arr) => arr.findIndex(s => s.toLowerCase() === skill.toLowerCase()) === index);

  const addSkill = (value: string) => {
    const next = value.trim();
    if (!next) return;

    const existing = skills
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);

    const exists = existing.some(s => s.toLowerCase() === next.toLowerCase());
    if (exists) {
      setSkillInput('');
      return;
    }

    const updated = [...existing, next].join(', ');
    setSkills(updated);
    setSkillInput('');
  };

  const removeSkill = (target: string) => {
    const updated = skills
      .split(',')
      .map(s => s.trim())
      .filter(Boolean)
      .filter(s => s.toLowerCase() !== target.toLowerCase())
      .join(', ');

    setSkills(updated);
  };

  const skillSuggestions = ['React', 'Python', 'DSA', 'Node.js', 'TypeScript', 'UI/UX', 'Machine Learning', 'MongoDB'];

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-10"
      style={{
        background: 'linear-gradient(to bottom right, #F8FAFC, #FFFFFF)',
      }}
    >
      <div
        className="relative w-full max-w-3xl p-6 sm:p-10 rounded-2xl backdrop-blur-xl shadow-xl border border-[#E2E8F0] transition-all duration-500"
        style={{ backgroundColor: 'rgba(255,255,255,0.88)' }}
      >
        {/* Decorative inner glow for glassmorphism depth */}
        <div className="pointer-events-none absolute inset-0 rounded-2xl bg-[radial-gradient(circle_at_top,_rgba(193,232,255,0.28),_transparent_55%)]" />

        <div className="relative z-10">
          {/* Heading */}
          <div className="text-center mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold mb-2 tracking-tight" style={{ color: '#052659' }}>
              Join SkillMatch
            </h1>
            <p className="text-sm sm:text-base" style={{ color: '#64748B' }}>
              Create your account and showcase your skills
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="text-red-600 text-center bg-red-50 border border-red-100 p-3 rounded-lg mb-4 text-sm">
              {error}
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Name */}
              <div className="relative">
                <input
                  name="name"
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder=" "
                  className="peer w-full px-4 pt-6 pb-2.5 rounded-xl border border-[#E2E8F0] focus:border-[#5483B3] focus:ring-2 focus:ring-[#C1E8FF] outline-none bg-white transition-all"
                />
                <label className="absolute left-4 top-2 text-sm text-[#64748B] transition-all
                  peer-placeholder-shown:top-4 peer-placeholder-shown:text-base
                  peer-placeholder-shown:text-[#94A3B8]
                  peer-focus:top-2 peer-focus:text-sm peer-focus:text-[#5483B3]">
                  Full Name
                </label>
              </div>

              {/* Email */}
              <div className="relative">
                <input
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder=" "
                  className="peer w-full px-4 pt-6 pb-2.5 rounded-xl border border-[#E2E8F0] focus:border-[#5483B3] focus:ring-2 focus:ring-[#C1E8FF] outline-none bg-white transition-all"
                />
                <label className="absolute left-4 top-2 text-sm text-[#64748B] transition-all
                  peer-placeholder-shown:top-4 peer-placeholder-shown:text-base
                  peer-placeholder-shown:text-[#94A3B8]
                  peer-focus:top-2 peer-focus:text-sm peer-focus:text-[#5483B3]">
                  Email Address
                </label>
              </div>

              {/* Password */}
              <div className="relative sm:col-span-2">
                <input
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder=" "
                  className="peer w-full px-4 pt-6 pb-2.5 rounded-xl border border-[#E2E8F0] focus:border-[#5483B3] focus:ring-2 focus:ring-[#C1E8FF] outline-none bg-white transition-all"
                />
                <label className="absolute left-4 top-2 text-sm text-[#64748B] transition-all
                  peer-placeholder-shown:top-4 peer-placeholder-shown:text-base
                  peer-placeholder-shown:text-[#94A3B8]
                  peer-focus:top-2 peer-focus:text-sm peer-focus:text-[#5483B3]">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-4 text-sm text-[#5483B3] hover:text-[#052659] transition-colors"
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>

              {/* New Field: Semester */}
              <div className="relative">
                <select
                  name="semester"
                  value={semester}
                  onChange={e => setSemester(e.target.value)}
                  className="w-full px-4 pt-6 pb-2.5 rounded-xl border border-[#E2E8F0] focus:border-[#5483B3] focus:ring-2 focus:ring-[#C1E8FF] outline-none bg-white text-[#052659] transition-all"
                >
                  <option value="">Select semester</option>
                  {Array.from({ length: 8 }, (_, i) => `Semester ${i + 1}`).map((item) => (
                    <option key={item} value={item}>{item}</option>
                  ))}
                </select>
                <label className="absolute left-4 top-2 text-sm text-[#64748B]">Semester</label>
              </div>

              {/* New Field: Department */}
              <div className="relative">
                <select
                  name="department"
                  value={department}
                  onChange={e => setDepartment(e.target.value)}
                  className="w-full px-4 pt-6 pb-2.5 rounded-xl border border-[#E2E8F0] focus:border-[#5483B3] focus:ring-2 focus:ring-[#C1E8FF] outline-none bg-white text-[#052659] transition-all"
                >
                  <option value="">Select department</option>
                  {['Computer Science', 'Information Technology', 'Electronics', 'Mechanical', 'Civil', 'Electrical', 'Chemical'].map((item) => (
                    <option key={item} value={item}>{item}</option>
                  ))}
                </select>
                <label className="absolute left-4 top-2 text-sm text-[#64748B]">Department</label>
              </div>
            </div>

            {/* New Field: GitHub URL */}
            <div className="relative">
              <input
                name="githubUrl"
                type="url"
                value={githubUrl}
                onChange={e => setGithubUrl(e.target.value)}
                placeholder=" "
                className="peer w-full px-4 pt-6 pb-2.5 rounded-xl border border-[#E2E8F0] focus:border-[#5483B3] focus:ring-2 focus:ring-[#C1E8FF] outline-none bg-white transition-all"
              />
              <label className="absolute left-4 top-2 text-sm text-[#64748B] transition-all
                peer-placeholder-shown:top-4 peer-placeholder-shown:text-base
                peer-placeholder-shown:text-[#94A3B8]
                peer-focus:top-2 peer-focus:text-sm peer-focus:text-[#5483B3]">
                GitHub URL
              </label>
              {!githubUrl && (
                <p className="mt-2 text-xs text-[#64748B]">https://github.com/username</p>
              )}
            </div>

            {/* New Field: Number of Hackathons Participated */}
            <div className="relative">
              <input
                name="hackathonsParticipated"
                type="number"
                min={0}
                value={hackathonsParticipated}
                onChange={e => setHackathonsParticipated(e.target.value)}
                placeholder=" "
                className="peer w-full px-4 pt-6 pb-2.5 rounded-xl border border-[#E2E8F0] focus:border-[#5483B3] focus:ring-2 focus:ring-[#C1E8FF] outline-none bg-white transition-all"
              />
              <label className="absolute left-4 top-2 text-sm text-[#64748B] transition-all
                peer-placeholder-shown:top-4 peer-placeholder-shown:text-base
                peer-placeholder-shown:text-[#94A3B8]
                peer-focus:top-2 peer-focus:text-sm peer-focus:text-[#5483B3]">
                Hackathons Participated
              </label>
            </div>

            {/* Skills: Multi-chip input with suggestions */}
            <div className="space-y-3">
              <div className="relative">
                <input
                  name="skills"
                  type="text"
                  value={skillInput}
                  onChange={e => setSkillInput(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter' || e.key === ',') {
                      e.preventDefault();
                      addSkill(skillInput);
                    }
                  }}
                  onBlur={() => addSkill(skillInput)}
                  placeholder=" "
                  className="peer w-full px-4 pt-6 pb-2.5 rounded-xl border border-[#E2E8F0] focus:border-[#5483B3] focus:ring-2 focus:ring-[#C1E8FF] outline-none bg-white transition-all"
                />
                <label className="absolute left-4 top-2 text-sm text-[#64748B] transition-all
                  peer-placeholder-shown:top-4 peer-placeholder-shown:text-base
                  peer-placeholder-shown:text-[#94A3B8]
                  peer-focus:top-2 peer-focus:text-sm peer-focus:text-[#5483B3]">
                  Skills (press Enter or comma)
                </label>
              </div>

              {skillTags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {skillTags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-full bg-[#C1E8FF] text-[#052659] font-medium transition-all duration-200 hover:scale-105 hover:bg-[#C1E8FF]/70"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeSkill(tag)}
                        className="text-[#052659]/70 hover:text-[#052659] leading-none"
                        aria-label={`Remove ${tag}`}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}

              {/* Quick suggestions */}
              <div className="flex flex-wrap gap-2">
                {skillSuggestions.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => addSkill(item)}
                    className="px-3 py-1 text-xs rounded-full border border-[#C1E8FF] text-[#5483B3] bg-[#F8FAFC] hover:bg-[#C1E8FF]/40 transition-all"
                  >
                    + {item}
                  </button>
                ))}
              </div>
            </div>

            {/* Button */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 rounded-xl font-medium text-white transition-all duration-300 transform ${loading
                ? 'bg-[#5483B3]/70 cursor-not-allowed'
                : 'bg-[#5483B3] hover:bg-[#3e6f9e] hover:shadow-lg hover:shadow-[#C1E8FF]/60 hover:scale-[1.02] active:scale-[0.98]'
                } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#C1E8FF]`}
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          {/* Login Link */}
          <div className="text-center text-sm mt-6">
            <span style={{ color: '#052659' }}>Already have an account? </span>
            <Link
              to="/login"
              className="font-medium transition-colors hover:opacity-80"
              style={{ color: '#5483B3' }}
            >
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
