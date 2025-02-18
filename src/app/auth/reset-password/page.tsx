"use client";
import React, { useState, useEffect } from 'react';
import { Card, Button, Input, Form, notification } from 'antd';
import { useRouter } from 'next/navigation';
import Link from "next/link";
import type { NextPage } from 'next';
import type { NotificationType } from 'antd/es/notification';

interface ResetPasswordFormValues {
    password: string;
    confirmPassword: string;
}

const ResetPassword: NextPage = () => {
    const [api, contextHolder] = notification.useNotification();
    const [loading, setLoading] = useState<boolean>(false);
    const [token, setToken] = useState<string | null>(null);
    const router = useRouter();

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        setToken(params.get('token'));
    }, []);

    const openNotification = (type: NotificationType, message: string, description: string) => {
        api[type]({
            message,
            description,
        });
    };

    const onFinish = async (values: ResetPasswordFormValues) => {
        if (!token) {
            openNotification('error', 'Invalid Request', 'No reset token found. Please try the password reset process again.');
            return;
        }

        setLoading(true);
        const { password, confirmPassword } = values;

        if (password !== confirmPassword) {
            openNotification('error', 'Password Mismatch', 'The passwords do not match. Please try again.');
            setLoading(false);
            return;
        }

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/reset-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                },
                body: JSON.stringify({ password, token }),
            });
            const data = await response.json();
            if (data.success) {
                openNotification('success', 'Password Reset', data.message);
                router.push('/auth/success');
            } else {
                openNotification('error', 'Request Failed', data.message);
            }
        } catch (error) {
            openNotification('error', 'Request Failed', 'There was an error resetting the password. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
            {contextHolder}
            <Card className="w-full max-w-md p-4 md:p-6 md:w-[30rem]">
                <h1 className="font-bold text-2xl text-center">Reset Password</h1>
                <h3 className="text-gray-500 text-center mb-10">Enter your new password</h3>
                <Form
                    name="reset-password"
                    initialValues={{ remember: true }}
                    onFinish={onFinish}
                >
                    <label htmlFor="password">New Password</label>
                    <Form.Item
                        name="password"
                        rules={[{ required: true, message: 'Please input your new Password!' }]}
                    >
                        <Input.Password placeholder="Enter your new password" />
                    </Form.Item>
                    <label htmlFor="confirmPassword">Confirm New Password</label>
                    <Form.Item
                        name="confirmPassword"
                        dependencies={['password']}
                        hasFeedback
                        rules={[
                            { required: true, message: 'Please confirm your new Password!' },
                            ({ getFieldValue }) => ({
                                validator(_, value) {
                                    if (!value || getFieldValue('password') === value) {
                                        return Promise.resolve();
                                    }
                                    return Promise.reject(new Error('The passwords do not match!'));
                                },
                            }),
                        ]}
                    >
                        <Input.Password placeholder="Confirm your new password" />
                    </Form.Item>
                    <Form.Item style={{marginBottom: 5}}>
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

export default ResetPassword;
