import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { API_BASE_URL } from "../../config/api";

export default function Profile() {
  const { logout, user: authUser } = useAuth();
  const cachedUser =
    authUser ||
    (() => {
      try {
        return JSON.parse(localStorage.getItem("user") || "null");
      } catch {
        return null;
      }
    })();

  const [user, setUser] = useState<any>(cachedUser);
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(cachedUser?.name || "");
  const [skillsText, setSkillsText] = useState(
    cachedUser?.skills?.join(", ") || ""
  );
  const [semester, setSemester] = useState(cachedUser?.semester || "");
  const [department, setDepartment] = useState(cachedUser?.department || "");
  const [githubUrl, setGithubUrl] = useState(cachedUser?.githubUrl || "");
  const [hackathonsParticipated, setHackathonsParticipated] = useState(
    String(cachedUser?.hackathonsParticipated ?? 0)
  );
  const [photoPreview, setPhotoPreview] = useState(cachedUser?.photoUrl || "");
  const [loading, setLoading] = useState(!cachedUser);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");

  // ✅ Fetch profile from backend
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/profile`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();

        setUser(data);
        setName(data.name);
        setSkillsText(data.skills?.join(", ") || "");
        setSemester(data.semester || "");
        setDepartment(data.department || "");
        setGithubUrl(data.githubUrl || "");
        setHackathonsParticipated(
          String(data.hackathonsParticipated ?? data.hackathons ?? 0)
        );
        setPhotoPreview(data.photoUrl || "");
      } catch (err) {
        setError("Failed to load profile");
      } finally {
        setLoading(false);
      }
    };

    if (token) fetchProfile();
    else setLoading(false);
  }, [token]);

  // ✅ Save profile (frontend only for now)
  const handleSave = async () => {
    setSaving(true);

    try {
      const skillsArray = skillsText
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      setUser({
        ...user,
        name,
        skills: skillsArray,
        semester,
        department,
        githubUrl,
        hackathonsParticipated: Number(hackathonsParticipated) || 0,
        photoUrl: photoPreview,
      });

      setEditing(false);
      alert("Profile updated!");
    } catch {
      setError("Failed to save");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center text-xl mt-10 text-[#052659]">
        Loading profile...
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center text-xl mt-10 text-red-600">
        Please login first
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-120px)] bg-gradient-to-b from-[#F8FAFC] to-[#FFFFFF] px-4 py-10 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="relative overflow-hidden bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-[#E2E8F0] p-6 sm:p-8 lg:p-10 ring-1 ring-[#C1E8FF]/40">
          {/* Decorative inner glow for premium glass-like card depth */}
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(193,232,255,0.28),_transparent_55%)]" />

          {/* Header */}
          <div className="relative z-10 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between mb-8">
            <div className="flex items-center gap-4 sm:gap-5">
              {/* New visual field: profile avatar with preview */}
              <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-full border-2 border-[#C1E8FF] bg-gradient-to-br from-[#C1E8FF]/60 to-white flex items-center justify-center text-[#052659] text-xl sm:text-2xl font-bold shadow-sm overflow-hidden">
                {photoPreview ? (
                  <img src={photoPreview} alt="Profile" className="h-full w-full object-cover" />
                ) : (
                  user?.name?.[0]?.toUpperCase() || "U"
                )}
              </div>
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#052659]">
                  My SkillMatch Profile
                </h1>
                <p className="text-sm sm:text-base text-[#64748B] mt-1">
                  Manage your public profile and collaboration details
                </p>
              </div>
            </div>

            {!editing && (
              <button
                onClick={() => setEditing(true)}
                className="px-5 py-2.5 rounded-xl bg-[#5483B3] text-white font-medium shadow-md shadow-[#5483B3]/25 transition-all duration-200 hover:bg-[#3e6f9e] hover:scale-[1.02] hover:shadow-lg hover:shadow-[#C1E8FF]/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C1E8FF] focus-visible:ring-offset-2"
              >
                Edit Profile
              </button>
            )}
          </div>

          {error && (
            <div className="relative z-10 bg-red-50 text-red-600 p-3 rounded-lg mb-4 border border-red-100">
              {error}
            </div>
          )}

          {editing ? (
            <div className="relative z-10 space-y-6 animate-in fade-in duration-200">
              {/* New field: change profile photo */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="h-20 w-20 rounded-full border-2 border-[#C1E8FF] overflow-hidden bg-[#F8FAFC] flex items-center justify-center text-[#052659] font-semibold">
                  {photoPreview ? (
                    <img src={photoPreview} alt="Preview" className="h-full w-full object-cover" />
                  ) : (
                    user?.name?.[0]?.toUpperCase() || "U"
                  )}
                </div>
                <label className="inline-flex items-center justify-center px-4 py-2.5 rounded-xl bg-[#C1E8FF]/50 text-[#052659] border border-[#C1E8FF] cursor-pointer hover:bg-[#C1E8FF]/70 transition-all duration-200">
                  Change Photo
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        setPhotoPreview(String(reader.result || ""));
                      };
                      reader.readAsDataURL(file);
                    }}
                  />
                </label>
              </div>

              {/* Name */}
              <div className="relative">
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder=" "
                  className="peer w-full px-4 pt-6 pb-2.5 rounded-xl border border-[#E2E8F0] bg-white text-[#052659] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#C1E8FF] focus:border-[#C1E8FF]"
                />
                {/* Floating label styling only */}
                <label className="absolute left-4 top-2 text-xs font-medium tracking-wide text-[#64748B] transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-sm peer-placeholder-shown:text-[#94A3B8] peer-focus:top-2 peer-focus:text-xs peer-focus:text-[#5483B3]">
                  Name
                </label>
              </div>

              {/* Skills */}
              <div className="relative">
                <input
                  value={skillsText}
                  onChange={(e) => setSkillsText(e.target.value)}
                  placeholder=" "
                  className="peer w-full px-4 pt-6 pb-2.5 rounded-xl border border-[#E2E8F0] bg-white text-[#052659] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#C1E8FF] focus:border-[#C1E8FF]"
                />
                {/* Floating label styling only */}
                <label className="absolute left-4 top-2 text-xs font-medium tracking-wide text-[#64748B] transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-sm peer-placeholder-shown:text-[#94A3B8] peer-focus:top-2 peer-focus:text-xs peer-focus:text-[#5483B3]">
                  Skills
                </label>
              </div>

              {/* Skill preview pills from existing comma-separated input */}
              <div className="flex flex-wrap gap-2 -mt-1">
                {skillsText
                  .split(",")
                  .map((s) => s.trim())
                  .filter(Boolean)
                  .map((skill, i) => (
                    <span
                      key={`${skill}-${i}`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm bg-[#C1E8FF] text-[#052659] transition-all duration-200 hover:bg-[#C1E8FF]/70 hover:-translate-y-0.5"
                    >
                      {skill}
                      <span className="text-[#052659]/70 text-xs">×</span>
                    </span>
                  ))}
              </div>

              {/* New field: Semester */}
              <div className="relative">
                <select
                  value={semester}
                  onChange={(e) => setSemester(e.target.value)}
                  className="w-full px-4 pt-6 pb-2.5 rounded-xl border border-[#E2E8F0] bg-white text-[#052659] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#C1E8FF] focus:border-[#C1E8FF]"
                >
                  <option value="">Select semester</option>
                  {Array.from({ length: 8 }, (_, i) => `Semester ${i + 1}`).map((item) => (
                    <option key={item} value={item}>{item}</option>
                  ))}
                </select>
                <label className="absolute left-4 top-2 text-xs font-medium tracking-wide text-[#64748B]">
                  Semester
                </label>
              </div>

              {/* New field: Department */}
              <div className="relative">
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full px-4 pt-6 pb-2.5 rounded-xl border border-[#E2E8F0] bg-white text-[#052659] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#C1E8FF] focus:border-[#C1E8FF]"
                >
                  <option value="">Select department</option>
                  {['Computer Science', 'Information Technology', 'Electronics', 'Mechanical', 'Civil', 'Electrical', 'Chemical'].map((item) => (
                    <option key={item} value={item}>{item}</option>
                  ))}
                </select>
                <label className="absolute left-4 top-2 text-xs font-medium tracking-wide text-[#64748B]">
                  Department
                </label>
              </div>

              {/* New field: GitHub URL */}
              <div className="relative">
                <input
                  value={githubUrl}
                  onChange={(e) => setGithubUrl(e.target.value)}
                  placeholder=" "
                  className="peer w-full px-4 pt-6 pb-2.5 rounded-xl border border-[#E2E8F0] bg-white text-[#052659] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#C1E8FF] focus:border-[#C1E8FF]"
                />
                <label className="absolute left-4 top-2 text-xs font-medium tracking-wide text-[#64748B] transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-sm peer-placeholder-shown:text-[#94A3B8] peer-focus:top-2 peer-focus:text-xs peer-focus:text-[#5483B3]">
                  GitHub URL
                </label>
              </div>

              {/* New field: Number of Hackathons Participated */}
              <div className="relative">
                <input
                  type="number"
                  min={0}
                  value={hackathonsParticipated}
                  onChange={(e) => setHackathonsParticipated(e.target.value)}
                  placeholder=" "
                  className="peer w-full px-4 pt-6 pb-2.5 rounded-xl border border-[#E2E8F0] bg-white text-[#052659] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#C1E8FF] focus:border-[#C1E8FF]"
                />
                <label className="absolute left-4 top-2 text-xs font-medium tracking-wide text-[#64748B] transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-sm peer-placeholder-shown:text-[#94A3B8] peer-focus:top-2 peer-focus:text-xs peer-focus:text-[#5483B3]">
                  Hackathons Participated
                </label>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="px-6 py-3 bg-gradient-to-r from-[#5483B3] to-[#3e6f9e] text-white font-medium rounded-xl shadow-md shadow-[#5483B3]/25 transition-all duration-200 hover:scale-[1.02] hover:shadow-lg hover:shadow-[#C1E8FF]/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C1E8FF] focus-visible:ring-offset-2 disabled:opacity-70 disabled:hover:scale-100"
                >
                  {saving ? "Saving..." : "Save"}
                </button>

                <button
                  onClick={() => setEditing(false)}
                  className="px-6 py-3 bg-slate-100 text-[#475569] font-medium rounded-xl border border-slate-200 transition-all duration-200 hover:bg-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C1E8FF] focus-visible:ring-offset-2"
                >
                  Cancel
                </button>
              </div>

            </div>
          ) : (
            <div className="relative z-10 space-y-8 animate-in fade-in duration-200">
              {/* Name */}
              <div className="space-y-1">
                <h3 className="font-semibold text-[#052659] mb-1">
                  Name
                </h3>
                <p className="text-lg text-[#475569]">{user.name}</p>
              </div>

              {/* Email */}
              <div className="space-y-1">
                <h3 className="font-semibold text-[#052659] mb-1">
                  Email
                </h3>
                <p className="text-lg text-[#475569]">{user.email}</p>
              </div>

              {/* New field: Semester */}
              <div className="space-y-1">
                <h3 className="font-semibold text-[#052659] mb-1">
                  Semester
                </h3>
                <p className="text-lg text-[#475569]">{user.semester || semester || "Not provided"}</p>
              </div>

              {/* New field: Department */}
              <div className="space-y-1">
                <h3 className="font-semibold text-[#052659] mb-1">
                  Department
                </h3>
                <p className="text-lg text-[#475569]">{user.department || department || "Not provided"}</p>
              </div>

              {/* New field: GitHub URL */}
              <div className="space-y-1">
                <h3 className="font-semibold text-[#052659] mb-1">
                  GitHub
                </h3>
                {user.githubUrl || githubUrl ? (
                  <a
                    href={user.githubUrl || githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-lg text-[#5483B3] hover:text-[#052659] underline underline-offset-4 break-all transition-colors"
                  >
                    {user.githubUrl || githubUrl}
                  </a>
                ) : (
                  <p className="text-lg text-[#475569]">Not provided</p>
                )}
              </div>

              {/* New field: Number of Hackathons Participated */}
              <div className="space-y-1">
                <h3 className="font-semibold text-[#052659] mb-1">
                  Hackathons Participated
                </h3>
                <p className="text-lg text-[#475569]">
                  {String((user.hackathonsParticipated ?? hackathonsParticipated) || 0)}
                </p>
              </div>

              {/* Skills */}
              <div>
                <h3 className="font-semibold text-[#052659] mb-3">
                  Skills
                </h3>

                <div className="flex flex-wrap gap-2.5">
                  {user.skills?.map((skill: string, i: number) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#C1E8FF] text-[#052659] rounded-full text-sm font-medium transition-all duration-200 hover:bg-[#C1E8FF]/70 hover:-translate-y-0.5"
                    >
                      {skill}
                      <span className="text-[#052659]/70 text-xs">×</span>
                    </span>
                  ))}
                </div>
              </div>

              {/* Logout */}
              <button
                onClick={() => {
                  localStorage.removeItem("token");
                  window.location.href = "/login";
                }}
                className="mt-2 px-6 py-3 bg-[#EF4444] text-white font-medium rounded-xl shadow-md shadow-red-200 transition-all duration-200 hover:bg-red-600 hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C1E8FF] focus-visible:ring-offset-2"
              >
                Logout
              </button>

            </div>
          )}

        </div>
      </div>
    </div>
  );
}
