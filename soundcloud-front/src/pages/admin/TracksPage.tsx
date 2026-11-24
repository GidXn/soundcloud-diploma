// src/pages/admin/TracksPage.tsx
import { useEffect, useState } from "react";
import {Table, Button, Space, message, Upload, Form, Input, Modal, InputNumber} from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { adminApi } from "../../services/adminApi";
import { AdminTrack, TrackFormValues } from "../../types/admin";

const TracksPage = () => {
    const [tracks, setTracks] = useState<AdminTrack[]>([]);
    const [loading, setLoading] = useState(false);
    const [form] = Form.useForm();
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingTrack, setEditingTrack] = useState<AdminTrack | null>(null);

// Open the modal for editing
    const handleEdit = (track: AdminTrack) => {
        setEditingTrack(track);
        setIsModalVisible(true);
        form.setFieldsValue({
            title: track.title,
            duration: track.duration,
            albumId: track.albumId,
            genreId: track.genreId,
            // files are not set, they have to be selected again
        });
    };
    const handleSave = async (values: TrackFormValues) => {
        try {
            const { title, duration, albumId, file, cover, genreId } = values;

            // Convert genreId and albumId to numbers
            const genreIdNumber = Number(genreId);
            const albumIdNumber = Number(albumId);

            if (!genreIdNumber) {
                message.error("All required fields must be filled in");
                return;
            }

            if (editingTrack) {
                // Editing a track
                await adminApi.updateTrack(editingTrack.id, {
                    title,
                    duration,
                    albumId: albumIdNumber,
                    file: file?.[0]?.originFileObj,
                    cover: cover?.[0]?.originFileObj,
                    genreId: genreIdNumber
                });
                message.success("Track updated");
            } else {
                // Creating a track
                await adminApi.createTrack(
                    title,
                    duration,
                    albumIdNumber,
                    file?.[0]?.originFileObj as File,
                    cover?.[0]?.originFileObj as File,
                    genreIdNumber
                );
                message.success("Track created");
            }

            // Close the modal and clear the form
            setIsModalVisible(false);
            setEditingTrack(null);
            form.resetFields();
            loadTracks();
        } catch (error) {
            console.error("Failed to save track", error);
            message.error("Failed to save track");
        }
    };
    const loadTracks = async () => {
        setLoading(true);
        try {
            const res = await adminApi.getTracks();
            setTracks(res.data);
        } catch {
            message.error("Failed to load tracks");
        }
        setLoading(false);
    };

    useEffect(() => {
        loadTracks();
    }, []);

    // const handleCreate = async (values: TrackFormValues) => {
    //     try {
    //         const { title, duration, albumId, file } = values;
    //         const realFile = file[0].originFileObj; // correct access
    //
    //         await adminApi.createTrack(title, duration, albumId, realFile);
    //         message.success("Track created");
    //         setIsModalVisible(false);
    //         form.resetFields();
    //         loadTracks();
    //     } catch {
    //         message.error("Failed to create track");
    //     }
    // };

    const handleDelete = async (id: number) => {
        await adminApi.deleteTrack(id);
        message.success("Track deleted");
        loadTracks();
    };

    const handleHideUnhide = async (id: number, hidden: boolean) => {
        try {
            if (hidden) {
                await adminApi.unhideTrack(id);
                message.success("Track restored");
            } else {
                await adminApi.hideTrack(id);
                message.success("Track hidden");
            }
            loadTracks();
        } catch {
            message.error("Failed to change track status");
        }
    };

    const handleUploadCover = async (id: number, file: File) => {
        try {
            await adminApi.uploadTrackCover(id, file);
            message.success("Cover uploaded");
        } catch {
            message.error("Failed to upload cover");
        }
    };

    const normFile = (e: { fileList?: unknown[] } | unknown[]) => {
        if (Array.isArray(e)) {
            return e;
        }
        return e?.fileList;
    };

    const columns = [
        { title: "ID", dataIndex: "id" },
        { title: "Title", dataIndex: "title" },
        { title: "Author", dataIndex: "author" },
        { title: "Genre", dataIndex: "genreId" },
        {
            title: "Status",
            render: (_: unknown, record: AdminTrack) => (record.hidden ? "Hidden" : "Visible"),
        },
        {
            title: "Actions",
            render: (_: unknown, record: AdminTrack) => (
                <Space>
                    <Button type="primary" onClick={() => handleEdit(record)}>
                        Edit
                    </Button>
                    <Button danger onClick={() => handleDelete(record.id)}>
                        Delete
                    </Button>
                    <Button onClick={() => handleHideUnhide(record.id, !!record.hidden)}>
                        {record.hidden ? "Unhide" : "Hide"}
                    </Button>
                    <Upload
                        showUploadList={false}
                        customRequest={({ file }) => handleUploadCover(record.id, file as File)}
                    >
                        <Button icon={<UploadOutlined />}>Upload Cover</Button>
                    </Upload>
                </Space>
            ),
        },
    ];

    return (
        <>
            <div>
                <Button
                    type="primary"
                    style={{ marginBottom: 16 }}
                    onClick={() => setIsModalVisible(true)}
                >
                    Create Track
                </Button>

                <Modal
                    title={editingTrack ? "Edit Track" : "Create Track"}
                    open={isModalVisible}
                    onCancel={() => {
                        setIsModalVisible(false);
                        setEditingTrack(null);
                        form.resetFields();
                    }}
                    footer={null}
                >
                    <Form
                        form={form}
                        onFinish={handleSave} // universal function for create/edit
                        layout="vertical"
                    >
                        <Form.Item
                            name="title"
                            rules={[{ required: true, message: "Enter a name" }]}
                        >
                            <Input placeholder="Title" />
                        </Form.Item>

                        <Form.Item
                            name="duration"
                            rules={[{ required: true, message: "Enter the duration" }]}
                        >
                            <Input placeholder="00:03:25" />
                        </Form.Item>

                        <Form.Item
                            name="albumId"
                            rules={[{ required: true, message: "Enter AlbumId" }]}
                        >
                            <Input type="number" placeholder="AlbumId" />
                        </Form.Item>
                        <Form.Item
                            name="genreId"
                            rules={[{ required: true, message: "Enter GenreId" }]}
                        >
                            <InputNumber placeholder="GenreId" />
                        </Form.Item>
                        <Form.Item
                            name="file"
                            valuePropName="fileList"
                            getValueFromEvent={normFile}
                            rules={editingTrack ? [] : [{ required: true, message: "Select a file" }]}
                        >
                            <Upload beforeUpload={() => false} maxCount={1}>
                                <Button icon={<UploadOutlined />}>
                                    {editingTrack ? "Update file" : "Choose file"}
                                </Button>
                            </Upload>
                        </Form.Item>

                        <Form.Item
                            name="cover"
                            valuePropName="fileList"
                            getValueFromEvent={normFile}
                        >
                            <Upload beforeUpload={() => false} maxCount={1}>
                                <Button icon={<UploadOutlined />}>
                                    {editingTrack ? "Update cover" : "Choose cover"}
                                </Button>
                            </Upload>
                        </Form.Item>

                        <Form.Item>
                            <Button type="primary" htmlType="submit" block>
                                {editingTrack ? "Save" : "Create"}
                            </Button>
                        </Form.Item>
                    </Form>
                </Modal>

                <Table rowKey="id" columns={columns} dataSource={tracks} loading={loading} />
            </div>
        </>
    );
};

export default TracksPage;
