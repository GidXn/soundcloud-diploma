// src/pages/admin/PlaylistsPage.tsx
import { useEffect, useState } from "react";
import { Table, Button, Space, message, Modal, Input, Form } from "antd";
import { adminApi } from "../../services/adminApi";

const PlaylistsPage = () => {
    const [playlists, setPlaylists] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [form] = Form.useForm();

    const loadPlaylists = async () => {
        setLoading(true);
        try {
            const res = await adminApi.getPlaylists();
            setPlaylists(res.data);
        } catch {
            message.error("Не вдалося завантажити плейлісти");
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

            message.success("Плейліст створено");
            setIsModalVisible(false);
            form.resetFields();
            loadPlaylists();
        } catch (err) {
            message.error("Помилка при створенні плейліста");
        }
    };

    const handleDelete = async (id: number) => {
        await adminApi.deletePlaylist(id);
        message.success("Плейліст видалено");
        loadPlaylists();
    };

    // ===== Upload Cover =====
    const handleUploadCover = async (id: number, file: File) => {
        try {
            await adminApi.uploadPlaylistCover(id, file);
            message.success("Обкладинка оновлена");
            loadPlaylists();
        } catch {
            message.error("Помилка при завантаженні обкладинки");
        }
    };

    const columns = [
        { title: "ID", dataIndex: "id" },
        { title: "Назва", dataIndex: "name" },
        { title: "Опис", dataIndex: "description" },
        { title: "Власник", dataIndex: ["owner", "username"] },
        {
            title: "Дії",
            render: (_: any, record: any) => (
                <Space>
                    <Button danger onClick={() => handleDelete(record.id)}>Видалити</Button>
                    <Button
                        onClick={() => {
                            const fileInput = document.createElement("input");
                            fileInput.type = "file";
                            fileInput.onchange = (e: any) => {
                                const file = e.target.files[0];
                                if (file) handleUploadCover(record.id, file);
                            };
                            fileInput.click();
                        }}
                    >
                        Завантажити обкладинку
                    </Button>
                </Space>
            ),
        },
    ];

    return (
        <>
            <Button type="primary" style={{ marginBottom: 16 }} onClick={() => setIsModalVisible(true)}>
                Створити плейліст
            </Button>

            <Table rowKey="id" columns={columns} dataSource={playlists} loading={loading} />

            <Modal
                title="Створити плейліст"
                visible={isModalVisible}
                onOk={handleCreate}
                onCancel={() => setIsModalVisible(false)}
            >
                <Form form={form} layout="vertical">
                    <Form.Item name="name" label="Назва" rules={[{ required: true }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item name="description" label="Опис">
                        <Input.TextArea />
                    </Form.Item>
                </Form>
            </Modal>
        </>
    );
};

export default PlaylistsPage;
