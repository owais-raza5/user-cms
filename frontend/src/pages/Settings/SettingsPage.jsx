import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Card,
  Form,
  Input,
  Button,
  Divider,
  Typography,
  Switch,
  Row,
  Col,
  message,
  Tag,
  Avatar,
} from "antd";
import { SaveOutlined } from "@ant-design/icons";
import { updateUser } from "../../features/users/usersSlice";
import { fetchProfileThunk } from "../../features/auth/authSlice";

const { Title, Text } = Typography;
const ROLE_COLORS = { SUPER_ADMIN: "purple", ADMIN: "blue", USER: "default" };

export default function SettingsPage() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [form] = Form.useForm();
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      form.setFieldsValue({ username: user.username || "" });
    }
  }, [user, form]);

  const handleSave = async () => {
    let values;
    try {
      values = await form.validateFields();
    } catch {
      return;
    }

    if (!values.password) delete values.password;
    const payload = Object.fromEntries(
      Object.entries(values).filter(([, v]) => v !== "" && v !== undefined),
    );

    setSaving(true);
    const res = await dispatch(updateUser({ id: user.id, ...payload }));
    setSaving(false);

    if (!res.error) {
      await dispatch(fetchProfileThunk());
      message.success("Settings saved successfully");
    } else {
      message.error(res.payload || "Update failed");
    }
  };

  const displayName = user?.username || user?.email?.split("@")[0] || "User";

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Title level={3} style={{ margin: 0 }}>
          Settings
        </Title>
        <Text type="secondary">Manage your account and preferences</Text>
      </div>

      <Row gutter={[20, 20]}>
        {/* Profile summary */}
        <Col xs={24} lg={8}>
          <Card
            bordered={false}
            style={{
              borderRadius: 10,
              boxShadow: "var(--shadow)",
              textAlign: "center",
            }}
          >
            <Avatar
              size={80}
              style={{ background: "#4f6ef7", fontSize: 30, fontWeight: 700 }}
            >
              {displayName[0].toUpperCase()}
            </Avatar>
            <div style={{ marginTop: 16 }}>
              <div
                style={{
                  fontSize: 18,
                  fontWeight: 700,
                  color: "var(--color-text-primary)",
                }}
              >
                {displayName}
              </div>
              <div
                style={{
                  color: "var(--color-text-secondary)",
                  fontSize: 13,
                  marginTop: 2,
                }}
              >
                {user?.email}
              </div>
              <Tag
                color={ROLE_COLORS[user?.role] || "default"}
                style={{
                  marginTop: 10,
                  fontFamily: "var(--font-mono)",
                  fontSize: 11,
                }}
              >
                {user?.role}
              </Tag>
            </div>

            <Divider />

            <div style={{ textAlign: "left" }}>
              {[
                { label: "Username", value: user?.username || "—" },
                {
                  label: "Member since",
                  value: user?.createdAt
                    ? new Date(user.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                      })
                    : "—",
                },
              ].map(({ label, value }) => (
                <div
                  key={label}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: 10,
                  }}
                >
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    {label}
                  </Text>
                  <Text style={{ fontSize: 12, fontWeight: 600 }}>{value}</Text>
                </div>
              ))}
            </div>
          </Card>
        </Col>

        {/* Edit form */}
        <Col xs={24} lg={16}>
          <Card
            title="Edit Profile"
            bordered={false}
            style={{
              borderRadius: 10,
              boxShadow: "var(--shadow)",
              marginBottom: 20,
            }}
          >
            <Form form={form} layout="vertical">
              <Form.Item name="username" label="Username">
                <Input placeholder="johndoe" />
              </Form.Item>

              <Form.Item label="Email Address">
                <Input value={user?.email} disabled />
                <Text
                  type="secondary"
                  style={{ fontSize: 11, marginTop: 4, display: "block" }}
                >
                  Email cannot be changed.
                </Text>
              </Form.Item>

              <Divider>Change Password</Divider>

              <Form.Item
                name="password"
                label="New Password"
                rules={[{ min: 8, message: "Minimum 8 characters" }]}
                extra="Leave blank to keep your current password"
              >
                <Input.Password
                  placeholder="New password (optional)"
                  autoComplete="new-password"
                />
              </Form.Item>

              <Button
                type="primary"
                icon={<SaveOutlined />}
                loading={saving}
                onClick={handleSave}
                size="large"
              >
                Save Changes
              </Button>
            </Form>
          </Card>

          {/* Preferences */}
          <Card
            title="Preferences"
            bordered={false}
            style={{ borderRadius: 10, boxShadow: "var(--shadow)" }}
          >
            {[
              {
                label: "Email Notifications",
                sub: "Receive email alerts for user actions",
                default: true,
              },
              {
                label: "Two-Factor Authentication",
                sub: "Add an extra layer of login security",
                default: false,
              },
              {
                label: "Activity Logging",
                sub: "Log all admin actions for audit trail",
                default: true,
              },
            ].map((pref) => (
              <div
                key={pref.label}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 20,
                }}
              >
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>
                    {pref.label}
                  </div>
                  <div
                    style={{
                      fontSize: 12,
                      color: "var(--color-text-secondary)",
                      marginTop: 2,
                    }}
                  >
                    {pref.sub}
                  </div>
                </div>
                <Switch defaultChecked={pref.default} />
              </div>
            ))}
          </Card>
        </Col>
      </Row>
    </div>
  );
}
