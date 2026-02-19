import React, { useEffect, useState } from "react";
import { Card, Row, Col, Typography, Spin, Tag, Avatar } from "antd";
import {
  TeamOutlined,
  CheckCircleOutlined,
  UserOutlined,
  CrownOutlined,
} from "@ant-design/icons";
import api from "../../services/api";
import { useAuth } from "../../hooks/useAuth";
import "./DashboardPage.css";

const { Title, Text } = Typography;

const ROLE_COLOR = {
  SUPER_ADMIN: "#a855f7",
  ADMIN: "#4f6ef7",
  USER: "#22c55e",
};

export default function DashboardPage() {
  const { user, role, displayName } = useAuth();
  const [stats, setStats] = useState(null);
  const [recentUsers, setRecentUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const { data } = await api.get("/users", {
          params: { page: 1, limit: 5 },
        });
        const all = data.data;
        const users = all.users || [];

        const total = all.total || 0;
        const admins = users.filter((u) => u.role === "ADMIN").length;
        const superAdmins = users.filter(
          (u) => u.role === "SUPER_ADMIN",
        ).length;
        const regularUsers = users.filter((u) => u.role === "USER").length;

        setStats({ total, admins, superAdmins, regularUsers });
        setRecentUsers(users.slice(0, 5));
      } catch {
        setStats({ total: 0, active: 0, inactive: 0, admins: 0 });
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const name = user?.username || user?.email?.split("@")[0] || "User";

  const statCards = [
    {
      label: "Total Users",
      value: stats?.total ?? "—",
      icon: <TeamOutlined />,
      color: "#4f6ef7",
      bg: "#eef0ff",
    },
    {
      label: "Regular Users",
      value: stats?.regularUsers ?? "—",
      icon: <UserOutlined />,
      color: "#22c55e",
      bg: "#f0fdf4",
    },
    {
      label: "Admins",
      value: stats?.admins ?? "—",
      icon: <CheckCircleOutlined />,
      color: "#f97316",
      bg: "#fff7ed",
    },
    {
      label: "Super Admins",
      value: stats?.superAdmins ?? "—",
      icon: <CrownOutlined />,
      color: "#a855f7",
      bg: "#faf5ff",
    },
  ];

  return (
    <div className="dashboard">
      <div className="page-hero">
        <Title level={3} style={{ margin: 0 }}>
          Good to see you, {name} 👋
        </Title>
        <Text type="secondary">Here's what's happening in your CMS today.</Text>
      </div>

      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: 60 }}>
          <Spin size="large" />
        </div>
      ) : (
        <>
          <Row gutter={[20, 20]} style={{ marginTop: 24 }}>
            {statCards.map((s) => (
              <Col xs={24} sm={12} lg={6} key={s.label}>
                <Card className="stat-card" bordered={false}>
                  <div className="stat-inner">
                    <div
                      className="stat-icon"
                      style={{ background: s.bg, color: s.color }}
                    >
                      {s.icon}
                    </div>
                    <div>
                      <div className="stat-value">
                        {typeof s.value === "number"
                          ? s.value.toLocaleString()
                          : s.value}
                      </div>
                      <div className="stat-label">{s.label}</div>
                    </div>
                  </div>
                </Card>
              </Col>
            ))}
          </Row>

          <Row gutter={[20, 20]} style={{ marginTop: 20 }}>
            <Col xs={24} lg={10}>
              <Card title="Your Account" bordered={false} className="dash-card">
                <div className="account-summary">
                  {/* <div
                    className="account-avatar"
                    style={{
                      background: ROLE_COLOR[role] + "22",
                      color: ROLE_COLOR[role],
                    }}
                  >
                    {name[0].toUpperCase()}
                  </div> */}
                  <div className="avatardetails-wrap">
                    <Avatar
                      size={50}
                      style={{
                        background: "#4f6ef7",
                        fontSize: 25,
                        fontWeight: 700,
                      }}
                    >
                      {name[0].toUpperCase()}
                    </Avatar>
                    <div className="accountdetails-wrap">
                      <div className="account-name">{name}</div>
                      <div className="account-email">{user?.email}</div>
                    </div>
                  </div>
                  <div
                    className="account-role-badge"
                    style={{
                      background: ROLE_COLOR[role] + "18",
                      color: ROLE_COLOR[role],
                    }}
                  >
                    {role}
                  </div>
                </div>
              </Card>
            </Col>
          </Row>
        </>
      )}
    </div>
  );
}
