import React, { useEffect } from "react";
import { useDispatch } from "react-redux";
import { Modal, Form, Input, Select, Divider, Typography, message } from "antd";
import { createUser, updateUser } from "../../features/users/usersSlice";
import { useAuth } from "../../hooks/useAuth";

const { Option } = Select;
const { Text } = Typography;

export default function UserModal({ open, mode, user, onClose, onSuccess }) {
  const dispatch = useDispatch();
  const { isSuperAdmin } = useAuth();
  const [form] = Form.useForm();

  useEffect(() => {
    if (open) {
      if (mode === "edit" && user) {
        form.setFieldsValue({
          username: user.username || "",
          email: user.email,
          role: user.role,
        });
      } else {
        form.resetFields();
      }
    }
  }, [open, mode, user, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const payload = Object.fromEntries(
        Object.entries(values).filter(([, v]) => v !== undefined && v !== ""),
      );

      const res =
        mode === "add"
          ? await dispatch(createUser(payload))
          : await dispatch(updateUser({ id: user.id, ...payload }));

      if (!res.error) {
        message.success(
          mode === "add"
            ? "User created successfully"
            : "User updated successfully",
        );
        onSuccess();
      } else {
        message.error(res.payload || "Something went wrong");
      }
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <Modal
      open={open}
      title={mode === "add" ? "➕ Add New User" : "✏️ Edit User"}
      okText={mode === "add" ? "Create User" : "Save Changes"}
      cancelText="Cancel"
      onOk={handleSubmit}
      onCancel={onClose}
      destroyOnClose
      width={480}
      styles={{ body: { paddingTop: 8 } }}
    >
      <Form form={form} layout="vertical" style={{ marginTop: 12 }}>
        <Form.Item
          name="username"
          label="Username"
          rules={[{ required: true, message: "Username is required" }]}
        >
          <Input placeholder="johndoe" />
        </Form.Item>

        <Form.Item
          name="email"
          label="Email Address"
          rules={[
            { required: true, message: "Email is required" },
            { type: "email", message: "Invalid email format" },
          ]}
        >
          <Input placeholder="john@example.com" disabled={mode === "edit"} />
        </Form.Item>

        {mode === "add" && (
          <Form.Item
            name="password"
            label="Password"
            rules={[
              { required: true, message: "Password is required" },
              { min: 8, message: "Minimum 8 characters" },
            ]}
          >
            <Input.Password placeholder="Min. 8 characters" />
          </Form.Item>
        )}

        <Divider style={{ margin: "8px 0 16px" }} />

        <Form.Item
          name="role"
          label="Role"
          rules={[{ required: true, message: "Role is required" }]}
          initialValue="USER"
        >
          <Select disabled={!isSuperAdmin}>
            <Option value="USER">USER</Option>
            <Option value="ADMIN">ADMIN</Option>
            <Option value="SUPER_ADMIN">SUPER ADMIN</Option>
          </Select>
        </Form.Item>

        {!isSuperAdmin && (
          <Text type="secondary" style={{ fontSize: 12 }}>
            ℹ️ Role assignment requires SUPER ADMIN privileges.
          </Text>
        )}
      </Form>
    </Modal>
  );
}
