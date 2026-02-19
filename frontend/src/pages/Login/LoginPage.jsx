import React, { useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Form, Input, Button, Alert, Divider } from "antd";
import { UserOutlined, LockOutlined } from "@ant-design/icons";
import { loginThunk, clearErrors } from "../../features/auth/authSlice";
import "./LoginPage.css";

export default function LoginPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { loading, error, accessToken } = useSelector((state) => state.auth);

  const registered = location.state?.registered;
  const prefilledEmail = location.state?.email || "";

  useEffect(() => {
    if (accessToken) navigate("/dashboard");
    return () => dispatch(clearErrors());
  }, [accessToken, navigate, dispatch]);

  const onFinish = async (values) => {
    const result = await dispatch(loginThunk(values));
    if (!result.error) navigate("/dashboard");
  };

  return (
    <div className="login-page">
      <div className="login-left">
        <div className="login-brand">
          <span className="brand-name">
            USER CMS<span className="brand-dot">.</span>
          </span>
          <p className="brand-tagline">Created by Owais Raza</p>
        </div>
        <div className="login-decor">
          <div className="decor-circle c1" />
          <div className="decor-circle c2" />
          <div className="decor-circle c3" />
        </div>
      </div>

      <div className="login-right">
        <div className="login-card">
          <div className="login-header">
            <h1>Welcome back</h1>
            <p>Sign in to your account</p>
          </div>

          {registered && (
            <Alert
              message="Account created successfully! Please sign in."
              type="success"
              showIcon
              style={{ marginBottom: 20, borderRadius: 8 }}
            />
          )}

          {error && (
            <Alert
              message={error}
              type="error"
              showIcon
              closable
              onClose={() => dispatch(clearErrors())}
              style={{ marginBottom: 24, borderRadius: 8 }}
            />
          )}

          <Form
            layout="vertical"
            onFinish={onFinish}
            size="large"
            initialValues={{ email: prefilledEmail }}
          >
            <Form.Item
              name="email"
              label="Email address"
              rules={[
                { required: true, message: "Please enter your email" },
                { type: "email", message: "Invalid email format" },
              ]}
            >
              <Input
                prefix={<UserOutlined />}
                placeholder="admin@example.com"
              />
            </Form.Item>

            <Form.Item
              name="password"
              label="Password"
              rules={[
                { required: true, message: "Please enter your password" },
              ]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="••••••••"
              />
            </Form.Item>

            <Form.Item style={{ marginBottom: 0 }}>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                block
                style={{ height: 46, fontWeight: 600, fontSize: 15 }}
              >
                Sign In
              </Button>
            </Form.Item>
          </Form>

          <Divider style={{ margin: "20px 0" }} />

          <p
            style={{
              textAlign: "center",
              color: "var(--color-text-secondary)",
              fontSize: 14,
              margin: 0,
            }}
          >
            Don't have an account?{" "}
            <Link
              to="/register"
              style={{ color: "var(--color-accent)", fontWeight: 600 }}
            >
              Create account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
