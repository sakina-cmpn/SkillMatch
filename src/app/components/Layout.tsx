import { useState } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { Home, User, Search, Inbox, FolderKanban, Settings, Menu, X } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { useAuth } from "../../context/AuthContext";

export function Layout() {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user } = useAuth();

  // ✅ ADDED: hide navbar on login and register pages
  const hideNavbar =
    location.pathname === "/login" ||
    location.pathname === "/register";

  const navItems = [
    { path: "/", icon: Home, label: "Home" },
    { path: "/profile", icon: User, label: "My Profile" },
    { path: "/search", icon: Search, label: "Search" },
    { path: "/requests", icon: Inbox, label: "Requests" },
    { path: "/project", icon: FolderKanban, label: "Projects" },
    { path: "/settings", icon: Settings, label: "Settings" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F8FAFC] to-white">

      {/* ✅ Navbar hidden on login/register */}
      {!hideNavbar && (
        <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-[#E2E8F0]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">

              {/* Logo */}
              <Link to="/" className="flex items-center gap-2">
                <div className="w-10 h-10 bg-gradient-to-br from-[#5483B3] to-[#C1E8FF] rounded-xl flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold text-xl">S</span>
                </div>
                <span className="text-xl font-bold text-[#052659] hidden sm:inline">
                  SkillMatch
                </span>
              </Link>

              {/* Desktop Navigation */}
              <div className="hidden md:flex items-center gap-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;

                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${isActive
                        ? "bg-[#C1E8FF]/30 text-[#052659] font-medium"
                        : "text-[#475569] hover:bg-[#C1E8FF]/20 hover:text-[#052659]"
                        }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="text-sm">{item.label}</span>
                    </Link>
                  );
                })}
              </div>

              {/* Right Section */}
              <div className="flex items-center gap-3">
                <Avatar className="w-9 h-9 cursor-pointer ring-2 ring-[#C1E8FF]/50 hover:ring-[#5483B3] transition-all">
                  <AvatarImage src={user?.photoUrl || ""} />
                  <AvatarFallback className="bg-[#5483B3] text-white">
                    {user?.name
                      ? user.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .slice(0, 2)
                        .toUpperCase()
                      : "U"}
                  </AvatarFallback>
                </Avatar>

                {/* Mobile Menu Button */}
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="md:hidden p-2 text-[#475569] hover:text-[#052659] hover:bg-[#C1E8FF]/20 rounded-lg"
                >
                  {mobileMenuOpen ? (
                    <X className="w-5 h-5" />
                  ) : (
                    <Menu className="w-5 h-5" />
                  )}
                </button>
              </div>

            </div>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden border-t border-[#E2E8F0] bg-white">
              <div className="px-4 py-3 space-y-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;

                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${isActive
                        ? "bg-[#C1E8FF]/30 text-[#052659] font-medium"
                        : "text-[#475569] hover:bg-[#C1E8FF]/20"
                        }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}
        </nav>
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>

    </div>
  );
}
