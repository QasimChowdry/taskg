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

    // ... existing code
};
This conversion includes type annotations for state variables and function parameters, ensuring the component is correctly typed in TypeScript.

this one as well
It seems like you want to convert the CreateOrder component to TypeScript. Let's add type annotations for the state variables and ensure the component is typed correctly.
page.tsx
"use client";
import React, { useState, useEffect } from 'react';
import { Steps, Button, Form, Input, Table, Radio, Select, DatePicker, Switch, notification, Row, Col, Popconfirm, Tooltip } from 'antd';
import { DeleteOutlined, PlusOutlined, MinusOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import withAuth from '@/app/auth/withAuth';

const { Step } = Steps;
const { TextArea } = Input;
const { Option } = Select;

interface Medicine {
    key: string | null;
    name: string;
    quantity: number;
}

interface FormData {
    step1: {
        medicines: Medicine[];
    };
    step2: {
        additionalInfo: string;
        collectionMethod: string;
    };
    step3: {
        reminderDate: Date | null;
        reminderInterval: string;
    };
}

const CreateOrder: React.FC = () => {
    const router = useRouter();
    const [current, setCurrent] = useState<number>(0);
    const [medicines, setMedicines] = useState<Medicine[]>([]);
    const [search, setSearch] = useState<string>('');
    const [reminder, setReminder] = useState<boolean>(false);
    const [tempQuantities, setTempQuantities] = useState<{ [key: string]: string }>({});
    const [formData, setFormData] = useState<FormData>({
        step1: {
            medicines: [],
        },
        step2: {
            additionalInfo: '',
            collectionMethod: '',
        },
        step3: {
            reminderDate: null,
            reminderInterval: '',
        },
    });
    const [loading, setLoading] = useState<boolean>(false);
    const [api, contextHolder] = notification.useNotification();
    const [form] = Form.useForm();
    const [userData, setUserData] = useState<any>(null);
    const pharmacies = {
        hanlysNewRos: "Hanlys Local Pharmacy, New Ross",
        odonnellsTaghmon: "O'Donnells Local Pharmacy, Taghmon",
        mayorsWalkWaterford: "Mayors Walk Local Pharmacy, Waterford",
        kellysEnniscorthy: "Kellys Local Pharmacy, Enniscorthy",
        pharmacyHub: "Pharmacy Hub, Kilkenny",
    };

    const [pharmacyMedicines, setPharmacyMedicines] = useState<Medicine[]>([]);

    useEffect(() => {
        setUserData(JSON.parse(localStorage.getItem('user') || '{}'));

        getMedicines();

    }, []);

    const getMedicines = async () => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/get-medicines`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'authentication': `${JSON.parse(localStorage.getItem('user') || '{}').token}`
                },
                mode: 'cors'
            });
            if (response.ok) {
                const data = await response.json();
                setPharmacyMedicines(data);
            } else {
                console.error('Failed to fetch medicines');
            }
        } catch (error) {
            console.error('An error occurred while fetching medicines:', error);
        }
    }

    const handleAddMedicine = (value: string) => {
        if (value !== '') {
            let selectedMed = pharmacyMedicines.find(med => med.key === value);
            if (!selectedMed) {
                selectedMed = { key: null, name: value, quantity: 1 };
            }
            const newMedicine = { key: selectedMed.key, name: selectedMed.name, quantity: 1 };
            setMedicines([...medicines, newMedicine]);
            setFormData({
                ...formData,
                step1: {
                    ...formData.step1,
                    medicines: [...formData.step1.medicines, newMedicine],
                },
            });
            setSearch('');
        }
    };

    const handleSelectChange = (value: string) => {
        const selectedMedicine = pharmacyMedicines.find(medicine => medicine.name === value);
        if (!selectedMedicine) {
            handleAddMedicine(value);
        } else {
            setSearch(selectedMedicine.name);
        }
    };

    const handleIncrement = (key: string | null) => {
        const updatedMedicines = medicines.map(med =>
            med.key === key ? { ...med, quantity: med.quantity + 1 } : med
        );
        setMedicines(updatedMedicines);
        setTempQuantities({ ...tempQuantities, [key || '']: (updatedMedicines.find(med => med.key === key)?.quantity || 0).toString() });
        setFormData({
            ...formData,
            step1: {
                ...formData.step1,
                medicines: updatedMedicines,
            },
        });
    };

    const handleDecrement = (key: string | null) => {
        const updatedMedicines = medicines.map(med =>
            med.key === key && med.quantity > 1 ? { ...med, quantity: med.quantity - 1 } : med
        );
        setMedicines(updatedMedicines);
        setTempQuantities({ ...tempQuantities, [key || '']: (updatedMedicines.find(med => med.key === key)?.quantity || 0).toString() });
        setFormData({
            ...formData,
            step1: {
                ...formData.step1,
                medicines: updatedMedicines,
            },
        });
    };

    const handleQuantityChange = (key: string | null, value: string) => {
        setTempQuantities({ ...tempQuantities, [key || '']: value });

        if (value === '' || isNaN(Number(value))) {
            return;
        }

        const newQuantity = parseInt(value, 10);
        if (newQuantity > 0) {
            const updatedMedicines = medicines.map(med =>
                med.key === key ? { ...med, quantity: newQuantity } : med
            );
            setMedicines(updatedMedicines);
            setFormData({
                ...formData,
                step1: {
                    ...formData.step1,
                    medicines: updatedMedicines,
                },
            });
        }
    };

    const handleDelete = (key: string | null) => {
        const updatedMedicines = medicines.filter(med => med.key !== key);
        setMedicines(updatedMedicines);
        setFormData({
            ...formData,
            step1: {
                ...formData.step1,
                medicines: updatedMedicines,
            },
        });
    };

    const handleFormChange = (changedValues: any, allValues: any) => {
        setFormData({
            ...formData,
            [`step${current + 1}`]: allValues,
        });
    };

    const columns = [
        {
            title: "Medicine Name",
            dataIndex: "name",
            key: "name",
        },
        {
            title: (text: any, record: any) => (
                <>
                    Quantity
                    <Tooltip title="Please select your tablet quantity, inhaler unit quantity, or solution in millilitres (ml)">
                        <InfoCircleOutlined className="ml-2 cursor-pointer" />
                    </Tooltip>
                </>
            ),
            dataIndex: "quantity",
            key: "quantity",
            width: 150,
            render: (text: any, record: any) => (
                <div>
                    <Button
                        size="small"
                        icon={<MinusOutlined />}
                        className="border-none"
                        onClick={() => handleDecrement(record.key)}
                    />
                    <Input
                        size="small"
                        rootClassName="w-12 text-center mx-2"
                        value={tempQuantities[record.key] !== undefined ? tempQuantities[record.key] : record.quantity.toString()}
                        onChange={(e) => handleQuantityChange(record.key, e.target.value)}
                        onBlur={() => {
                            if (tempQuantities[record.key] === '' || isNaN(Number(tempQuantities[record.key]))) {
                                setTempQuantities({ ...tempQuantities, [record.key]: record.quantity.toString() });
                            }
                        }}
                    />
                    <Button
                        size="small"
                        icon={<PlusOutlined />}
                        className="border-none"
                        onClick={() => handleIncrement(record.key)}
                    />
                </div>
            ),
        },
        {
            title: "Action",
            key: "action",
            width: 50,
            render: (text: any, record: any) => (
                <Popconfirm
                    title="Delete Medicine"
                    description="Remove this from your list?"
                    onConfirm={() => handleDelete(record.key)}
                    okText="Ok"
                    cancelText="Cancel"
                    placement="left"
                >
                    <Button
                        icon={<DeleteOutlined />}
                        className="border-none "
                    />
                </Popconfirm>
            ),
        },
    ];

    const steps = [
        {
            content: (
                <Row justify="lefts" className="w-full mt-4">
                    <Col xs={24} sm={18} md={18} lg={18} xl={12}>
                    <p className="font-bold">Please search for the items you would like to add to your prescription</p>
                        {/*<Input*/}
                        {/*    placeholder="Search for medicine"*/}
                        {/*    value={search}*/}
                        {/*    onChange={(e) => setSearch(e.target.value)}*/}
                        {/*    onPressEnter={handleAddMedicine}*/}
                        {/*/>*/}
                        <Select
                            showSearch
                            placeholder="Search for medicine"
                            value={search}
                            onSearch={(value) => setSearch(value)}
                            onChange={handleSelectChange}
                            onSelect={handleAddMedicine}
                            onInputKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    handleAddMedicine(search);
                                }
                            }}
                            style={{ width: '100%' }}
                            filterOption={false}
                        >
                            {pharmacyMedicines
                                .filter(medicine => medicine.name.toLowerCase().includes(search.toLowerCase()))
                                .map((medicine) => (
                                    <Option key={medicine.id} value={medicine.id}>
                                        {medicine.name}
                                    </Option>
                                ))
                            }
                        </Select>
                        <Table
                            dataSource={medicines}
                            bordered
                            columns={columns}
                            size="small"
                            pagination={false}
                            scroll={medicines.length > 5 ? {y:400,x:"max-content"} : false}
                            style={{ marginTop: 16 }} />
                    </Col>
                </Row>
            ),
        },
        {
            content: (
                <Row justify="left" className="mt-4">
                    <Col xs={24} sm={18} md={12} lg={12} xl={8}>
                        <Form
                            layout="vertical"
                            initialValues={formData.step2}
                            onValuesChange={handleFormChange}
                            form={form}
                        >
                            <label className="font-bold">Note to pharmacy (optional)</label>
                            <Form.Item label="" name="additionalInfo">
                                <TextArea rows={3} placeholder="Note to pharmacy" />
                            </Form.Item>
                            <label className="font-bold">How would you like to receive your prescription?</label>
                            <Form.Item name="collectionMethod" rules={[{ required: true, message: 'Please select a collection method' }]} style={{marginBottom: 5}}>
                                <Radio.Group>
                                    <Radio value="myself" className="mt-2">I will collect it myself (free)</Radio>
                                    <br />
                                    <Radio value="other" className="mt-2">Somebody else will collect for me (free)</Radio>
                                </Radio.Group>
                            </Form.Item>
                        </Form>
                    </Col>
                </Row>
            ),
        },
        {
            content: (
                <Row justify="left" className="mt-4">
                    <Col xs={24} sm={18} md={18} lg={18} xl={18}>
                        <Form
                            layout="vertical"
                            initialValues={formData.step3}
                            onValuesChange={handleFormChange}
                            form={form}

                        >
                            <Form.Item>
                                <p className="font-bold">Would you like to be reminded to reorder your medicine? <Switch className="ml-4" checked={reminder} onChange={(checked) => setReminder(checked)} /></p>
                                <p className="text-sm text-gray-400 ">Let us remind you about getting your medicine refilled.</p>
                            </Form.Item>
                            <p className="font-bold">When would you run out of your medicine?</p>
                            <Form.Item name="reminderDate" className="w-5/12" rules={[{ required: reminder, message: 'Please select a reminder date' }]} style={{marginBottom: 15}}>
                                <DatePicker className="w-full" disabled={!reminder} />
                            </Form.Item>
                        </Form>
                    </Col>
                </Row>
            ),
        },
        {
            content: (
                <Row justify="left" className="mt-4">
                    <Col xs={24} sm={18} md={12} lg={12} xl={12}>
                        <p className="font-bold">Nominated pharmacy</p>
                        {/* <Input placeholder="Hanlys New Ross" value={userData?.user.pharmacy} className="w-fit mb-3"/> */}
                        {/* COMMENTING ABOVE STATEMENT TO HARD CODE THE "NOMINATED PHARMACY" BELOW */}
                        <Input placeholder={pharmacies[userData?.user.nominated_pharmacy]} value={pharmacies[userData?.user.nominated_pharmacy]} className="mb-3" disabled/>
                        <p className="font-bold">Prescription collection method</p>
                        <Form
                            layout="vertical"
                            initialValues={formData.step2}
                            onValuesChange={handleFormChange}
                            form={form}
                        >
                            <Form.Item name="collectionMethod" rules={[{ required: true, message: 'Please select a collection method' }]}>
                                <Radio.Group value={formData.step2.collectionMethod} onChange={(e) => setFormData({ ...formData, step2: { ...formData.step2, collectionMethod: e.target.value } })}>
                                    <Radio value="myself" className="mt-2">I will collect it myself (free)</Radio>
                                    <br/>
                                    <Radio value="other" className="mt-2">Somebody else will collect for me (free)</Radio>
                                </Radio.Group>
                            </Form.Item>
                            <label className="font-bold">Note to pharmacy</label>
                            <Form.Item label="" name="additionalInfo">
                                <TextArea rows={3} value={formData.step2.additionalInfo} onChange={(e) => setFormData({ ...formData, step2: { ...formData.step2, additionalInfo: e.target.value } })} />
                            </Form.Item>
                        </Form>
                        <Table
                            dataSource={medicines}
                            bordered
                            columns={columns}
                            pagination={false}
                            size="small"
                            scroll={medicines.length > 5 ? {y:300,x:"max-content"} : false}
                            style={{marginTop: 16}}/>
                    </Col>
                </Row>
            ),
        },
    ];

    const next = async () => {
        if (current === 0 && medicines.length === 0) {
            api.error({
                message: 'Validation Error',
                description: 'Please add at least one medicine to proceed.',
            });
            return;
        }

        try {
            await form.validateFields();
            setCurrent(current + 1);
        } catch (error) {
            console.log('Validation failed:', error);
        }
    };

    const prev = () => {
        setCurrent(current - 1);
    };

    const handleSubmit = async () => {
        setLoading(true);

        const adjustedReminderDate = formData.step3.reminderDate
        ? new Date(formData.step3.reminderDate).toLocaleDateString('en-CA')
        : null

        const orderData = {
            ...formData.step1,
            ...formData.step2,
            ...formData.step3,
            reminder,
            reminderDate: adjustedReminderDate,
            user_id:userData.user.id,
            pharmacy: userData.user.nominated_pharmacy
        };

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/create-orders`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                    'authentication': userData.token,
                },
                body: JSON.stringify(orderData),
            });

            if (response.ok) {
                router.push('/dashboard/thankyou'); // Navigate to the thank you page

                // COMMENTING TO HIDE SUCCESS NOTIFICATION - THANK YOU PAGE REDIRECTION IS ENOUGH
                // api.success({
                //     message: 'Order Placed',
                //     description: 'Your order has been placed successfully.',
                // });
            } else {
                api.error({
                    message: 'Order Failed',
                    description: 'There was an error placing your order. Please try again.',
                });
            }
        } catch (error) {
            api.error({
                message: 'Order Failed',
                description: 'There was an error placing your order. Please try again.',
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="h-screen">
            {contextHolder}
            <Row justify="left">
                <Col xs={24} sm={18} md={8} lg={6} xl={4}>
                    <Steps current={current} className="mt-3" direction="horizontal" style={{flexDirection: "row"}}>
                        {steps.map((item, index) => (
                            <Step key={index} title={` `}/>
                        ))}
                    </Steps>
                </Col>
            </Row>
            <h1 className="text-xl font-bold mt-4">
                {current === 0 && 'Select Medicines'}
                {current === 1 && 'Pharmacy Note & Order Collection'}
                {current === 2 && 'Refill Reminder'}
                {current === 3 && 'Order Summary'}
            </h1>
            <p className="text-gray-400 text-sm ">
                {current === 0 && 'Search and select the medicine you would like to order today.'}
                {current === 1 && 'Share additional instructions and collection method.'}
                {current === 2 && 'Let us send a reminder when you are about to run out of your medicine.'}
                {current === 3 && 'Review the summary below and confirm your order.'}
            </p>
            <div className="steps-content">{steps[current].content}</div>
            <div className="steps-action mt-3 pb-14">
                {current > 0 && (
                    <Button style={{ margin: '0 8px 0 0' }} onClick={() => prev()}>
                        Previous
                    </Button>
                )}
                {current < steps.length - 1 && (
                    <Button type="primary" className="bg-primary" onClick={() => next()}>
                        Next
                    </Button>
                )}
                {current === steps.length - 1 && (
                    <Button type="primary" className="bg-primary" onClick={handleSubmit} loading={loading}>
                        Place Order
                    </Button>
                )}
            </div>
        </div>
    );
};

const css =`
.ant-steps-item-icon{
    height: 55px!important;
    width: 55px!important;
    font-size: 33px!important;
    padding-top:10px;
}

.ant-steps-item-active .ant-steps-item-icon{
    background-color: #395596!important;
    border: none!important;
}

@media (max-width: 600px) {
    .ant-steps-item-icon {
        height: 20px!important;
        width: 20px!important;
        font-size: 24px!important;
        padding-top: 5px;
    }
    .ant-steps-item-active .ant-steps-item-icon{
    background-color: red!important;
    border: none!important;
}
}
`

export default withAuth(CreateOrder);
