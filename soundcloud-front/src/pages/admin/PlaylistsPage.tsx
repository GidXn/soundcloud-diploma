// src/pages/admin/PlaylistsPage.tsx
import { useEffect, useState } from "react";
import { Table, Button, Space, message, Modal, Input, Form } from "antd";
import { adminApi } from "../../services/adminApi";
import { AdminPlaylist } from "../../types/admin";

const PlaylistsPage = () => {
    const [playlists, setPlaylists] = useState<AdminPlaylist[]>([]);
    const [loading, setLoading] = useState(false);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [form] = Form.useForm();

    const loadPlaylists = async () => {
        setLoading(true);
        try {
            const res = await adminApi.getPlaylists();
            setPlaylists(res.data);
        } catch {
            message.error("Failed to load playlists");
        }
        setLoading(false);
    };

    useEffect(() => {
        loadPlaylists();
    }, []);

    // ===== Create =====
    const handleCreate = async () => {
        try {
            const values = await form.validateFields();

            const formData = new FormData();
            formData.append("Name", values.title);
            formData.append("Description", values.description);
            formData.append("OwnerId", "1");

            await adminApi.createPlaylist(formData);

            message.success("Playlist created");
            setIsModalVisible(false);
            form.resetFields();
            loadPlaylists();
        } catch {
            message.error("Failed to create playlist");
        }
    };

    const handleDelete = async (id: number) => {
        await adminApi.deletePlaylist(id);
        message.success("Playlist deleted");
        loadPlaylists();
    };

    // ===== Upload Cover =====
    const handleUploadCover = async (id: number, file: File) => {
        try {
            await adminApi.uploadPlaylistCover(id, file);
            message.success("Cover updated");
            loadPlaylists();
        } catch {
            message.error("Failed to upload cover");
        }
    };

    const columns = [
        { title: "ID", dataIndex: "id" },
        { title: "Title", dataIndex: "name" },
        { title: "Description", dataIndex: "description" },
        { title: "Owner", dataIndex: ["owner", "username"] },
        {
            title: "Actions",
            render: (_: unknown, record: AdminPlaylist) => (
                <Space>
                    <Button danger onClick={() => handleDelete(record.id)}>Delete</Button>
                    <Button
                        onClick={() => {
                            const fileInput = document.createElement("input");
                            fileInput.type = "file";
                            fileInput.onchange = (e: Event) => {
                                const file = (e.target as HTMLInputElement | null)?.files?.[0];
                                if (file) handleUploadCover(record.id, file);
                            };
                            fileInput.click();
                        }}
                    >
                        Upload cover
                    </Button>
                </Space>
            ),
        },
    ];

    return (
        <>
            <Button type="primary" style={{ marginBottom: 16 }} onClick={() => setIsModalVisible(true)}>
                Create playlist
            </Button>

            <Table rowKey="id" columns={columns} dataSource={playlists} loading={loading} />

            <Modal
                title="Create playlist"
                visible={isModalVisible}
                onOk={handleCreate}
                onCancel={() => setIsModalVisible(false)}
            >
                <Form form={form} layout="vertical">
                    <Form.Item name="name" label="Title" rules={[{ required: true }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item name="description" label="Description">
                        <Input.TextArea />
                    </Form.Item>
                </Form>
            </Modal>
        </>
    );
};

export default PlaylistsPage;
