import React, { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Form, Input, Button, Alert, Divider } from "antd";
import { UserOutlined } from "@ant-design/icons";
import { forgotPasswordThunk, clearErrors } from "../../features/auth/authSlice";
import "./ForgotPassword.css";

export default function ForgotPasswordPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { forgotLoading, forgotError, forgotSuccess } = useSelector((state) => state.auth);

  useEffect(() => {
    return () => dispatch(clearErrors());
  }, [dispatch]);

  useEffect(() => {
    if (forgotSuccess) {
      const timer = setTimeout(() => navigate("/login"), 3000);
      return () => clearTimeout(timer);
    }
  }, [forgotSuccess, navigate]);

  const onFinish = ({ email }) => {
    dispatch(forgotPasswordThunk(email));
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
            <h1>Forgot Password</h1>
            <p>Enter your email and we'll send you a reset link</p>
          </div>

          {forgotError && (
            <Alert
              message={forgotError}
              type="error"
              showIcon
              closable
              onClose={() => dispatch(clearErrors())}
              style={{ marginBottom: 20, borderRadius: 8 }}
            />
          )}

          {forgotSuccess && (
            <Alert
              message="Reset link sent! Check your inbox. Redirecting to login..."
              type="success"
              showIcon
              style={{ marginBottom: 20, borderRadius: 8 }}
            />
          )}

          <Form layout="vertical" onFinish={onFinish} size="large" disabled={!!forgotSuccess}>
            <Form.Item
              name="email"
              label="Email address"
              rules={[
                { required: true, message: "Please enter your email" },
                { type: "email", message: "Invalid email format" },
              ]}
            >
              <Input prefix={<UserOutlined />} placeholder="admin@example.com" />
            </Form.Item>

            <Form.Item style={{ marginBottom: 0 }}>
              <Button
                type="primary"
                htmlType="submit"
                loading={forgotLoading}
                block
                style={{ height: 46, fontWeight: 600, fontSize: 15 }}
              >
                Send Reset Link
              </Button>
            </Form.Item>
          </Form>

          <Divider style={{ margin: "20px 0" }} />

          <p style={{ textAlign: "center", color: "var(--color-text-secondary)", fontSize: 14, margin: 0 }}>
            <Link to="/login" style={{ color: "var(--color-accent)", fontWeight: 600 }}>
              Back to Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
