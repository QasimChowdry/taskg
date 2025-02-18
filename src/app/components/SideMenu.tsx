"use client";
import React, { useState, useEffect } from 'react';
import { Layout, Menu, Drawer, Button, notification, Popconfirm } from 'antd';
import { CloseOutlined } from '@ant-design/icons';
import {
    ShoppingCartOutlined,
    HistoryOutlined,
    SettingOutlined,
    LogoutOutlined,
    MenuOutlined,
} from '@ant-design/icons';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import withAuth from '../auth/withAuth';

const { Sider, Header } = Layout;

const SideMenu: React.FC = () => {
    const [visible, setVisible] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);
    const router = useRouter();
    const [api, contextHolder] = notification.useNotification();
    const pathname = usePathname();

    // Close mobile menu on route change
    useEffect(() => {
        setVisible(false);
    }, [pathname]);

    const showDrawer = () => {
        setVisible(true);
    };

    const onClose = () => {
        setVisible(false);
    };

    const handleLogout = async () => {
        setLoading(true);
        try {
            const user = localStorage.getItem("user");
            if (user) {
                const { token } = JSON.parse(user);
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/logout`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        authentication: `${token}`,
                    },
                });

                if (response.ok) {
                    openNotification("success", "Logout Successful", "You have been logged out successfully.");
                } else {
                    openNotification(
                        "error",
                        "Logout Failed",
                        "There was an error logging out. Please try again."
                    );
                }
            }
        } catch (error) {
            openNotification(
                "error",
                "Logout Failed",
                "There was an error logging out. Please try again."
            );
        } finally {
            setLoading(false);
            localStorage.removeItem("user");
            router.push("/");
        }
    };

    const openNotification = (type: 'success' | 'error', message: string, description: string) => {
        api[type]({
            message,
            description,
        });
    };

    return (
        <>
            {contextHolder}
            <Header className="md:hidden fixed top-0 left-0 right-0 z-50 flex items-center h-14 justify-between bg-white px-5">
                <Button
                    type="primary"
                    icon={<MenuOutlined />}
                    onClick={showDrawer}
                    aria-label="Open Menu"
                    className="text-white bg-primary"
                />
                <div className="logo h-8 w-40">
                    <img src="/logo-name.png" alt="Logo" className="w-full h-full" />
                </div>
            </Header>
            <Sider width={250} className="!bg-white relative h-screen hidden md:block border-r-[1px]">
                <div className="logo h-8 w-40 my-8 ml-2">
                    <img src="/logo-name.png" alt="Logo" className="w-full h-full" />
                </div>
                <Menu mode="inline" defaultSelectedKeys={["1"]} className="!border-none font-medium">
                    <Menu.Item key="1" icon={<HistoryOutlined />}>
                        <Link href="/dashboard/order/history"> Order History </Link>
                    </Menu.Item>
                    <Menu.Item key="2" icon={<ShoppingCartOutlined />}>
                        <Link href="/dashboard/order/create">Place Order</Link>
                    </Menu.Item>
                    <Menu.Item key="3" icon={<SettingOutlined />}>
                        <Link href="/dashboard/account/settings"> Account Settings </Link>
                    </Menu.Item>
                </Menu>
                <div className="absolute bottom-0 left-0 right-0 font-medium">
                    <Popconfirm
                        title="Logout"
                        description="Are you sure to logout?"
                        okText="Yes"
                        cancelText="Cancel"
                        placement="top"
                        onConfirm={handleLogout}
                    >
                        <Menu mode="inline" className="!border-none font-medium">
                            <Menu.Item key="4" icon={<LogoutOutlined />}>
                                Logout
                            </Menu.Item>
                        </Menu>
                    </Popconfirm>
                </div>
            </Sider>
            <Drawer
                title={
                    <div className="flex items-center justify-between w-full">
                        <div className="flex items-center">
                            <img src="/logo-name.png" alt="Logo" className="h-8 w-auto mr-2" />
                        </div>
                        <Button
                            onClick={onClose}
                            style={{ border: 'none', padding: 0 }}
                            icon={<CloseOutlined />}
                        />
                    </div>
                }
                placement="left"
                closable={false}
                onClose={onClose}
                open={visible}
                className="md:hidden"
            >
                <Menu mode="inline" defaultSelectedKeys={["1"]} className="!border-none font-medium">
                    <Menu.Item key="1" icon={<HistoryOutlined />}>
                        <Link href="/dashboard/order/history"> Order History </Link>
                    </Menu.Item>
                    <Menu.Item key="2" icon={<ShoppingCartOutlined />}>
                        <Link href="/dashboard/order/create">Place Order</Link>
                    </Menu.Item>
                    <Menu.Item key="3" icon={<SettingOutlined />}>
                        <Link href="/dashboard/account/settings"> Account Settings </Link>
                    </Menu.Item>
                </Menu>
                <Popconfirm
                    title="Logout"
                    description="Are you sure to logout?"
                    okText="Yes"
                    cancelText="Cancel"
                    placement="top"
                    onConfirm={handleLogout}
                >
                    <Menu mode="inline" className="!border-none font-medium">
                        <Menu.Item key="4" icon={<LogoutOutlined />}>
                            Logout
                        </Menu.Item>
                    </Menu>
                </Popconfirm>
            </Drawer>
        </>
    );
};

export default withAuth(SideMenu);