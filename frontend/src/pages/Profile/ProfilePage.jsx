import React, { useState } from "react";
import { useDispatch } from "react-redux";
import {
  Card,
  Form,
  Input,
  Button,
  Avatar,
  Divider,
  Typography,
  Row,
  Col,
  message,
  Descriptions,
} from "antd";
import { EditOutlined, SaveOutlined, CloseOutlined } from "@ant-design/icons";
import { useAuth } from "../../hooks/useAuth";
import { fetchProfileThunk } from "../../features/auth/authSlice";
import api from "../../services/api";
import "./ProfilePage.css";

const { Title, Text } = Typography;

const ROLE_COLOR = {
  SUPER_ADMIN: "#a855f7",
  ADMIN: "#4f6ef7",
  USER: "#22c55e",
};

const ROLE_BG = {
  SUPER_ADMIN: "#faf5ff",
  ADMIN: "#eef0ff",
  USER: "#f0fdf4",
};

export default function ProfilePage() {
  const dispatch = useDispatch();
  const { user, role } = useAuth();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [changingPw, setChangingPw] = useState(false);
  const [pwSaving, setPwSaving] = useState(false);
  const [form] = Form.useForm();
  const [pwForm] = Form.useForm();

  const displayName = user?.username || user?.email?.split("@")[0] || "User";

  const handleEditSave = async () => {
    try {
      const values = await form.validateFields();
      setSaving(true);
      await api.put(`/users/${user.id}`, { username: values.username });
      await dispatch(fetchProfileThunk());
      message.success("Profile updated");
      setEditing(false);
    } catch (err) {
      if (err?.response?.data?.message)
        message.error(err.response.data.message);
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordSave = async () => {
    try {
      const values = await pwForm.validateFields();
      setPwSaving(true);
      await api.put(`/users/${user.id}`, { password: values.newPassword });
      message.success("Password changed successfully");
      pwForm.resetFields();
      setChangingPw(false);
    } catch (err) {
      if (err?.response?.data?.message)
        message.error(err.response.data.message);
    } finally {
      setPwSaving(false);
    }
  };

  const startEdit = () => {
    form.setFieldsValue({ username: user?.username || "" });
    setEditing(true);
  };

  return (
    <div className="profile-page">
      <div style={{ marginBottom: 24 }}>
        <Title level={3} style={{ margin: 0 }}>
          My Profile
        </Title>
        <Text type="secondary">View and manage your account information</Text>
      </div>

      <Row gutter={[24, 24]}>
        
        <Col xs={24} lg={8}>
          <Card bordered={false} className="profile-card identity-card">
            <div className="avatar-section">
              <Avatar
                size={88}
                style={{
                  background: ROLE_COLOR[role] || "#4f6ef7",
                  fontSize: 36,
                  fontWeight: 700,
                }}
              >
                {displayName[0].toUpperCase()}
              </Avatar>
              <div className="identity-name">{displayName}</div>
              <div className="identity-email">{user?.email}</div>
              <div
                className="identity-role"
                style={{ background: ROLE_BG[role], color: ROLE_COLOR[role] }}
              >
                {role}
              </div>
            </div>

            <Divider style={{ margin: "20px 0" }} />

            <Descriptions
              column={1}
              size="small"
              labelStyle={{ color: "#6b7080", fontWeight: 500, fontSize: 12 }}
            >
              <Descriptions.Item label="User ID">#{user?.id}</Descriptions.Item>
              <Descriptions.Item label="Member Since">
                {user?.createdAt
                  ? new Date(user.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })
                  : "—"}
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>

        
        <Col xs={24} lg={16}>
          <Card
            bordered={false}
            className="profile-card"
            title="Account Details"
            extra={
              !editing ? (
                <Button icon={<EditOutlined />} onClick={startEdit}>
                  Edit
                </Button>
              ) : (
                <Button
                  icon={<CloseOutlined />}
                  onClick={() => setEditing(false)}
                >
                  Cancel
                </Button>
              )
            }
          >
            {!editing ? (
              <Descriptions
                column={{ xs: 1, sm: 2 }}
                size="small"
                labelStyle={{ color: "#6b7080", fontWeight: 500 }}
              >
                <Descriptions.Item label="Username">
                  {user?.username || "—"}
                </Descriptions.Item>
                <Descriptions.Item label="Email">
                  {user?.email}
                </Descriptions.Item>
                <Descriptions.Item label="Role">{user?.role}</Descriptions.Item>
              </Descriptions>
            ) : (
              <Form form={form} layout="vertical">
                <Form.Item
                  name="username"
                  label="Username"
                  rules={[{ required: true, message: "Username is required" }]}
                >
                  <Input placeholder="johndoe" />
                </Form.Item>
                <Button
                  type="primary"
                  icon={<SaveOutlined />}
                  loading={saving}
                  onClick={handleEditSave}
                >
                  Save Changes
                </Button>
              </Form>
            )}
          </Card>

          <Card
            bordered={false}
            className="profile-card"
            style={{ marginTop: 20 }}
            title="Security"
            extra={
              !changingPw ? (
                <Button onClick={() => setChangingPw(true)}>
                  Change Password
                </Button>
              ) : (
                <Button
                  icon={<CloseOutlined />}
                  onClick={() => {
                    setChangingPw(false);
                    pwForm.resetFields();
                  }}
                >
                  Cancel
                </Button>
              )
            }
          >
            {!changingPw ? (
              <Text type="secondary">
                Your password is managed securely. Click "Change Password" to
                update it.
              </Text>
            ) : (
              <Form form={pwForm} layout="vertical">
                <Form.Item
                  name="newPassword"
                  label="New Password"
                  rules={[
                    { required: true, message: "Required" },
                    { min: 8, message: "At least 8 characters" },
                  ]}
                >
                  <Input.Password placeholder="Min. 8 characters" />
                </Form.Item>
                <Form.Item
                  name="confirmPassword"
                  label="Confirm New Password"
                  dependencies={["newPassword"]}
                  rules={[
                    { required: true, message: "Required" },
                    ({ getFieldValue }) => ({
                      validator(_, value) {
                        if (!value || getFieldValue("newPassword") === value)
                          return Promise.resolve();
                        return Promise.reject(
                          new Error("Passwords do not match"),
                        );
                      },
                    }),
                  ]}
                >
                  <Input.Password placeholder="Repeat new password" />
                </Form.Item>
                <Button
                  type="primary"
                  icon={<SaveOutlined />}
                  loading={pwSaving}
                  onClick={handlePasswordSave}
                >
                  Update Password
                </Button>
              </Form>
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
}
