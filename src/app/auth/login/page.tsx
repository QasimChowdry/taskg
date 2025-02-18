"use client";
import { Card, Button, Input, Form, notification } from 'antd';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from "next/link";
import withAuth from "../withAuth";
import { ArrowLeftOutlined } from '@ant-design/icons';
import type { NextPage } from 'next';

interface LoginFormValues {
    email: string;
    password: string;
}

const Login: NextPage = () => {
    const [api, contextHolder] = notification.useNotification();
    const [loading, setLoading] = useState<boolean>(false);
    const router = useRouter();

    const openNotification = (pauseOnHover: boolean, message: string, description: string) => {
        api['error']({
            message,
            description,
        });
    };

    const onFinish = async (values: LoginFormValues) => {
        setLoading(true);

        const { email, password } = values;

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                },
                body: JSON.stringify({ email, password }),
            });
            if (response.ok) {
                const data = await response.json();
                localStorage.setItem('user', JSON.stringify(data));
                router.push('/dashboard/order/history');
            } else {
                openNotification(false, 'Login Failed', 'You entered invalid credentials. Please try again.');
            }
        } catch (error) {
            openNotification(false, 'Login Failed', 'There was an error logging in. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
            {contextHolder}
            <Card className="w-full max-w-md p-4 md:p-6 md:w-[30rem]">
                <h1 className="font-bold text-2xl text-center">Welcome</h1>
                <h3 className="text-gray-400 text-center mb-10">Let’s order your prescription</h3>
                <Form
                    name="login"
                    initialValues={{ remember: true }}
                    onFinish={onFinish}
                >
                    <label htmlFor="email">Email</label>
                    <Form.Item
                        name="email"
                        rules={[{ required: true, message: 'Please input your Email!' }]}
                    >
                        <Input placeholder="Enter your email address" />
                    </Form.Item>
                    <label htmlFor="password">Password</label>
                    <Form.Item
                        name="password"
                        rules={[{ required: true, message: 'Please input your Password!' }]}
                    >
                        <Input.Password placeholder="Enter your password" />
                    </Form.Item>
                    <Link href="/auth/forgot-password" className="text-sm underline text-blue-600 float-right -mt-6">Forget password?</Link>
                    <br />
                    <Form.Item style={{ marginBottom: 5 }}>
                        <Button type="primary" htmlType="submit" className="w-full bg-primary -mt-2" loading={loading}>
                            Login
                        </Button>
                    </Form.Item>
                    <Form.Item>
                        <Link href="/">
                            <Button type="default" className="w-full" disabled={loading}>Back</Button>
                        </Link>
                    </Form.Item>
                </Form>
            </Card>
        </div>
    );
};

export default withAuth(Login, true);