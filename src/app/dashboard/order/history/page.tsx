"use client";
import React, { useState, useEffect } from 'react';
import { Table, Modal, Button, Spin, Badge, Popconfirm, notification } from 'antd';
import withAuth from "@/app/auth/withAuth";
import Link from 'next/link';

interface Order {
    id: string;
    created_at: string;
    status: 'pending' | 'complete' | 'reject';
    nominated_pharmacy: string;
    reminder: string;
}

interface OrderDetails {
    name: string;
    quantity: number;
}

const OrderHistory: React.FC = () => {
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [orderDetails, setOrderDetails] = useState<OrderDetails[] | null>(null);
    const token = JSON.parse(localStorage.getItem('user') || '{}')?.token;
    const user = JSON.parse(localStorage.getItem('user') || '{}')?.user;
    const [api, contextHolder] = notification.useNotification();
    const statusColors: Record<string, 'processing' | 'success' | 'error'> = {
        'pending': 'processing',
        'complete': 'success',
        'reject': 'error'
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/get-orders`, {
                method: 'GET',
                headers: {
                    'authentication': token
                }
            });
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const data = await response.json();
            setOrders(data);
        } catch (error) {
            console.error('Error fetching orders:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString: string) => {
        const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
        return new Date(dateString).toLocaleDateString('en-GB', options);
    };

    const handleReorder = async (orderId: string) => {
        setLoading(true);
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/reorder`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                    'authentication': token,
                },
                body: JSON.stringify({ orderId }),
            });

            if (response.ok) {
                api.success({
                    message: 'Reorder Successful',
                    description: "Your order has been successfully placed. Please review your order details.",
                });
                handleCancel();
                fetchOrders();
            } else {
                // Handle error
            }
        } catch (error) {
            api.error({
                message: 'Reorder Failed',
                description: 'There was an error placing your order. Please try again.',
            });
        } finally {
            setLoading(false);
        }
    };

    const pharmacies: Record<string, string> = {
        hanlysNewRos: "Hanlys Local Pharmacy, New Ross",
        kellysEnniscorthy: "Kellys Local Pharmacy, Enniscorthy",
        odonnellsTaghmon: "O'Donnells Local Pharmacy, Taghmon",
        mayorsWalkWaterford: "Mayors Walk Local Pharmacy, Waterford",
        pharmacyHub: "Pharmacy Hub, Kilkenny",
    };

    const columns = [
        {
            title: 'Order ID',
            dataIndex: 'id',
            key: 'id',
            render: (text: string, record: Order) => (
                <Button type="link" onClick={() => showOrderDetails(record)}>
                    RX-{text}
                </Button>
            ),
            width: 30,
        },
        {
            title: 'Date',
            dataIndex: 'created_at',
            key: 'created_at',
            render: (text: string) => formatDate(text),
            width: 130,
        },
        {
            title: 'Status',
            dataIndex: 'reminder',
            key: 'status',
            render: (text: string, record: Order) => (
                <Badge
                    status={statusColors[record.status]}
                    text={record.status === 'pending' ? 'Pending' : record.status === 'complete' ? 'Completed' : 'Rejected'}
                />
            ),
            width: 102,
        },
        {
            title: 'Nominated Pharmacy',
            dataIndex: 'nominated_pharmacy',
            key: 'nominated_pharmacy',
            render: (text: string, record: Order) => pharmacies[record.nominated_pharmacy],
        },
    ];

    const columnsMed = [
        {
            title: 'Medicine',
            dataIndex: 'name',
            key: 'name',
        },
        {
            title: 'Qty',
            dataIndex: 'quantity',
            key: 'quantity',
            width: 70
        },
    ];

    const showOrderDetails = async (order: Order) => {
        setSelectedOrder(order);
        setLoading(true);
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/get-order/${order.id}`, {
                method: 'GET',
                headers: {
                    'authentication': token
                }
            });
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            setIsModalVisible(true);
            const data = await response.json();
            setOrderDetails(data);
        } catch (error) {
            console.error('Error fetching order details:', error);
        }
    };

    const handleCancel = () => {
        setIsModalVisible(false);
        setOrderDetails(null);
        setLoading(false);
    };


    return (
        <div className="h-screen ">
            {contextHolder}
            <h1 className="text-2xl font-bold">Order History</h1>
            <p className="text-gray-400 text-sm mb-4">List of orders you have placed to date.</p>

            <Spin spinning={loading}>
                {
                    orders.length > 0 ? (
                        <Table
                            size="small"
                            columns={columns}
                            className="md:w-7/12 w-full mb-4"
                            dataSource={orders}
                            bordered
                            pagination={orders.length > 10 ? { pageSize: 10 }:false}
                            scroll={orders.length > 7 ? {y:600,x:"max-content"} : false}
                        />
                    ) : (
                        <div className="flex flex-col items-center justify-center">
                            <img src="/search.png" alt="Thank You" className="w-32"/>
                            <p className="text-gray-400 text-center my-4">You have not ordered any medication yet</p>
                            <Link href="/dashboard/order/create">
                                <Button type="primary" className="bg-primary">Order Now</Button>
                            </Link>
                        </div>
                    )
                }
            </Spin>

            <Modal
                open={isModalVisible}
                onCancel={handleCancel}
                footer={[
                    ((orderDetails && orderDetails.status !== 'pending') &&
                        <Popconfirm
                            title="Reorder this prescription?"
                            description="Are you sure you want to place a new order with the same items?"
                            onConfirm={()=>handleReorder(orderDetails.id)}
                            okText="Yes"
                            cancelText="No"
                        >
                            <Button
                                type="default"
                                className="bg-green-600 text-white mt-7"
                                size="large"
                                style={{ width: '100%' }}
                            >
                                Reorder
                            </Button>
                        </Popconfirm>
                    ),
                    <Button key="close" type="primary" className="bg-primary mt-2" size="large" onClick={handleCancel} style={{ width: '100%',marginInlineStart:'0px' }}>
                        Close
                    </Button>,
                ]}
            >
                {orderDetails && (
                    <>
                        <div>
                            <h1 className="text-2xl text-gray-500 border-b-2 pb-2">Order # RX-{orderDetails.id} </h1>
                            <p className="p-1 text-gray-600 mt-2">
                                <strong>Date:</strong> {formatDate(orderDetails.created_at)}</p>
                            <p className="p-1 text-gray-600"><strong>Status: </strong>
                                <Badge
                                status={statusColors[orderDetails.status]}
                                text={orderDetails.status === 'pending'? 'Pending' : orderDetails.status === 'complete' ? 'Completed' : 'Rejected'}/>
                            </p>
                            <p className="p-1 text-gray-600">
                                <strong>Pharmacy:</strong> {orderDetails?.nominated_pharmacy ? pharmacies[orderDetails?.nominated_pharmacy] : 'N/A'}</p>
                            <p className="p-1 text-gray-600"><strong>Collection
                                method:</strong> {orderDetails.collection_method === 'myself' ? "I will collect it myself (free)" : "Somebody else will collect for me (free)"}
                            </p>
                            <p className="p-1 text-gray-600"><strong>Note to
                                pharmacy:</strong> {orderDetails.additional_info}</p>
                            {/* Add more order details as needed */}
                        </div>
                        <Table
                            size="small"
                            columns={columnsMed}
                            className="w-full mt-2"
                            dataSource={orderDetails?.medicines}
                            bordered
                            pagination={false}

                        />
                    </>

                )}
            </Modal>
        </div>
    );
}

export default withAuth(OrderHistory);
