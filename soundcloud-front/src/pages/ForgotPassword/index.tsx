// import { useNavigate } from 'react-router-dom';
import { Form, type FormProps, Input } from 'antd';
import {IForgotPasswordRequest} from "./types.ts";
import {useState} from "react";
import axios from "axios";
// import {useForgotPasswordMutation} from "../../../services/apiAccount.ts";
// import LoadingOverlay from "../../../components/ui/loading/LoadingOverlay.tsx";


const ForgotPasswordPage: React.FC = () => {
    // const [forgot, { isLoading }] = useForgotPasswordMutation();
    const [isLoading, setIsLoading] = useState<boolean>()

    // const navigate = useNavigate();

    const onFinish: FormProps<IForgotPasswordRequest>["onFinish"] = async (values) => {
        try {
            console.log("forgot password", values);
            setIsLoading(true);
            await axios.post("http://localhost:5122/api/user/forgot-password", values);
            //await forgot(values).unwrap();

            //navigate('/forgot-success');
            setIsLoading(false);

        } catch (err) {
            setIsLoading(false);
            console.log("error", err);
            alert("Помилка відновлення");
        }
    };


    return (
        <div className="min-h-[565px] flex items-center justify-center bg-gray-100">
            <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md">
                {/*{(isLoading)  && <LoadingOverlay />}*/}

                <h2 className="text-2xl font-semibold mb-6 text-center">Віднолвення паролю</h2>
                <Form<IForgotPasswordRequest>
                    layout="vertical"
                    onFinish={onFinish}
                >
                    <Form.Item<IForgotPasswordRequest>
                        name="email"
                        label="Вкажіть пошту для віднолвення паролю"
                        rules={[{ required: true, message: "Enter your email" }]}
                    >
                        <Input type="email" placeholder="you@example.com" />
                    </Form.Item>



                    <button
                        type="submit"
                        className="bg-orange-500 hover:bg-orange-600 transition text-white font-semibold px-4 py-2 rounded w-full mt-4"
                    >
                        {isLoading ? 'Logging in...' : 'Відновити пароль'}
                    </button>
                </Form>
            </div>
        </div>
    );
};

export default ForgotPasswordPage;