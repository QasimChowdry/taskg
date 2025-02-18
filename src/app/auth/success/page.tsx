import React from 'react';
import { Card, Button } from 'antd';
import { CheckCircleOutlined } from '@ant-design/icons';
import Link from 'next/link';
import type { NextPage } from 'next';

const SuccessPage: NextPage = () => {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
            <Card className="w-full max-w-md p-4 md:p-6 md:w-[30rem]">
                <div className="flex justify-center mb-4">
                    <CheckCircleOutlined className="text-6xl text-green-600" />
                </div>
                <h1 className="font-bold text-2xl text-center">Success</h1>
                <p className="text-center mt-4">You have successfully reset your password</p>
                <div className="flex justify-center mt-6">
                    <Link href="/auth/login">
                        <Button type="primary" className="bg-primary">Login</Button>
                    </Link>
                </div>
            </Card>
        </div>
    );
};

export default SuccessPage;