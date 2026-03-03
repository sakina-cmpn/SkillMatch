import axios from "axios";
import { useState, useEffect } from "react";
import { Search as SearchIcon, Filter, MapPin, Clock, Star, Send } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { Card } from "../components/ui/card";
import { useAuth } from "../../context/AuthContext";
import { toast } from "sonner";
import { API_BASE_URL } from "../../config/api";
interface Expert {
  id: string | number;
  name: string;
  email?: string; // for real users
  avatar?: string;
  bio: string;
  skills: string[];
  proficiency: number;
  availability: string;
  location: string;
  hackathons: number;
  projects?: Array<{
    title: string;
    description?: string;
    techStack?: string[];
    files?: Array<{ name?: string; type?: string; size?: number; dataUrl?: string }>;
    link?: string;
    visibility?: "Public" | "Private";
  }>;
}

const mockExperts: Expert[] = [
  {
    id: 1,
    name: "Sarah Chen",
    avatar: "https://images.unsplash.com/photo-1573496359961-3c82861ab8f4?w=150&h=150&fit=crop",
    bio: "Full-stack developer with 5 years of experience in React and Node.js",
    skills: ["React", "TypeScript", "Node.js", "MongoDB", "AWS"],
    proficiency: 5,
    availability: "Available",
    location: "San Francisco, CA",
    hackathons: 12,
  },
  {
    id: 2,
    name: "Marcus Johnson",
    avatar: "https://images.unsplash.com/photo-1732209556859-72cfe81ae9ab?w=150&h=150&fit=crop",
    bio: "AI/ML engineer passionate about building intelligent systems",
    skills: ["Python", "TensorFlow", "PyTorch", "Machine Learning", "Data Science"],
    proficiency: 5,
    availability: "Available",
    location: "Austin, TX",
    hackathons: 8,
  },
  {
    id: 3,
    name: "Priya Sharma",
    avatar: "https://images.unsplash.com/photo-1648747640168-610ecf118f66?w=150&h=150&fit=crop",
    bio: "Mobile app developer specializing in cross-platform solutions",
    skills: ["React Native", "Flutter", "iOS", "Android", "Firebase"],
    proficiency: 4,
    availability: "Busy",
    location: "Seattle, WA",
    hackathons: 15,
  },
  {
    id: 4,
    name: "David Okafor",
    avatar: "https://images.unsplash.com/photo-1710770563074-6d9cc0d3e338?w=150&h=150&fit=crop",
    bio: "Backend engineer with expertise in scalable systems",
    skills: ["Go", "Kubernetes", "Docker", "PostgreSQL", "Redis"],
    proficiency: 5,
    availability: "Available",
    location: "New York, NY",
    hackathons: 10,
  },
];

