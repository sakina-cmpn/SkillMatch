import { useRef, useState } from "react";
import { Upload, Link as LinkIcon, Plus } from "lucide-react";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import { API_BASE_URL } from "../../config/api";

const defaultTechStack = ["React", "TypeScript", "Node.js"];

export default function Project() {
  const { user } = useAuth();
  const [techStack, setTechStack] = useState<string[]>(defaultTechStack);
  const [techInput, setTechInput] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [projectLink, setProjectLink] = useState("");
  const [visibility, setVisibility] = useState<"Public" | "Private">("Public");
  const [files, setFiles] = useState<File[]>([]);
  const [isDragActive, setIsDragActive] = useState(false);
  const [saving, setSaving] = useState(false);
  const [projects, setProjects] = useState<any[]>(user?.projects || []);
  const [editingLinks, setEditingLinks] = useState<Record<string, string>>({});
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const titleInputRef = useRef<HTMLInputElement | null>(null);

  const addTech = (value: string) => {
    const next = value.trim();
    if (!next) return;

    const exists = techStack.some((item) => item.toLowerCase() === next.toLowerCase());
    if (exists) {
      setTechInput("");
      return;
    }

    setTechStack((prev) => [...prev, next]);
    setTechInput("");
  };

  const removeTech = (tag: string) => {
    setTechStack((prev) => prev.filter((item) => item !== tag));
  };

  const addFiles = (incoming: FileList | File[]) => {
    const nextFiles = Array.from(incoming);
    if (nextFiles.length === 0) return;

    setFiles((prev) => {
      const existingKeys = new Set(prev.map((f) => `${f.name}-${f.size}-${f.lastModified}`));
      const uniqueNew = nextFiles.filter(
        (f) => !existingKeys.has(`${f.name}-${f.size}-${f.lastModified}`)
      );
      return [...prev, ...uniqueNew];
    });
  };

  const removeFile = (file: File) => {
    setFiles((prev) =>
      prev.filter(
        (f) => !(f.name === file.name && f.size === file.size && f.lastModified === file.lastModified)
      )
    );
  };

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setProjectLink("");
    setTechStack(defaultTechStack);
    setTechInput("");
    setFiles([]);
    setVisibility("Public");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSaveProject = async () => {
    if (!title.trim()) {
      alert("Project title is required");
      return;
    }

    const normalizeLink = (value: string) => {
      const raw = value.trim();
      if (!raw) return "";
      if (/^https?:\/\//i.test(raw)) return raw;
      return `https://${raw}`;
    };

    const fileToDataUrl = (file: File) =>
      new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(String(reader.result || ""));
        reader.onerror = () => reject(new Error("Failed to read file"));
        reader.readAsDataURL(file);
      });

    try {
      setSaving(true);
      const token = localStorage.getItem("token");
      const normalizedLink = normalizeLink(projectLink);
      const filePayload = await Promise.all(
        files.map(async (f) => ({
          name: f.name,
          type: f.type,
          size: f.size,
          dataUrl: await fileToDataUrl(f),
        }))
      );
      const payload = {
        title,
        description,
        techStack,
        files: filePayload,
        link: normalizedLink,
        visibility,
      };
      const res = await axios.post(`${API_BASE_URL}/api/projects`, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setProjects(res.data?.projects || []);
      // keep local cached user in sync for pages that read from storage
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        const parsed = JSON.parse(storedUser);
        localStorage.setItem(
          "user",
          JSON.stringify({
            ...parsed,
            projects: res.data?.projects || [],
          })
        );
      }
      alert("Project saved!");
      resetForm();
      titleInputRef.current?.focus();
    } catch (err: any) {
      alert(err?.response?.data?.error || "Failed to save project");
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateProjectLink = async (projectId: string) => {
    const raw = editingLinks[projectId] ?? "";
    try {
      const token = localStorage.getItem("token");
      const res = await axios.patch(
        `${API_BASE_URL}/api/projects/${projectId}`,
        { link: raw },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setProjects(res.data?.projects || []);

      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        const parsed = JSON.parse(storedUser);
        localStorage.setItem(
          "user",
          JSON.stringify({
            ...parsed,
            projects: res.data?.projects || [],
          })
        );
      }
      alert("Project link updated!");
    } catch (err: any) {
      alert(err?.response?.data?.error || "Failed to update link");
    }
  };

  return (
    <div className="min-h-[calc(100vh-120px)] bg-gradient-to-br from-[#F8FAFC] to-[#FFFFFF] p-4 sm:p-6 lg:p-10">
      <div className="mx-auto max-w-5xl rounded-3xl border border-[#E2E8F0] bg-white p-5 shadow-xl shadow-[#052659]/8 sm:p-8">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-[#052659] sm:text-3xl">My Projects</h1>
            <p className="mt-1 text-sm text-[#64748B]">
              Upload your project using ZIP or GitHub/Live Demo link.
            </p>
          </div>
          <Button
            type="button"
            onClick={() => {
              resetForm();
              titleInputRef.current?.focus();
            }}
            className="rounded-xl bg-[#5483B3] text-white shadow-md shadow-[#5483B3]/25 transition-all hover:scale-[1.02] hover:bg-[#446f9b] hover:shadow-[#C1E8FF]/60"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add New Project
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div className="space-y-3 rounded-2xl border border-[#E2E8F0] bg-white p-4 shadow-sm">
            <label className="block text-xs font-medium uppercase tracking-wide text-[#64748B]">Project Title</label>
            <input
              ref={titleInputRef}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter project title"
              className="w-full rounded-xl border border-[#E2E8F0] px-3 py-2.5 text-sm text-[#052659] outline-none focus:border-[#C1E8FF] focus:ring-2 focus:ring-[#C1E8FF]"
            />

            <label className="block text-xs font-medium uppercase tracking-wide text-[#64748B]">Description</label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Write a short project summary"
              className="w-full rounded-xl border border-[#E2E8F0] px-3 py-2.5 text-sm text-[#052659] outline-none focus:border-[#C1E8FF] focus:ring-2 focus:ring-[#C1E8FF]"
            />

            <label className="block text-xs font-medium uppercase tracking-wide text-[#64748B]">Tech Stack</label>
            <div className="flex items-center gap-2">
              <input
                value={techInput}
                onChange={(e) => setTechInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === ",") {
                    e.preventDefault();
                    addTech(techInput);
                  }
                }}
                placeholder="Add tech and press Enter"
                className="w-full rounded-xl border border-[#E2E8F0] px-3 py-2.5 text-sm text-[#052659] outline-none focus:border-[#C1E8FF] focus:ring-2 focus:ring-[#C1E8FF]"
              />
              <Button
                type="button"
                onClick={() => addTech(techInput)}
                className="rounded-xl bg-[#5483B3] text-white hover:bg-[#446f9b]"
              >
                Add
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {techStack.map((tag) => (
                <Badge key={tag} className="bg-[#C1E8FF]/45 text-[#052659] hover:bg-[#C1E8FF]/65">
                  <span className="mr-1">{tag}</span>
                  <button
                    type="button"
                    onClick={() => removeTech(tag)}
                    className="text-[#052659]/70 hover:text-[#052659]"
                    aria-label={`Remove ${tag}`}
                  >
                    ×
                  </button>
                </Badge>
              ))}
            </div>
          </div>

          <div className="space-y-3 rounded-2xl border border-[#E2E8F0] bg-white p-4 shadow-sm">
            <label className="block text-xs font-medium uppercase tracking-wide text-[#64748B]">Upload ZIP</label>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".zip,.rar,.7z,.pdf,.doc,.docx,.ppt,.pptx,.txt,.md,.png,.jpg,.jpeg,.webp,.gif,.csv,.json,.js,.ts,.tsx,.jsx,.py,.java,.c,.cpp,.go,.rs,.sql"
              className="hidden"
              onChange={(e) => {
                if (e.target.files) addFiles(e.target.files);
              }}
            />
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragActive(true);
              }}
              onDragLeave={() => setIsDragActive(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsDragActive(false);
                addFiles(e.dataTransfer.files);
              }}
              className={`rounded-2xl border border-dashed p-6 text-center transition-all ${
                isDragActive
                  ? "border-[#5483B3] bg-[#C1E8FF]/30"
                  : "border-[#C1E8FF] bg-[#F8FAFC] hover:bg-[#C1E8FF]/20"
              }`}
            >
              <Upload className="mx-auto mb-2 h-5 w-5 text-[#5483B3]" />
              <p className="text-sm text-[#475569]">Drag and drop ZIP or other files here</p>
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                className="mt-3 border-[#E2E8F0] text-[#052659] hover:bg-[#C1E8FF]/25"
              >
                Choose File
              </Button>
            </div>

            {files.length > 0 && (
              <div className="space-y-2 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-3">
                <p className="text-xs font-medium text-[#64748B]">
                  Selected files ({files.length})
                </p>
                {files.map((file) => (
                  <div
                    key={`${file.name}-${file.size}-${file.lastModified}`}
                    className="flex items-center justify-between gap-3 rounded-lg border border-[#E2E8F0] bg-white px-3 py-2"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm text-[#052659]">{file.name}</p>
                      <p className="text-xs text-[#64748B]">
                        {(file.size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFile(file)}
                      className="text-xs font-medium text-[#5483B3] hover:text-[#052659]"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="flex items-center gap-2 text-xs text-[#64748B]">
              <span className="h-px flex-1 bg-[#E2E8F0]" />
              OR
              <span className="h-px flex-1 bg-[#E2E8F0]" />
            </div>

            <label className="block text-xs font-medium uppercase tracking-wide text-[#64748B]">
              GitHub / Live Demo URL
            </label>
            <div className="relative">
              <LinkIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#64748B]" />
              <input
                value={projectLink}
                onChange={(e) => setProjectLink(e.target.value)}
                placeholder="github.com/username/project or https://demo.com"
                className="w-full rounded-xl border border-[#E2E8F0] px-10 py-2.5 text-sm text-[#052659] outline-none focus:border-[#C1E8FF] focus:ring-2 focus:ring-[#C1E8FF]"
              />
            </div>

            <select
              value={visibility}
              onChange={(e) => setVisibility(e.target.value === "Private" ? "Private" : "Public")}
              className="w-full rounded-xl border border-[#E2E8F0] px-3 py-2.5 text-sm text-[#052659] outline-none focus:border-[#C1E8FF] focus:ring-2 focus:ring-[#C1E8FF]"
            >
              <option value="Public">Public</option>
              <option value="Private">Private</option>
            </select>

            <Button
              onClick={handleSaveProject}
              disabled={saving}
              className="w-full rounded-xl bg-[#5483B3] text-white shadow-md shadow-[#5483B3]/25 transition-all hover:scale-[1.02] hover:bg-[#446f9b] hover:shadow-[#C1E8FF]/60 disabled:opacity-70"
            >
              {saving ? "Saving..." : "Save Project"}
            </Button>
          </div>
        </div>

        <div className="mt-6 space-y-3">
          <h2 className="text-lg font-semibold text-[#052659]">Saved Projects</h2>
          {projects.length === 0 ? (
            <p className="text-sm text-[#64748B]">No projects saved yet.</p>
          ) : (
            projects.map((project, idx) => (
              <div
                key={project._id || `${project.title}-${idx}`}
                className="rounded-2xl border border-[#E2E8F0] bg-white p-4 shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-base font-semibold text-[#052659]">{project.title}</p>
                    <p className="mt-1 text-sm text-[#64748B]">{project.description || "No description"}</p>
                    {project.techStack?.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {project.techStack.map((tag: string) => (
                          <Badge key={`${project.title}-${tag}`} className="bg-[#C1E8FF]/45 text-[#052659]">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                    <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-center">
                      <input
                        value={editingLinks[project._id] ?? project.link ?? ""}
                        onChange={(e) =>
                          setEditingLinks((prev) => ({
                            ...prev,
                            [project._id]: e.target.value,
                          }))
                        }
                        placeholder="Add or edit project link"
                        className="w-full rounded-xl border border-[#E2E8F0] px-3 py-2 text-sm text-[#052659] outline-none focus:border-[#C1E8FF] focus:ring-2 focus:ring-[#C1E8FF]"
                      />
                      <Button
                        type="button"
                        onClick={() => project._id && handleUpdateProjectLink(project._id)}
                        className="rounded-xl bg-[#5483B3] text-white hover:bg-[#446f9b]"
                      >
                        Update Link
                      </Button>
                    </div>
                    {project.link && (
                      <a
                        href={project.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-2 block text-sm text-[#5483B3] hover:text-[#052659] underline underline-offset-2 break-all"
                      >
                        {project.link}
                      </a>
                    )}
                  </div>
                  <span className="rounded-full border border-[#E2E8F0] px-2.5 py-1 text-xs text-[#475569]">
                    {project.visibility || "Public"}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
