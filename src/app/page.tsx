"use client";
import React from 'react';
import { Card, Button } from 'antd';
import { LockOutlined, UserOutlined } from '@ant-design/icons';
import Link from 'next/link';
import withAuth from "@/app/auth/withAuth";

const Page: React.FC = () => {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
            <h1 className="text-4xl font-bold">Welcome!</h1>
            <h2 className="text-gray-400 mb-8">Login to your account or create a new one</h2>
            <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
                <Card className="w-80">
                    <div className="flex items-center mb-2">
                        <LockOutlined className="mr-2 text-3xl"/>
                    </div>
                    <h3 className="font-medium text-2xl mb-2">Login</h3>
                    <p>Login to place your medication order, view order history or general account management.</p>
                    <Link href="/auth/login">
                        <Button type="primary" className="mt-4 bg-primary">Login</Button>
                    </Link>
                </Card>
                <Card className="w-80">
                    <div className="flex items-center mb-2">
                        <UserOutlined className="mr-2 text-3xl"/>
                    </div>
                    <h3 className="font-medium text-2xl mb-2">Register</h3>
                    <p>Signup and register a new account in order to start placing new medication orders.</p>
                    <Link href="/auth/register">
                        <Button type="primary" className="mt-4 bg-primary">Register</Button>
                    </Link>
                </Card>
            </div>
        </div>
    );
};

export default withAuth(Page, true);