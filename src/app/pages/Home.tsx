import React from "react";
import { Search as SearchIcon, Sparkles, Users, Trophy, TrendingUp } from "lucide-react";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { Link } from "react-router-dom"

const featuredExperts = [
  {
    id: 1,
    name: "Sarah Chen",
    avatar: "https://images.unsplash.com/photo-1573496359961-3c82861ab8f4?w=150&h=150&fit=crop",
    skills: ["React", "TypeScript", "Node.js"],
    hackathons: 12,
  },
  {
    id: 2,
    name: "Marcus Johnson",
    avatar: "https://images.unsplash.com/photo-1732209556859-72cfe81ae9ab?w=150&h=150&fit=crop",
    skills: ["Python", "AI/ML", "TensorFlow"],
    hackathons: 8,
  },
  {
    id: 3,
    name: "Priya Sharma",
    avatar: "https://images.unsplash.com/photo-1648747640168-610ecf118f66?w=150&h=150&fit=crop",
    skills: ["React Native", "Flutter", "iOS"],
    hackathons: 15,
  },
  {
    id: 4,
    name: "David Okafor",
    avatar: "https://images.unsplash.com/photo-1710770563074-6d9cc0d3e338?w=150&h=150&fit=crop",
    skills: ["Go", "Kubernetes", "Docker"],
    hackathons: 10,
  },
];

const trendingSkills = [
  { name: "React", count: 234 },
  { name: "Python", count: 198 },
  { name: "TypeScript", count: 187 },
  { name: "Node.js", count: 156 },
  { name: "AI/ML", count: 142 },
  { name: "AWS", count: 128 },
];

const stats = [
  { label: "Active Members", value: "2,847", icon: Users, color: "#5483B3" },
  { label: "Skills Listed", value: "156", icon: Sparkles, color: "#10B981" },
  { label: "Hackathons", value: "89", icon: Trophy, color: "#5483B3" },
  { label: "Success Rate", value: "94%", icon: TrendingUp, color: "#10B981" },
];

export function Home() {
  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <div className="text-center space-y-6">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#C1E8FF]/30 rounded-full border border-[#C1E8FF] mb-4">
          <Sparkles className="w-4 h-4 text-[#5483B3]" />
          <span className="text-sm font-medium text-[#052659]">
            Find Your Perfect Hackathon Team
          </span>
        </div>

        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-[#052659] leading-tight">
          Connect with Skilled
          <br />
          <span className="bg-gradient-to-r from-[#5483B3] to-[#C1E8FF] bg-clip-text text-transparent">
            Developers & Designers
          </span>
        </h1>

        <p className="text-lg text-[#64748B] max-w-2xl mx-auto">
          Join thousands of students and professionals building amazing projects together.
          Find teammates with the exact skills you need for your next hackathon.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
          <Link to="/search">
            <Button className="h-12 px-8 bg-[#5483B3] hover:bg-[#052659] text-white text-lg shadow-lg hover:shadow-xl transition-all">
              <SearchIcon className="w-5 h-5 mr-2" />
              Browse Experts
            </Button>
          </Link>
          <Link to="/profile">
            <Button variant="outline" className="h-12 px-8 border-[#5483B3] text-[#5483B3] hover:bg-[#C1E8FF]/20 text-lg">
              Create Profile
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card
              key={index}
              className="p-6 bg-white border-[#E2E8F0] hover:shadow-lg transition-all"
            >
              <div className="flex items-center gap-3">
                <div
                  className="p-3 rounded-xl"
                  style={{ backgroundColor: `${stat.color}15` }}
                >
                  <Icon className="w-6 h-6" style={{ color: stat.color }} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-[#052659]">{stat.value}</p>
                  <p className="text-sm text-[#64748B]">{stat.label}</p>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Featured Experts */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-[#052659] mb-1">
              Featured Experts
            </h2>
            <p className="text-[#64748B]">
              Top-rated members ready to join your team
            </p>
          </div>
          <Link to="/search">
            <Button variant="outline" className="border-[#5483B3] text-[#5483B3] hover:bg-[#C1E8FF]/20">
              View All
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredExperts.map((expert) => (
            <Card
              key={expert.id}
              className="p-6 bg-white border-[#E2E8F0] hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer"
            >
              <div className="text-center">
                <Avatar className="w-20 h-20 mx-auto mb-4 ring-2 ring-[#C1E8FF]">
                  <AvatarImage src={expert.avatar} alt={expert.name} />
                  <AvatarFallback className="bg-[#5483B3] text-white">
                    {expert.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <h3 className="font-semibold text-[#052659] mb-2">
                  {expert.name}
                </h3>
                <p className="text-sm text-[#64748B] mb-3">
                  {expert.hackathons} hackathons
                </p>
                <div className="flex flex-wrap gap-2 justify-center">
                  {expert.skills.map((skill) => (
                    <Badge
                      key={skill}
                      className="bg-[#C1E8FF]/30 text-[#052659] hover:bg-[#C1E8FF]/50 text-xs"
                    >
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Trending Skills */}
      <div>
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-[#052659] mb-1">
            Trending Skills
          </h2>
          <p className="text-[#64748B]">
            Most in-demand technologies this month
          </p>
        </div>

        <Card className="p-6 bg-white border-[#E2E8F0]">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {trendingSkills.map((skill) => (
              <div
                key={skill.name}
                className="p-4 rounded-lg bg-gradient-to-br from-[#C1E8FF]/20 to-transparent border border-[#C1E8FF]/50 hover:border-[#5483B3] transition-all cursor-pointer group"
              >
                <p className="font-semibold text-[#052659] mb-1 group-hover:text-[#5483B3] transition-colors">
                  {skill.name}
                </p>
                <p className="text-sm text-[#64748B]">
                  {skill.count} experts
                </p>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* CTA Section */}
      <Card className="p-12 bg-gradient-to-br from-[#5483B3] to-[#052659] border-0 text-center">
        <Sparkles className="w-12 h-12 text-white mx-auto mb-4" />
        <h2 className="text-3xl font-bold text-white mb-4">
          Ready to Build Something Amazing?
        </h2>
        <p className="text-white/90 text-lg mb-6 max-w-2xl mx-auto">
          Join our community of talented developers and designers.
          Find your perfect teammates and win your next hackathon.
        </p>
        <Link to="/profile">
          <Button className="h-12 px-8 bg-white text-[#5483B3] hover:bg-[#C1E8FF] text-lg shadow-lg">
            Get Started Free
          </Button>
        </Link>
      </Card>
    </div>
  );
}
