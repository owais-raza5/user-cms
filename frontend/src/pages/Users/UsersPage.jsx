import React, { useEffect, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Button,
  Input,
  Select,
  Table,
  Tag,
  Space,
  Popconfirm,
  Tooltip,
  Typography,
  Card,
  message,
} from "antd";
import {
  PlusOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import { fetchUsers, deleteUser } from "../../features/users/usersSlice";
import { useAuth } from "../../hooks/useAuth";
import UserModal from "../../components/UserModal/UserModal";
import "./UsersPage.css";

const { Title, Text } = Typography;
const { Option } = Select;

const ROLE_COLORS = {
  SUPER_ADMIN: "purple",
  ADMIN: "blue",
  USER: "default",
};

export default function UsersPage() {
  const dispatch = useDispatch();
  const { list, total, loading } = useSelector((state) => state.users);
  const { isSuperAdmin, isAdmin } = useAuth();

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [modal, setModal] = useState({ open: false, mode: "add", user: null });

  const load = useCallback(() => {
    dispatch(fetchUsers({ page, limit: pageSize, search, role: roleFilter }));
  }, [dispatch, page, pageSize, search, roleFilter]);

  useEffect(() => {
    load();
  }, [load]);

  const handleDelete = async (id) => {
    const res = await dispatch(deleteUser(id));
    if (!res.error) message.success("User deleted");
    else message.error(res.payload || "Delete failed");
  };

  const openAdd = () => setModal({ open: true, mode: "add", user: null });
  const openEdit = (user) => setModal({ open: true, mode: "edit", user });
  const closeModal = () => setModal({ open: false, mode: "add", user: null });

  const baseColumns = [
    {
      title: "Role",
      dataIndex: "role",
      width: 130,
      render: (role) => (
        <Tag
          color={ROLE_COLORS[role] || "default"}
          style={{ fontFamily: "var(--font-mono)", fontSize: 11 }}
        >
          {role}
        </Tag>
      ),
    },
    {
      title: "Username",
      dataIndex: "username",
      render: (v) => (
        <span style={{ fontFamily: "var(--font-mono)", fontSize: 13 }}>
          {v || "—"}
        </span>
      ),
    },
    {
      title: "Email",
      dataIndex: "email",
      ellipsis: true,
    },
    {
      title: "Date Created",
      dataIndex: "createdAt",
      responsive: ["md"],
      render: (v) =>
        v
          ? new Date(v).toLocaleDateString("en-US", {
              year: "numeric",
              month: "short",
              day: "numeric",
            })
          : "—",
    },
  ];

  const actionsColumn = {
    title: "Actions",
    key: "actions",
    width: 90,
    render: (_, record) => (
      <Space>
        {isAdmin && (
          <Tooltip title="Edit">
            <Button
              type="text"
              icon={<EditOutlined />}
              size="small"
              onClick={() => openEdit(record)}
              style={{ color: "#4f6ef7" }}
            />
          </Tooltip>
        )}
        {isSuperAdmin && (
          <Popconfirm
            title="Delete User"
            description={`Permanently delete ${record.email}?`}
            okText="Delete"
            okType="danger"
            cancelText="Cancel"
            onConfirm={() => handleDelete(record.id)}
          >
            <Tooltip title="Delete">
              <Button
                type="text"
                icon={<DeleteOutlined />}
                size="small"
                danger
              />
            </Tooltip>
          </Popconfirm>
        )}
      </Space>
    ),
  };

  // Only append the actions column if the logged-in user can actually do something
  const columns = isAdmin ? [...baseColumns, actionsColumn] : baseColumns;

  return (
    <div className="users-page">
      <div className="page-top">
        <div>
          <Title level={3} style={{ margin: 0 }}>
            Users
          </Title>
          <Text type="secondary">{total} total users</Text>
        </div>
        {isSuperAdmin && (
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={openAdd}
            size="large"
          >
            Add User
          </Button>
        )}
      </div>

      <Card bordered={false} className="users-card">
        <div className="filters-row">
          <Input
            prefix={<SearchOutlined style={{ color: "#aaa" }} />}
            placeholder="Search by username or email..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            allowClear
            style={{ width: 280 }}
          />
          <Select
            placeholder="Filter by role"
            value={roleFilter || undefined}
            onChange={(v) => {
              setRoleFilter(v || "");
              setPage(1);
            }}
            allowClear
            style={{ width: 180 }}
          >
            <Option value="USER">USER</Option>
            <Option value="ADMIN">ADMIN</Option>
            <Option value="SUPER_ADMIN">SUPER_ADMIN</Option>
          </Select>
          <Button icon={<ReloadOutlined />} onClick={load}>
            Refresh
          </Button>
        </div>

        <Table
          columns={columns}
          dataSource={list}
          rowKey="id"
          loading={loading}
          scroll={{ x: 600 }}
          pagination={{
            current: page,
            pageSize,
            total,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (t, r) => `${r[0]}–${r[1]} of ${t} users`,
            onChange: (p, ps) => {
              setPage(p);
              setPageSize(ps);
            },
          }}
          style={{ marginTop: 16 }}
        />
      </Card>

      <UserModal
        open={modal.open}
        mode={modal.mode}
        user={modal.user}
        onClose={closeModal}
        onSuccess={() => {
          closeModal();
          load();
        }}
      />
    </div>
  );
}
