// src/pages/admin/AlbumsPage.tsx
import { useEffect, useState } from "react";
import { Table, Button, Space, message, Modal, Input, Form } from "antd";
import { adminApi } from "../../services/adminApi";

const AlbumsPage = () => {
    const [albums, setAlbums] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isEditModalVisible, setIsEditModalVisible] = useState(false);
    const [form] = Form.useForm();
    const [editForm] = Form.useForm();
    const [editingAlbum, setEditingAlbum] = useState<any | null>(null);

    const loadAlbums = async () => {
        setLoading(true);
        try {
            const res = await adminApi.getAlbumsForAdmin();
            setAlbums(res.data);
        } catch {
            message.error("Не вдалося завантажити альбоми");
        }
        setLoading(false);
    };

    useEffect(() => {
        loadAlbums();
    }, []);

    // ===== Create =====
    const handleCreate = async () => {
        try {
            const values = await form.validateFields();

            const formData = new FormData();
            formData.append("Title", values.title);
            formData.append("Description", values.description);
            formData.append("OwnerId", "1");
            formData.append("IsPublic", "true");

            await adminApi.createAlbum(formData);

            message.success("Альбом створено");
            setIsModalVisible(false);
            form.resetFields();
            loadAlbums();
        } catch (err) {
            message.error("Помилка при створенні альбому");
        }
    };

    // ===== Edit =====
    const handleEditOpen = (album: any) => {
        setEditingAlbum(album);
        editForm.setFieldsValue({
            title: album.title,
            description: album.description,
        });
        setIsEditModalVisible(true);
    };

    const handleEditSave = async () => {
        if (!editingAlbum) return;
        try {
            const values = await editForm.validateFields();
            const payload = {
                title: values.title,
                description: values.description || "",
                ownerId: editingAlbum.ownerId ?? editingAlbum.ownerId ?? editingAlbum.owner?.id ?? 0,
                isPublic: editingAlbum.isPublic ?? true,
            };

            await adminApi.updateAlbum(editingAlbum.id, payload);
            message.success("Альбом оновлено");
            setIsEditModalVisible(false);
            setEditingAlbum(null);
            editForm.resetFields();
            loadAlbums();
        } catch {
            message.error("Помилка при оновленні альбому");
        }
    };

    // ===== Delete =====
    const handleDelete = async (id: number) => {
        await adminApi.deleteAlbum(id);
        message.success("Альбом видалено");
        loadAlbums();
    };

    // ===== Upload Cover =====
    const handleUploadCover = async (id: number, file: File) => {
        try {
            await adminApi.uploadAlbumCover(id, file);
            message.success("Обкладинка оновлена");
            loadAlbums();
        } catch {
            message.error("Помилка при завантаженні обкладинки");
        }
    };

    const columns = [
        { title: "ID", dataIndex: "id" },
        { title: "Title", dataIndex: "title" },
        { title: "Description", dataIndex: "description" },
        { title: "Owner", dataIndex: ["owner", "username"] },
        {
            title: "Actions",
            render: (_: any, record: any) => (
                <Space>
                    <Button onClick={() => handleEditOpen(record)}>Edit</Button>
                    <Button danger onClick={() => handleDelete(record.id)}>Delete</Button>
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
                        Upload Cover
                    </Button>
                </Space>
            ),
        },
    ];

    return (
        <>
            <Button type="primary" style={{ marginBottom: 16 }} onClick={() => setIsModalVisible(true)}>
                Create Album
            </Button>

            <Table rowKey="id" columns={columns} dataSource={albums} loading={loading} />

            <Modal
                title="Create Album"
                visible={isModalVisible}
                onOk={handleCreate}
                onCancel={() => setIsModalVisible(false)}
            >
                <Form form={form} layout="vertical">
                    <Form.Item name="title" label="Title" rules={[{ required: true }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item name="description" label="Description">
                        <Input.TextArea />
                    </Form.Item>
                </Form>
            </Modal>

            <Modal
                title="Edit Album"
                visible={isEditModalVisible}
                onOk={handleEditSave}
                onCancel={() => {
                    setIsEditModalVisible(false);
                    setEditingAlbum(null);
                    editForm.resetFields();
                }}
            >
                <Form form={editForm} layout="vertical">
                    <Form.Item name="title" label="Title" rules={[{ required: true, message: "Enter title" }]}>
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

export default AlbumsPage;
