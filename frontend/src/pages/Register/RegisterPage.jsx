import React, { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { Form, Input, Button, Alert, Divider } from 'antd'
import { UserOutlined, LockOutlined, MailOutlined } from '@ant-design/icons'
import { registerThunk, clearErrors } from '../../features/auth/authSlice'
import '../Login/LoginPage.css'
import './RegisterPage.css'

export default function RegisterPage() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { registerLoading, registerError, accessToken } = useSelector((state) => state.auth)

  useEffect(() => {
    if (accessToken) navigate('/dashboard')
    return () => dispatch(clearErrors())
  }, [accessToken, navigate, dispatch])

  const onFinish = async (values) => {
    const { confirmPassword, ...payload } = values
    
    const clean = Object.fromEntries(
      Object.entries(payload).filter(([, v]) => v !== undefined && v !== '')
    )
    const result = await dispatch(registerThunk(clean))
    if (!result.error) {
      navigate('/login', { state: { registered: true, email: values.email } })
    }
  }

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

      <div className="login-right register-right">
        <div className="login-card register-card">
          <div className="login-header">
            <h1>Create account</h1>
            <p>Fill in the details below to get started</p>
          </div>

          {registerError && (
            <Alert
              message={registerError}
              type="error"
              showIcon
              closable
              onClose={() => dispatch(clearErrors())}
              style={{ marginBottom: 20, borderRadius: 8 }}
            />
          )}

          <Form layout="vertical" onFinish={onFinish} size="large">
            <Form.Item
              name="username"
              label="Username"
              rules={[{ required: true, message: "Username is required" }]}
            >
              <Input prefix={<UserOutlined />} placeholder="johndoe" />
            </Form.Item>

            <Form.Item
              name="email"
              label="Email Address"
              rules={[
                { required: true, message: "Email is required" },
                { type: "email", message: "Invalid email format" },
              ]}
            >
              <Input prefix={<MailOutlined />} placeholder="john@example.com" />
            </Form.Item>

            <Form.Item
              name="password"
              label="Password"
              rules={[
                { required: true, message: "Password is required" },
                { min: 8, message: "At least 8 characters" },
              ]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="Min. 8 characters"
              />
            </Form.Item>

            <Form.Item
              name="confirmPassword"
              label="Confirm Password"
              dependencies={["password"]}
              rules={[
                { required: true, message: "Please confirm your password" },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue("password") === value)
                      return Promise.resolve();
                    return Promise.reject(new Error("Passwords do not match"));
                  },
                }),
              ]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="Repeat password"
              />
            </Form.Item>

            <Form.Item style={{ marginBottom: 0, marginTop: 4 }}>
              <Button
                type="primary"
                htmlType="submit"
                loading={registerLoading}
                block
                style={{ height: 46, fontWeight: 600, fontSize: 15 }}
              >
                Create Account
              </Button>
            </Form.Item>
          </Form>

          <Divider style={{ margin: "20px 0" }} />

          <p className="register-footer-text">
            Already have an account?{" "}
            <Link to="/login" className="register-link">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
