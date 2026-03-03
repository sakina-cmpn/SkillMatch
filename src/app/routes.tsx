import { createBrowserRouter, Navigate } from "react-router-dom";

import RootLayout from "./RootLayout";
import { Home } from "./pages/Home";
import Profile from "./pages/Profile";
import { Search } from "./pages/Search";
import { Requests } from "./pages/Requests";
import { Settings } from "./pages/Settings";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ChatPage from "./pages/ChatPages";
import Messages from "./pages/Messages";
import Project from "./pages/project";

function RequireAuth({ children }: { children: JSX.Element }) {
  return localStorage.getItem("token")
    ? children
    : <Navigate to="/login" replace />;
}

function RequireGuest({ children }: { children: JSX.Element }) {
  return localStorage.getItem("token")
    ? <Navigate to="/" replace />
    : children;
}

export const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    children: [

      {
        index: true,
        element: (
          <RequireAuth>
            <Home />
          </RequireAuth>
        ),
      },

      {
        path: "login",
        element: (
          <RequireGuest>
            <Login />
          </RequireGuest>
        ),
      },

      {
        path: "register",
        element: (
          <RequireGuest>
            <Register />
          </RequireGuest>
        ),
      },

      {
        path: "profile",
        element: (
          <RequireAuth>
            <Profile />
          </RequireAuth>
        ),
      },

      {
        path: "search",
        element: (
          <RequireAuth>
            <Search />
          </RequireAuth>
        ),
      },

      {
        path: "requests",
        element: (
          <RequireAuth>
            <Requests />
          </RequireAuth>
        ),
      },

      {
        path: "settings",
        element: (
          <RequireAuth>
            <Settings />
          </RequireAuth>
        ),
      },
      {
        path: "project",
        element: (
          <RequireAuth>
            <Project />
          </RequireAuth>
        ),
      },
      {
        path: "chat",
        element: (
          <RequireAuth>
            <ChatPage />
          </RequireAuth>
        ),
      },
      {
        path: "messages/:id",
        element: (
          <RequireAuth>
            <Messages />
          </RequireAuth>
        ),
      },
    ],
  },
]);
