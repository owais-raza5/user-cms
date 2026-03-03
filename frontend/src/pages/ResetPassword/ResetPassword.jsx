import React, { useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Form, Input, Button, Alert, Divider } from "antd";
import { LockOutlined } from "@ant-design/icons";
import { resetPasswordThunk, clearErrors } from "../../features/auth/authSlice";
import "./ResetPassword.css";

export default function ResetPasswordPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const { resetLoading, resetError, resetSuccess } = useSelector((state) => state.auth);

  useEffect(() => {
    return () => dispatch(clearErrors());
  }, [dispatch]);

  useEffect(() => {
    if (resetSuccess) {
      const timer = setTimeout(() => navigate("/login"), 2000);
      return () => clearTimeout(timer);
    }
  }, [resetSuccess, navigate]);

  if (!token) {
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
              <h1>Invalid Link</h1>
              <p>This reset link is missing or malformed.</p>
            </div>
            <Alert
              message="No reset token found. Please request a new password reset link."
              type="error"
              showIcon
              style={{ marginBottom: 24, borderRadius: 8 }}
            />
            <Link to="/forgot-password">
              <Button type="primary" block style={{ height: 46, fontWeight: 600 }}>
                Request New Link
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const onFinish = ({ password }) => {
    dispatch(resetPasswordThunk({ token, password }));
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
            <h1>Reset Password</h1>
            <p>Enter your new password below</p>
          </div>

          {resetError && (
            <Alert
              message={resetError}
              type="error"
              showIcon
              closable
              onClose={() => dispatch(clearErrors())}
              style={{ marginBottom: 20, borderRadius: 8 }}
            />
          )}

          {resetSuccess && (
            <Alert
              message="Password reset successfully! Redirecting to login..."
              type="success"
              showIcon
              style={{ marginBottom: 20, borderRadius: 8 }}
            />
          )}

          <Form layout="vertical" onFinish={onFinish} size="large" disabled={!!resetSuccess}>
            <Form.Item
              name="password"
              label="New Password"
              rules={[
                { required: true, message: "Please enter a new password" },
                { min: 6, message: "Password must be at least 6 characters" },
              ]}
            >
              <Input.Password prefix={<LockOutlined />} placeholder="••••••••" />
            </Form.Item>

            <Form.Item
              name="confirmPassword"
              label="Confirm New Password"
              dependencies={["password"]}
              rules={[
                { required: true, message: "Please confirm your password" },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue("password") === value) return Promise.resolve();
                    return Promise.reject(new Error("Passwords do not match"));
                  },
                }),
              ]}
            >
              <Input.Password prefix={<LockOutlined />} placeholder="••••••••" />
            </Form.Item>

            <Form.Item style={{ marginBottom: 0 }}>
              <Button
                type="primary"
                htmlType="submit"
                loading={resetLoading}
                block
                style={{ height: 46, fontWeight: 600, fontSize: 15 }}
              >
                Reset Password
              </Button>
            </Form.Item>
          </Form>

          <Divider style={{ margin: "20px 0" }} />

          <p className="reset-link">
            <Link to="/login">
              Back to Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
