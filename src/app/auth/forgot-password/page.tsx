"use client";
import { Card, Button, Input, Form, notification } from 'antd';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from "next/link";
import withAuth from "@/app/auth/withAuth";
import { ArrowLeftOutlined } from '@ant-design/icons';
import type { NextPage } from 'next';

interface ForgotPasswordFormValues {
    email: string;
}

const ForgotPassword: NextPage = () => {
    const [api, contextHolder] = notification.useNotification();
    const [loading, setLoading] = useState<boolean>(false);
    const router = useRouter();

    const openNotification = (type: 'success' | 'error', message: string, description: string) => {
        api[type]({
            message,
            description,
        });
    };

    const onFinish = async (values: ForgotPasswordFormValues) => {
        setLoading(true);

        const { email } = values;

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/forgot-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                },
                body: JSON.stringify({ email }),
            });
            const data = await response.json();
            if (data.success) {
                openNotification('success', 'Email Sent', data.message);
                router.push('/auth/confirmation');
            } else {
                openNotification('error', 'Request Failed', data.message);
            }
        } catch (error) {
            openNotification('error', 'Request Failed', 'There was an error sending the password reset email. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
            {contextHolder}
            <Card className="w-full max-w-md p-4 md:p-6 md:w-[30rem]">
                <h1 className="font-bold text-2xl text-center">Forgot Password?</h1>
                <h3 className="text-gray-500 text-center mb-10">Enter your email to receive the password reset link</h3>
                <Form
                    name="forgot-password"
                    initialValues={{ remember: true }}
                    onFinish={onFinish}
                >
                    <label htmlFor="email">Email</label>
                    <Form.Item
                        name="email"
                        rules={[
                            { required: true, message: "Please input your Email Address!" },
                            { type: "email", message: "The input is not a valid email address!" },
                        ]}
                    >
                        <Input placeholder="Enter your email address" />
                    </Form.Item>
                    <Form.Item style={{ marginBottom: 5 }}>
                        <Button type="primary" htmlType="submit" className="w-full bg-primary -mt-2" loading={loading}>
                            Submit
                        </Button>
                    </Form.Item>
                    <Form.Item>
                        <Link href="/auth/login">
                            <Button type="default" className="w-full" disabled={loading}>Back to Login</Button>
                        </Link>
                    </Form.Item>
                </Form>
            </Card>
        </div>
    );
};

export default withAuth(ForgotPassword, true);