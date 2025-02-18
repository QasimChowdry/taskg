"use client";
import React, { ReactNode } from 'react';
import { Layout } from 'antd';
import SideMenu from '../components/SideMenu';
import withAuth from '../auth/withAuth';

const { Content } = Layout;

interface DashboardLayoutProps {
    children: ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
    return (
        <Layout className="min-h-screen">
            <SideMenu />
            <Layout>
                <Content className="mt-16 mx-2 md:m-0 overflow-auto bg-white">
                    <div className="p-6 bg-white">
                        {children}
                    </div>
                </Content>
            </Layout>
        </Layout>
    );
};

export default withAuth(DashboardLayout);