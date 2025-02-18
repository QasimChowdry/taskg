import React from 'react';
import { Card } from 'antd';
import { CheckCircleOutlined } from '@ant-design/icons';

const ConfirmationPage: React.FC = () => {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
            <Card className="w-full max-w-md p-4 md:p-6 md:w-[30rem]">
                <div className="flex justify-center mb-4">
                    <CheckCircleOutlined className="text-6xl text-green-600"/>
                </div>
                <h1 className="font-bold text-2xl text-center">Confirmation</h1>
                <p className="text-center mt-4">We’ve sent you an email, click the link to reset your password. You can close this page now.</p>
            </Card>
        </div>
    );
};

export default ConfirmationPage;