export function Search() {
  const handleRequest = (expert: Expert) => {
    if (!user || !token) return;

    // ❌ prevent sending request to yourself
    if (expert.id === user._id) {
      toast.error("You cannot send a request to yourself");
      return;
    }

    axios
      .post(
        `${API_BASE_URL}/api/requests`,
        {
          toUserId: expert.id,
          message: `${user.name} wants to connect and chat about teaming up.`,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
      .then(() => {
        toast.success(`Request sent to ${expert.name}`);
      })
      .catch((error) => {
        const status = error?.response?.status;
        if (status === 409 || status === 200) {
          toast.success(`Request already pending for ${expert.name}`);
          return;
        }
        if (!error?.response) {
          toast.error(`Backend is not running at ${API_BASE_URL}`);
          return;
        }
        toast.error(error?.response?.data?.error || "Failed to send request");
      });
  };
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const { user, token } = useAuth();
  const [users, setUsers] = useState<Expert[]>([]);
  const [selectedExpert, setSelectedExpert] = useState<Expert | null>(null);
  const [previewFile, setPreviewFile] = useState<{
    name?: string;
    type?: string;
    dataUrl?: string;
  } | null>(null);
  const [selfProjects, setSelfProjects] = useState<any[]>(user?.projects || []);

  // Fetch real users from backend
  useEffect(() => {
    const fetchUsers = async () => {
      if (!token) return;
      try {
        const res = await axios.get(`${API_BASE_URL}/api/users`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const mappedUsers: Expert[] = res.data.map((u: any) => ({
          id: u._id,
          name: u.name,
          email: u.email,
          bio: "SkillMatch User",
          skills: u.skills || [],
          proficiency: 4,
          availability: "Available",
          location: "Your Campus",
          hackathons: Number(u.hackathonsParticipated ?? u.hackathons ?? 0),
          projects: u.projects || [],
        }));
        setUsers(mappedUsers);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };
    fetchUsers();
  }, [token]);

  useEffect(() => {
    const fetchSelfProfile = async () => {
      if (!token) return;
      try {
        const res = await axios.get(`${API_BASE_URL}/api/profile`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setSelfProjects(res.data?.projects || []);
      } catch (error) {
        console.error("Error fetching self profile:", error);
      }
    };
    fetchSelfProfile();
  }, [token]);

  // Logged-in user as a card
  const loggedInExpert: Expert | null = user
    ? {
      id: user._id,
      name: user.name,
      bio: "SkillMatch User",
      skills: user.skills || [],
      proficiency: 4,
      availability: "Available",
      location: "Your Campus",
      hackathons: Number(user.hackathonsParticipated ?? 0),
      projects: selfProjects || [],
    }
    : null;

  // Merge all cards: logged-in user + real users + mock experts
  const allExperts: Expert[] = [
    ...(loggedInExpert ? [loggedInExpert] : []),
    ...users,
    ...mockExperts,
  ];

  // All unique skills
  const allSkills = Array.from(new Set(allExperts.flatMap((e) => e.skills))).sort();

  // Filter experts based on search
  const filteredExperts = allExperts.filter((expert) => {
    const matchesSearch =
      searchQuery === "" ||
      expert.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      expert.skills.some((skill) =>
        skill.toLowerCase().includes(searchQuery.toLowerCase())
      ) ||
      expert.bio.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesSkills =
      selectedSkills.length === 0 ||
      selectedSkills.every((skill) => expert.skills.includes(skill));

    return matchesSearch && matchesSkills;
  });

  const toggleSkill = (skill: string) => {
    setSelectedSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-[#052659] mb-2">Find Your Perfect Teammate</h1>
        <p className="text-[#64748B]">Connect with talented developers and designers for your next hackathon</p>
      </div>

      {/* Search Bar */}
      <Card className="p-6 bg-white border-[#E2E8F0] shadow-lg">
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#64748B]" />
            <Input
              placeholder="Search by skill, name, or technology..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-12 border-[#E2E8F0] focus:ring-2 focus:ring-[#C1E8FF] focus:border-[#5483B3]"
            />
          </div>
          <Button className="h-12 px-6 bg-[#5483B3] hover:bg-[#052659] text-white">
            <SearchIcon className="w-4 h-4 mr-2" />
            Search
          </Button>
        </div>

        {/* Skill Filters */}
        <div className="mt-4">
          <div className="flex items-center gap-2 mb-3">
            <Filter className="w-4 h-4 text-[#64748B]" />
            <span className="text-sm font-medium text-[#052659]">Filter by skills:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {allSkills.map((skill) => (
              <Badge
                key={skill}
                onClick={() => toggleSkill(skill)}
                className={`cursor-pointer transition-all ${selectedSkills.includes(skill)
                  ? "bg-[#5483B3] hover:bg-[#052659] text-white"
                  : "bg-[#C1E8FF]/30 hover:bg-[#C1E8FF]/50 text-[#052659]"
                  }`}
              >
                {skill}
              </Badge>
            ))}
          </div>
        </div>
      </Card>

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <p className="text-[#475569]">
          Found <span className="font-semibold text-[#052659]">{filteredExperts.length}</span>{" "}
          {filteredExperts.length === 1 ? "expert" : "experts"}
        </p>
      </div>

      {/* Expert Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredExperts.map((expert) => (
          <Card
            key={expert.id}
            onClick={() => setSelectedExpert(expert)}
            className="p-6 bg-white border-[#E2E8F0] hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
          >
            <div className="flex flex-col h-full">
              {/* Profile Header */}
              <div className="flex items-start gap-4 mb-4">
                <Avatar className="w-16 h-16 ring-2 ring-[#C1E8FF]">
                  <AvatarImage src={expert.avatar} alt={expert.name} />
                  <AvatarFallback className="bg-[#5483B3] text-white">
                    {expert.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-[#052659] mb-1">{expert.name}</h3>
                  <div className="flex items-center gap-1 text-[#64748B] text-sm mb-1">
                    <MapPin className="w-3 h-3" />
                    <span className="truncate">{expert.location}</span>
                  </div>
                  <Badge
                    className={
                      expert.availability === "Available"
                        ? "bg-[#10B981]/10 text-[#10B981] hover:bg-[#10B981]/20"
                        : "bg-[#64748B]/10 text-[#64748B] hover:bg-[#64748B]/20"
                    }
                  >
                    <Clock className="w-3 h-3 mr-1" />
                    {expert.availability}
                  </Badge>
                </div>
              </div>

              {/* Bio */}
              <p className="text-sm text-[#475569] mb-4 line-clamp-2">{expert.bio}</p>

              {/* Stats */}
              <div className="flex items-center gap-4 mb-4 text-sm">
                <div className="flex items-center gap-1 text-[#64748B]">
                  <Star className="w-4 h-4 fill-[#5483B3] text-[#5483B3]" />
                  <span className="font-medium text-[#052659]">{expert.proficiency}.0</span>
                </div>
                <div className="text-[#64748B]">
                  <span className="font-medium text-[#052659]">{expert.hackathons}</span>{" "}
                  hackathons
                </div>
              </div>

              {/* Skills */}
              <div className="flex flex-wrap gap-2 mb-4 flex-1">
                {expert.skills.slice(0, 4).map((skill) => (
                  <Badge
                    key={skill}
                    className="bg-[#C1E8FF]/30 text-[#052659] hover:bg-[#C1E8FF]/50 text-xs"
                  >
                    {skill}
                  </Badge>
                ))}
                {expert.skills.length > 4 && (
                  <Badge className="bg-[#C1E8FF]/30 text-[#052659] hover:bg-[#C1E8FF]/50 text-xs">
                    +{expert.skills.length - 4}
                  </Badge>
                )}
              </div>

              {/* Action Button */}
              <Button
                className="w-full bg-[#5483B3] hover:bg-[#052659] text-white"
                disabled={expert.availability === "Busy"}
                onClick={(e) => {
                  e.stopPropagation();
                  handleRequest(expert);
                }}
              >
                <Send className="w-4 h-4 mr-2" />
                Send Request
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {filteredExperts.length === 0 && (
        <Card className="p-12 text-center bg-white border-[#E2E8F0]">
          <SearchIcon className="w-12 h-12 text-[#64748B] mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-[#052659] mb-2">No experts found</h3>
          <p className="text-[#64748B]">Try adjusting your search or filters to find more results</p>
        </Card>
      )}

      {selectedExpert && (
        <div
          className="fixed inset-0 z-50 bg-[#052659]/15 backdrop-blur-sm p-4 flex items-center justify-center"
          onClick={() => {
            setSelectedExpert(null);
            setPreviewFile(null);
          }}
        >
          <Card
            className="w-full max-w-2xl max-h-[85vh] overflow-y-auto p-6 bg-white border-[#E2E8F0] shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3 mb-4">
              <div>
                <h2 className="text-2xl font-bold text-[#052659]">{selectedExpert.name}</h2>
                <p className="text-sm text-[#64748B]">{selectedExpert.email || "SkillMatch User"}</p>
              </div>
              <button
                onClick={() => {
                  setSelectedExpert(null);
                  setPreviewFile(null);
                }}
                className="text-[#64748B] hover:text-[#052659]"
              >
                Close
              </button>
            </div>

            <div className="mb-4">
              <h3 className="text-lg font-semibold text-[#052659] mb-2">Public Projects</h3>
              {selectedExpert.projects?.filter((p) => (p.visibility || "Public") === "Public").length ? (
                <div className="space-y-3">
                  {selectedExpert.projects
                    ?.filter((p) => (p.visibility || "Public") === "Public")
                    .map((project, i) => (
                      <div key={`${project.title}-${i}`} className="rounded-xl border border-[#E2E8F0] p-4">
                        <p className="text-base font-semibold text-[#052659]">{project.title}</p>
                        <p className="text-sm text-[#64748B] mt-1">{project.description || "No description"}</p>
                        {project.techStack?.length ? (
                          <div className="flex flex-wrap gap-2 mt-2">
                            {project.techStack.map((tag) => (
                              <Badge key={`${project.title}-${tag}`} className="bg-[#C1E8FF]/30 text-[#052659]">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        ) : null}
                        {project.files?.length ? (
                          <div className="mt-2 space-y-1">
                            {project.files.map((file, fi) =>
                              file?.dataUrl ? (
                                <div
                                  key={`${project.title}-file-${fi}`}
                                  className="flex items-center justify-between gap-3 rounded-lg border border-[#E2E8F0] px-3 py-2"
                                >
                                  <span className="truncate text-sm text-[#052659]">
                                    {file.name || `File ${fi + 1}`}
                                  </span>
                                  <div className="flex items-center gap-2 shrink-0">
                                    <button
                                      type="button"
                                      onClick={() => setPreviewFile(file)}
                                      className="text-xs text-[#5483B3] hover:text-[#052659] underline underline-offset-2"
                                    >
                                      View
                                    </button>
                                    <a
                                      href={file.dataUrl}
                                      download={file.name || "project-file"}
                                      className="text-xs text-[#5483B3] hover:text-[#052659] underline underline-offset-2"
                                    >
                                      Download
                                    </a>
                                  </div>
                                </div>
                              ) : (
                                <p
                                  key={`${project.title}-file-${fi}`}
                                  className="text-sm text-[#64748B]"
                                >
                                  {file.name || `File ${fi + 1}`}
                                </p>
                              )
                            )}
                          </div>
                        ) : null}
                        {project.link ? (
                          <a
                            href={project.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-2 inline-block text-sm text-[#5483B3] hover:text-[#052659] underline underline-offset-2"
                          >
                            View Project
                          </a>
                        ) : null}
                      </div>
                    ))}
                </div>
              ) : (
                <p className="text-sm text-[#64748B]">No public projects available.</p>
              )}
            </div>
          </Card>
        </div>
      )}

      {previewFile?.dataUrl && (
        <div
          className="fixed inset-0 z-[60] bg-[#052659]/25 backdrop-blur-sm p-4 flex items-center justify-center"
          onClick={() => setPreviewFile(null)}
        >
          <Card
            className="w-full max-w-4xl max-h-[90vh] overflow-auto p-4 bg-white border-[#E2E8F0] shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-semibold text-[#052659] truncate pr-3">
                {previewFile.name || "File preview"}
              </p>
              <button
                onClick={() => setPreviewFile(null)}
                className="text-[#64748B] hover:text-[#052659] text-sm"
              >
                Close
              </button>
            </div>

            {previewFile.type?.startsWith("image/") ? (
              <img
                src={previewFile.dataUrl}
                alt={previewFile.name || "Preview"}
                className="max-h-[75vh] w-auto mx-auto rounded-lg border border-[#E2E8F0]"
              />
            ) : previewFile.type === "application/pdf" ? (
              <iframe
                src={previewFile.dataUrl}
                title={previewFile.name || "PDF preview"}
                className="w-full h-[75vh] rounded-lg border border-[#E2E8F0]"
              />
            ) : previewFile.type?.startsWith("text/") ? (
              <iframe
                src={previewFile.dataUrl}
                title={previewFile.name || "Text preview"}
                className="w-full h-[75vh] rounded-lg border border-[#E2E8F0] bg-white"
              />
            ) : (
              <div className="text-center py-10">
                <p className="text-sm text-[#64748B] mb-3">
                  Preview not supported for this file type.
                </p>
                <a
                  href={previewFile.dataUrl}
                  download={previewFile.name || "project-file"}
                  className="text-sm text-[#5483B3] hover:text-[#052659] underline underline-offset-2"
                >
                  Download file
                </a>
              </div>
            )}
          </Card>
        </div>
      )}
    </div>
  );
}
