import { useEffect, useState } from "react";
import { Table, Button, Space, message, Modal, Form, Input, Select } from "antd";
import { adminApi } from "../../services/adminApi";

const { Option } = Select;

const UsersPage = () => {
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [form] = Form.useForm();
    const [editingUser, setEditingUser] = useState<any>(null);

    const loadUsers = async () => {
        setLoading(true);
        try {
            const res = await adminApi.getUsers();
            setUsers(res.data);
        } catch {
            message.error("Failed to load users");
        }
        setLoading(false);
    };

    useEffect(() => {
        loadUsers();
    }, []);

    const handleDelete = async (id: number) => {
        await adminApi.deleteUser(id);
        message.success("User deleted");
        loadUsers();
    };

    const handleEdit = (user: any) => {
        setEditingUser(user);
        form.setFieldsValue({
            username: user.username,
            email: user.email,
            // the form keeps a readable value, but the backend gets 0/2
            role: user.role === 2 || user.role === "Admin" ? "Admin" : "User",
        });
        setModalVisible(true);
    };

    const handleCreateOrUpdate = async () => {
        try {
            const values = await form.validateFields();

            if (editingUser) {
                const { password, confirmPassword, role, ...updateData } = values;

                // Update the main data
                await adminApi.updateUser(editingUser.id, updateData);

                // Map the text role to a code: 0 = User, 2 = Admin
                const newRoleCode = role === "Admin" || role === 2 ? 2 : 0;
                const currentRoleCode =
                    editingUser.role === "Admin" || editingUser.role === 2 ? 2 : 0;

                // If the role changed, a separate backend call
                if (newRoleCode !== currentRoleCode) {
                    await adminApi.changeUserRole(editingUser.id, newRoleCode);
                }

                message.success("User updated");
            } else {
                // Creating a new user: password and confirmPassword
                if (!values.password || !values.confirmPassword) {
                    message.error("Enter a password and confirmation");
                    return;
                }
                if (values.password !== values.confirmPassword) {
                    message.error("Passwords don't match");
                    return;
                }
                await adminApi.createUser({
                    username: values.username,
                    email: values.email,
                    password: values.password,
                    confirmPassword: values.confirmPassword,
                });
                message.success("User created");
            }

            setModalVisible(false);
            form.resetFields();
            setEditingUser(null);
            loadUsers();
        } catch (error) {
            message.error("Operation failed");
            console.error(error);
        }
    };

    const columns = [
        { title: "ID", dataIndex: "id" },
        { title: "Email", dataIndex: "email" },
        { title: "Username", dataIndex: "username" },
        { title: "Role", dataIndex: "role" },
        {
            title: "Actions",
            render: (_: any, record: any) => (
                <Space>
                    <Button onClick={() => handleEdit(record)}>Edit</Button>
                    <Button danger onClick={() => handleDelete(record.id)}>Delete</Button>
                </Space>
            ),
        },
    ];

    return (
        <>
            <Button type="primary" onClick={() => setModalVisible(true)} style={{ marginBottom: 16 }}>
                Add user
            </Button>

            <Table rowKey="id" columns={columns} dataSource={users} loading={loading} />

            <Modal
                title={editingUser ? "Edit user" : "Add user"}
                open={modalVisible}
                onCancel={() => {
                    setModalVisible(false);
                    form.resetFields();
                    setEditingUser(null);
                }}
                onOk={handleCreateOrUpdate}
            >
                <Form form={form} layout="vertical">
                    <Form.Item
                        label="Username"
                        name="username"
                        rules={[{ required: true, message: "Enter username" }]}
                    >
                        <Input />
                    </Form.Item>

                    <Form.Item
                        label="Email"
                        name="email"
                        rules={[{ required: true, message: "Enter email" }]}
                    >
                        <Input />
                    </Form.Item>

                    <Form.Item
                        label="Role"
                        name="role"
                        rules={[{ required: true, message: "Select a role" }]}
                    >
                        <Select>
                            <Option value="User">User</Option>
                            <Option value="Admin">Admin</Option>
                        </Select>
                    </Form.Item>

                    {!editingUser && (
                        <>
                            <Form.Item
                                label="Password"
                                name="password"
                                rules={[{ required: true, message: "Enter a password" }]}
                            >
                                <Input.Password />
                            </Form.Item>

                            <Form.Item
                                label="Confirm Password"
                                name="confirmPassword"
                                rules={[{ required: true, message: "Confirm password" }]}
                            >
                                <Input.Password />
                            </Form.Item>
                        </>
                    )}
                </Form>
            </Modal>
        </>
    );
};

export default UsersPage;
