import { useEffect, useState } from "react";
import { Table, Button, Space, message, Modal, Form, Input, Upload } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { adminApi } from "../../services/adminApi";

const CategoriesPage = () => {
    const [categories, setCategories] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingCategory, setEditingCategory] = useState<any | null>(null);
    const [form] = Form.useForm();

    const loadCategories = async () => {
        setLoading(true);
        try {
            const res = await adminApi.getCategories();
            setCategories(res.data);
        } catch {
            message.error("Failed to load categories");
        }
        setLoading(false);
    };

    useEffect(() => {
        loadCategories();
    }, []);

    const handleSave = async () => {
        try {
            const values = await form.validateFields();
            const file = values.imageFile?.fileList?.[0]?.originFileObj;

            if (editingCategory) {
                await adminApi.updateCategory(editingCategory.id, {
                    name: values.name,
                    slug: values.slug,
                    imageFile: file,
                });
                message.success("Category updated");
            } else {
                await adminApi.createCategory({
                    name: values.name,
                    slug: values.slug,
                    imageFile: file,
                });
                message.success("Category created");
            }

            setIsModalVisible(false);
            form.resetFields();
            setEditingCategory(null);
            loadCategories();
        } catch (err) {
            message.error("Failed to save category");
        }
    };

    const handleDelete = async (id: number) => {
        try {
            await adminApi.deleteCategory(id);
            message.success("Category deleted");
            loadCategories();
        } catch {
            message.error("Failed to delete category");
        }
    };

    const columns = [
        { title: "ID", dataIndex: "id" },
        { title: "Name", dataIndex: "name" },
        { title: "Slug", dataIndex: "slug" },
        {
            title: "Image",
            dataIndex: "imageUrl",
            render: (url: string) => url ? <img src={url} alt="cover" width={50} /> : "—",
        },
        {
            title: "Actions",
            render: (_: any, record: any) => (
                <Space>
                    <Button
                        type="primary"
                        onClick={() => {
                            setEditingCategory(record);
                            form.setFieldsValue({
                                name: record.name,
                                slug: record.slug,
                            });
                            setIsModalVisible(true);
                        }}
                    >
                        Edit
                    </Button>
                    <Button danger onClick={() => handleDelete(record.id)}>
                        Delete
                    </Button>
                </Space>
            ),
        },
    ];

    return (
        <>
            <Button
                type="primary"
                style={{ marginBottom: 16 }}
                onClick={() => {
                    setEditingCategory(null);
                    form.resetFields();
                    setIsModalVisible(true);
                }}
            >
                Add category
            </Button>
            <Table
                rowKey="id"
                columns={columns}
                dataSource={categories}
                loading={loading}
            />

            <Modal
                title={editingCategory ? "Edit category" : "Create category"}
                open={isModalVisible}
                onOk={handleSave}
                onCancel={() => setIsModalVisible(false)}
            >
                <Form form={form} layout="vertical">
                    <Form.Item name="name" label="Name" rules={[{ required: true, message: "Enter a name" }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item name="slug" label="Slug" rules={[{ required: true, message: "Enter slug" }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item name="imageFile" label="Image">
                        <Upload beforeUpload={() => false} maxCount={1}>
                            <Button icon={<UploadOutlined />}>Upload</Button>
                        </Upload>
                    </Form.Item>
                </Form>
            </Modal>
        </>
    );
};

export default CategoriesPage;
