import React, { useState, useEffect } from "react";
import { Outlet, useNavigate, useLocation, Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import { Avatar, Badge, Dropdown, Tooltip } from "antd";
import {
  DashboardOutlined,
  TeamOutlined,
  SafetyOutlined,
  SettingOutlined,
  LogoutOutlined,
  UserOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  BellOutlined,
} from "@ant-design/icons";
import { logoutThunk } from "../features/auth/authSlice";
import { useAuth } from "../hooks/useAuth";
import "./AppLayout.css";

const NAV_ITEMS = [
  {
    key: "/dashboard",
    icon: <DashboardOutlined />,
    label: "Dashboard",
    roles: ["USER", "ADMIN", "SUPER_ADMIN"],
  },
  {
    key: "/users",
    icon: <TeamOutlined />,
    label: "Users",
    roles: ["USER", "ADMIN", "SUPER_ADMIN"],
  },
  // {
  //   key: "/settings",
  //   icon: <SettingOutlined />,
  //   label: "Settings",
  //   roles: ["USER", "ADMIN", "SUPER_ADMIN"],
  // },
];

const ROLE_COLOR = {
  SUPER_ADMIN: "#a855f7",
  ADMIN: "#4f6ef7",
  USER: "#22c55e",
};

export default function AppLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobile, setMobile] = useState(window.innerWidth < 768);
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { user, role } = useAuth();

  useEffect(() => {
    const handler = () => {
      const isMobile = window.innerWidth < 768;
      setMobile(isMobile);
      if (!isMobile) setMobileOpen(false);
    };
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);

  const handleLogout = async () => {
    await dispatch(logoutThunk());
    navigate("/login");
  };

  const visibleNav = NAV_ITEMS.filter((item) =>
    item.roles.includes(role || "USER"),
  );

  const displayName = user?.username || user?.email?.split("@")[0] || "User";
  const avatarChar = displayName[0].toUpperCase();

  const profileMenu = {
    items: [
      {
        key: "user-info",
        label: (
          <div style={{ padding: "4px 0", minWidth: 160 }}>
            <div style={{ fontWeight: 600, fontSize: 14, color: "#1a1d2e" }}>
              {displayName}
            </div>
            <div style={{ fontSize: 11, color: "#6b7080", marginTop: 2 }}>
              {user?.email}
            </div>
            <div
              style={{
                display: "inline-block",
                marginTop: 6,
                padding: "1px 8px",
                borderRadius: 4,
                background: ROLE_COLOR[role] + "18",
                color: ROLE_COLOR[role],
                fontSize: 11,
                fontWeight: 700,
                fontFamily: "var(--font-mono)",
              }}
            >
              {role}
            </div>
          </div>
        ),
        disabled: true,
      },
      { type: "divider" },
      {
        key: "profile",
        icon: <UserOutlined />,
        label: "My Profile",
        onClick: () => navigate("/profile"),
      },
      { type: "divider" },
      {
        key: "logout",
        icon: <LogoutOutlined />,
        label: "Logout",
        danger: true,
        onClick: handleLogout,
      },
    ],
  };

  const sidebarContent = (
    <div className="sidebar-inner">
      <div className="sidebar-logo">
        {!collapsed && !mobile ? (
          <span className="logo-text">
            CMS<span className="logo-dot">.</span>
          </span>
        ) : (
          <span className="logo-icon">C</span>
        )}
      </div>

      <nav className="sidebar-nav">
        {visibleNav.map((item) => {
          const isActive =
            location.pathname === item.key ||
            location.pathname.startsWith(item.key + "/");
          return (
            <Tooltip
              key={item.key}
              title={collapsed && !mobile ? item.label : ""}
              placement="right"
            >
              <Link
                to={item.key}
                className={`nav-item ${isActive ? "active" : ""}`}
                onClick={() => mobile && setMobileOpen(false)}
              >
                <span className="nav-icon">{item.icon}</span>
                {(!collapsed || mobile) && (
                  <span className="nav-label">{item.label}</span>
                )}
              </Link>
            </Tooltip>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <Dropdown menu={profileMenu} placement="topRight" trigger={["click"]}>
          <div className="user-chip">
            <Avatar
              size={32}
              style={{
                background: ROLE_COLOR[role] || "#4f6ef7",
                flexShrink: 0,
              }}
            >
              {avatarChar}
            </Avatar>
            {(!collapsed || mobile) && (
              <div className="user-info">
                <div className="user-name">{displayName}</div>
                <div className="user-role">{role}</div>
              </div>
            )}
          </div>
        </Dropdown>
      </div>
    </div>
  );

  const currentLabel =
    visibleNav.find((n) => location.pathname.startsWith(n.key))?.label ||
    (location.pathname === "/profile" ? "My Profile" : "Dashboard");

  return (
    <div className="app-layout">
      {mobile && mobileOpen && (
        <div className="mobile-overlay" onClick={() => setMobileOpen(false)} />
      )}

      {!mobile && (
        <aside className={`sidebar ${collapsed ? "collapsed" : ""}`}>
          {sidebarContent}
        </aside>
      )}

      {mobile && (
        <aside className={`sidebar mobile-drawer ${mobileOpen ? "open" : ""}`}>
          {sidebarContent}
        </aside>
      )}

      <div className="main-area">
        <header className="app-header">
          <button
            className="toggle-btn"
            onClick={() =>
              mobile ? setMobileOpen(!mobileOpen) : setCollapsed(!collapsed)
            }
          >
            {(mobile ? mobileOpen : !collapsed) ? (
              <MenuFoldOutlined />
            ) : (
              <MenuUnfoldOutlined />
            )}
          </button>

          <div className="header-title">{currentLabel}</div>

          <div className="header-actions">
            <Dropdown
              menu={profileMenu}
              placement="bottomRight"
              trigger={["click"]}
            >
              <div className="header-avatar">
                <Avatar
                  size={36}
                  style={{
                    background: ROLE_COLOR[role] || "#4f6ef7",
                    cursor: "pointer",
                  }}
                >
                  {avatarChar}
                </Avatar>
              </div>
            </Dropdown>
          </div>
        </header>

        <main className="page-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
