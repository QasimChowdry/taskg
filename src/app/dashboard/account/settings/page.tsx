"use client";
import React, { useEffect, useState } from 'react';
import { Button, Input, Form, Select, Row, Col, notification, DatePicker, Spin, Upload, Checkbox } from 'antd';
import dayjs, { Dayjs } from 'dayjs';
import withAuth from "@/app/auth/withAuth";
import { Popconfirm } from 'antd';
import axios from 'axios';

const { Option } = Select;

interface UserDetails {
    firstName: string;
    lastName: string;
    gender: string;
    dob: Dayjs | null;
    email: string;
    pharmacy: string;
    mobileNumber: string;
    homeAddress: string;
    profileImage: string;
    updatesOffers: boolean;
}

const AccountSettings: React.FC = () => {
    const [userDetails, setUserDetails] = useState<UserDetails | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [api, contextHolder] = notification.useNotification();
    const [form] = Form.useForm();

    const openNotification = (type: 'success' | 'error', message: string, description: string) => {
        api[type]({
            message,
            description,
        });
    };

    useEffect(() => {
        fetchUserDetails();
    }, []);

    const fetchUserDetails = async () => {
        try {
            const storedUser = localStorage.getItem('user');
            if (storedUser) {
                const { user, token } = JSON.parse(storedUser);
                if (user && user.id) {
                    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/get-user/${user.id}`, {
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json',
                            'authentication': `${token}`
                        },
                        mode: 'cors'
                    });
                    if (response.ok) {
                        const data = await response.json();

                        // Transform the API response to match the form's field names
                        const transformedData: UserDetails = {
                            firstName: data.first_name,
                            lastName: data.last_name,
                            gender: data.gender,
                            dob: data.dob ? dayjs(data.dob) : null,
                            email: data.email,
                            pharmacy: data.nominated_pharmacy,
                            mobileNumber: data.mobile_number,
                            homeAddress: data.home_address,
                            profileImage: data.profile_image,
                            updatesOffers: data.updates_offers,
                        };
                        setUserDetails(transformedData);
                        localStorage.setItem('user', JSON.stringify({ user: data, token }));
                    } else {
                        setError('Failed to fetch user details');
                    }
                } else {
                    setError('User not found in local storage');
                }
            }
        } catch (error) {
            setError('An error occurred while fetching user details');
        } finally {
            setLoading(false);
        }
    };

    const handleFormSubmit = async (values: any) => {
        setLoading(true);
        try {
            const storedUser = localStorage.getItem('user');
            if (storedUser) {
                const { user, token } = JSON.parse(storedUser);
                const payload = { ...values };

                // Only include password if both fields are filled and match
                if (values.password && values.confirmPassword && values.password === values.confirmPassword) {
                    payload.password = values.password;
                } else {
                    delete payload.password;
                    delete payload.confirmPassword;
                }

                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/update-user/${user.id}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'authentication': `${token}`
                    },
                    body: JSON.stringify(payload),
                });

                if (response.ok) {
                    fetchUserDetails();
                    openNotification('success', 'Update Successful', 'Your account details have been updated successfully.');
                } else {
                    openNotification('error', 'Update Failed', 'There was an error updating your account details. Please try again.');
                }
            }
        } catch (error) {
            openNotification('error', 'Update Failed', 'There was an error updating your account details. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleUpload = async ({ file }: { file: File }) => {
        setLoading(true);
        try {
            const storedUser = localStorage.getItem('user');
            if (storedUser) {
                const { user, token } = JSON.parse(storedUser);
                const formData = new FormData();
                formData.append('file', file);
                formData.append('upload_preset', 'taskgo');

                const res = await axios.post(`https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`, formData);
                console.log('File Uploaded Successfully:', res.data.secure_url);

                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/upload-profile-image`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'authentication': `${token}`
                    },
                    body: JSON.stringify({ img_url: res.data.secure_url, id: user.id }),
                });

                const responseData = await response.json();
                if (responseData.success) {
                    fetchUserDetails();
                    openNotification('success', 'Upload Successful', 'Your profile image has been updated successfully.');
                } else {
                    openNotification('error', 'Upload Failed', 'There was an error uploading your profile image. Please try again.');
                }
            }
        } catch (error) {
            openNotification('error', 'Upload Failed', 'There was an error uploading your profile image. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleRemoveImage = async () => {
        setLoading(true);
        try {
            const storedUser = localStorage.getItem('user');
            if (storedUser) {
                const { user, token } = JSON.parse(storedUser);
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/remove-profile-image`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'authentication': `${token}`
                    },
                    body: JSON.stringify({
                        id: user.id,
                    }),
                });
                if (response.ok) {
                    fetchUserDetails();
                    openNotification('success', 'Remove Successful', 'Your profile image has been removed successfully.');
                } else {
                    openNotification('error', 'Remove Failed', 'There was an error removing your profile image. Please try again.');
                }
            }
        } catch (error) {
            openNotification('error', 'Remove Failed', 'There was an error removing your profile image. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (error) {
        return <div>{error}</div>;
    }
    return (
        <div className="flex  min-h-screen bg-white">
            {contextHolder}
            <div className="w-full md:w-[60rem]">
                <h1 className="font-bold text-2xl">Account Settings</h1>
                <h3 className="text-gray-400 mb-5">Manage your account</h3>
                <Spin spinning={loading}>
                    <div className="mb-4">
                        <div className="flex space-x-2">
                            <img
                                src={userDetails?.profileImage ? `${userDetails.profileImage}` : '/user-placeholder.png'}
                                className="rounded-full h-16 w-16 object-cover mb-2"
                                alt="User Profile"
                            />
                        <div className="mt-4 pt-1">
                            <Upload
                                accept="image/*"
                                showUploadList={false}
                                customRequest={handleUpload}
                            >
                                <span className="cursor-pointer hover:text-primary">Change</span>
                            </Upload>
                            {userDetails?.profileImage && (
                                <>
                                    <span className="mx-2">|</span>
                                    <Popconfirm
                                        title="Confirm"
                                        description="Sure to remove your profile image?"
                                        onConfirm={handleRemoveImage}
                                        okText="Yes"
                                        cancelText="Cancel"
                                    >
                                        <span className="cursor-pointer hover:text-primary">Remove</span>
                                    </Popconfirm>
                                </>
                            )}
                        </div>
                        </div>
                    </div>
                    {userDetails && (
                        <Form
                            form={form}
                            name="userDetails"
                            initialValues={userDetails}
                            onFinish={handleFormSubmit}
                        >
                            <Row gutter={[16, 16]}>
                                <Col xs={24} md={12}>
                                    <label htmlFor="firstName">First Name</label>
                                    <Form.Item
                                        name="firstName"
                                        rules={[{ required: true, message: 'Please input your First Name!' }]}
                                    >
                                        <Input placeholder="Enter your first name" />
                                    </Form.Item>
                                </Col>
                                <Col xs={24} md={12}>
                                    <label htmlFor="lastName">Last Name</label>
                                    <Form.Item
                                        name="lastName"
                                        rules={[{ required: true, message: 'Please input your Last Name!' }]}
                                    >
                                        <Input placeholder="Enter your last name" />
                                    </Form.Item>
                                </Col>
                            </Row>

                            <Row gutter={[16, 16]}>
                                <Col xs={24} md={12}>
                                    <label htmlFor="gender">Gender</label>
                                    <Form.Item
                                        name="gender"
                                        rules={[{ required: true, message: 'Please select your Gender!' }]}
                                    >
                                        <Select placeholder="Select your gender">
                                            <Option value="male">Male</Option>
                                            <Option value="female">Female</Option>
                                            <Option value="other">Other</Option>
                                        </Select>
                                    </Form.Item>
                                </Col>
                                <Col xs={24} md={12}>
                                    <label htmlFor="dob">Date of birth</label>
                                    <Form.Item
                                        name="dob"
                                        rules={[{ required: true, message: 'Enter your date of birth' }]}
                                        getValueProps={(value) => ({ value: value ? dayjs(value) : null })}
                                        getValueFromEvent={(value) => value ? value.format('YYYY-MM-DD') : null}
                                    >
                                        <DatePicker placeholder="Enter your date of birth" className="w-full" />
                                    </Form.Item>
                                </Col>
                            </Row>

                            <Row gutter={[16, 16]}>
                                <Col xs={24} md={12}>
                                    <label htmlFor="email">Email Address</label>
                                    <Form.Item
                                        name="email"
                                        rules={[{ required: true, message: 'Please input your Email Address!' }]}
                                    >
                                        <Input placeholder="Enter your email address" disabled />
                                    </Form.Item>
                                </Col>
                                <Col xs={24} md={12}>
                                    <label htmlFor="pharmacy">Nominated Pharmacy</label>
                                    <Form.Item
                                        name="pharmacy"
                                        rules={[{ required: true, message: 'Please select your Nominated Pharmacy!' }]}
                                    >
                                        <Select placeholder="Select your nominated pharmacy">
                                            <Option value="hanlysNewRos">Hanlys Local Pharmacy, New Ross</Option>
                                            <Option value="kellysEnniscorthy">Kellys Local Pharmacy, Enniscorthy</Option>
                                            <Option value="odonnellsTaghmon">O’Donnells Local Pharmacy, Taghmon</Option>
                                            <Option value="mayorsWalkWaterford">Mayors Walk Local Pharmacy, Waterford</Option>
                                            <Option value="pharmacyHub">Pharmacy Hub, Kilkenny</Option>
                                        </Select>
                                    </Form.Item>
                                </Col>
                            </Row>

                            <Row gutter={[16, 16]}>
                                <Col xs={24} md={12}>
                                    <label htmlFor="password">Password</label>
                                    <Form.Item
                                        name="password"
                                    >
                                        <Input.Password placeholder="Enter your password" />
                                    </Form.Item>
                                </Col>
                                <Col xs={24} md={12}>
                                    <label htmlFor="confirmPassword">Confirm Password</label>
                                    <Form.Item
                                        name="confirmPassword"
                                        dependencies={['password']}
                                        rules={[
                                            ({ getFieldValue }) => ({
                                                validator(_, value) {
                                                    if (!value && getFieldValue('password')) {
                                                        return Promise.reject(new Error('Please confirm your password!'));
                                                    }
                                                    if (value && value !== getFieldValue('password')) {
                                                        return Promise.reject(new Error('Passwords do not match!'));
                                                    }
                                                    return Promise.resolve();
                                                },
                                            }),
                                        ]}
                                    >
                                        <Input.Password placeholder="Confirm your password" />
                                    </Form.Item>
                                </Col>
                            </Row>

                            <Row gutter={[16, 16]}>
                                <Col xs={24} md={12}>
                                    <label htmlFor="mobileNumber">Mobile Number</label>
                                    <Form.Item
                                        name="mobileNumber"
                                        rules={[
                                            { required: true, message: 'Please input your Mobile Number!' },
                                            { pattern: /^\+?[0-9]+$/, message: 'Mobile Number must be numeric' }
                                        ]}
                                    >
                                        <Input placeholder="Enter your mobile number" />
                                    </Form.Item>
                                </Col>
                                <Col xs={24} md={12}>
                                    <label htmlFor="homeAddress">Home Address</label>
                                    <Form.Item
                                        name="homeAddress"
                                        rules={[{ required: true, message: 'Please input your Home Address!' }]}
                                    >
                                        <Input placeholder="Enter your home address" />
                                    </Form.Item>
                                </Col>
                            </Row>

                            <Form.Item
                                name="updatesOffers"
                                valuePropName="checked"
                                initialValue={userDetails.updatesOffers}
                            >
                                <Checkbox>
                                    Signup for updates & offers
                                    <p className="text-sm text-gray-500">
                                        Receive occasional updates via email or sms with information from the
                                        pharmacy including changes to opening hours, services, alerts for
                                        seasonal services, public health warnings and pharmacy offers.
                                    </p>
                                </Checkbox>
                            </Form.Item>

                            <Form.Item>
                                <Button type="primary" htmlType="submit" className="bg-primary float-right">
                                    Save Changes
                                </Button>
                            </Form.Item>
                        </Form>
                    )}
                </Spin>
            </div>
        </div>
    );
}

export default withAuth(AccountSettings);
