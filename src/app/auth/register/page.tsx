"use client";
import { useState, useEffect } from 'react';
import { Button, Input, Form, Select, Checkbox, Row, Col, notification, Modal } from 'antd';
import withAuth from "@/app/auth/withAuth";
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import type { NextPage } from 'next';
import type { NotificationType } from 'antd/es/notification';

const { Option } = Select;

interface RegisterFormValues {
    firstName: string;
    lastName: string;
    gender: string;
    dob: string;
    email: string;
    confirmEmail: string;
    mobileNumber: string;
    homeAddress: string;
    password: string;
    confirmPassword: string;
    pharmacy: string;
    updatesOffers: boolean;
    privacyPolicy: boolean;
}

const RegisterPage: NextPage = () => {
    const [loading, setLoading] = useState<boolean>(false);
    const [api, contextHolder] = notification.useNotification();
    const router = useRouter();
    const [defaultPrefix, setDefaultPrefix] = useState<string>("+353");
    const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
    const [form] = Form.useForm<RegisterFormValues>();

    const updatesOffers = Form.useWatch('updatesOffers', form);
    const privacyPolicy = Form.useWatch('privacyPolicy', form);

    useEffect(() => {
        form.validateFields(['updatesOffers', 'privacyPolicy']);
    }, [updatesOffers, privacyPolicy, form]);

    const openNotification = (type: NotificationType, message: string, description: string) => {
        api[type]({
            message,
            description,
        });
    };

    const showModal = () => {
        setIsModalVisible(true);
    };

    const handleOk = () => {
        setIsModalVisible(false);
    };

    const handleCancel = () => {
        setIsModalVisible(false);
    };

    const onFinish = async (values: RegisterFormValues) => {
        setLoading(true);
        const combinedValues = {
            ...values,
            mobileNumber: `${defaultPrefix}${values.mobileNumber}`
        };
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/signup`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                },
                body: JSON.stringify(combinedValues),
            });
            const result = await response.json();

            if (result.success) {
                openNotification('success', 'Registration Successful', result.message);
                setTimeout(() => {
                    router.replace('/auth/login');
                }, 700);
            } else {
                openNotification('error', 'Registration Failed', result.message);
            }
        } catch (error) {
            openNotification('error', 'Registration Failed', 'There was an error creating your account. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleCheckboxChange = (name: keyof RegisterFormValues) => (e: React.ChangeEvent<HTMLInputElement>) => {
        form.setFields([
            {
                name,
                errors: e.target.checked ? [] : ['This field is required'],
            },
        ]);
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
            {contextHolder}
            <div className="w-full p-6 md:p-6 md:w-[60rem] bg-white my-4">
                <h1 className="font-bold text-2xl ">Register</h1>
                <h3 className=" text-gray-400 mb-5">Create a new account for placing prescription orders.</h3>
                <Form
                    form={form}
                    name="register"
                    initialValues={{ remember: true }}
                    onFinish={onFinish}
                >
                    <Row gutter={16}>
                        <Col span={24} md={12}>
                            <label htmlFor="firstName">First Name</label>
                            <Form.Item
                                name="firstName"
                                rules={[{ required: true, message: 'Please input your First Name!' }]}
                            >
                                <Input placeholder="Enter your first name" />
                            </Form.Item>
                        </Col>
                        <Col span={24} md={12}>
                            <label htmlFor="lastName">Last Name</label>
                            <Form.Item
                                name="lastName"
                                rules={[{ required: true, message: 'Please input your Last Name!' }]}
                            >
                                <Input placeholder="Enter your last name" />
                            </Form.Item>
                        </Col>
                    </Row>

						<Row gutter={16}>
							<Col span={24} md={12}>
								<label htmlFor="gender">Gender</label>
								<Form.Item
									name="gender"
									rules={[{ required: true, message: "Please select your Gender!" }]}
								>
									<Select placeholder="Select your gender">
										<Option value="male">Male</Option>
										<Option value="female">Female</Option>
										<Option value="other">Other</Option>
									</Select>
								</Form.Item>
							</Col>
							<Col span={24} md={12}>
								<label htmlFor="dob">Date of birth</label>
								<Form.Item
									name="dob"
									rules={[
										{ 
											required: true, message: "Enter your date of birth" 
										},
										{ 
											pattern: new RegExp(/(^0[1-9]|[12][0-9]|3[01])-(0[1-9]|1[0-2])-(\d{4}$)/),
											message: "Enter date in this format: DD-MM-YYYY"
										 }
									]}
								>
									<Input placeholder="DD-MM-YYYY" className="w-full" />
								</Form.Item>
							</Col>
						</Row>

						<Row gutter={16}>
							<Col span={24} md={12}>
								<label htmlFor="email">Email Address</label>
								<Form.Item
									name="email"
									type="email"
									rules={[
										{ required: true, message: "Please input your Email Address!" },
										{ type: "email", message: "The input is not a valid email address!" },
									]}
								>
									<Input placeholder="Enter your email address" />
								</Form.Item>
							</Col>
							<Col span={24} md={12}>
								<label htmlFor="confirmEmail">Confirm Email Address</label>
								<Form.Item
									name="confirmEmail"
									dependencies={["email"]}
									hasFeedback
									type="email"
									rules={[
										{ required: true, message: "Please confirm your Email Address!" },
										({ getFieldValue }) => ({
											validator(_, value) {
												if (!value || getFieldValue("email") === value) {
													return Promise.resolve();
												}
												return Promise.reject(new Error("The email addresses do not match!"));
											},
										}),
									]}
								>
									<Input placeholder="Confirm your email address" />
								</Form.Item>
							</Col>
						</Row>

						<Row gutter={16}>
							<Col span={24} md={12}>
								<label htmlFor="mobileNumber">Mobile Number</label>
								<Form.Item
									name="mobileNumber"
									rules={[
										{ required: true, message: "Please enter your mobile number" },
										{ pattern: /\b([1-9][0-9]*)\b/, message: "Enter number without 0 as first digit" },
									]}
								>
									<Input
										addonBefore={
											<Form.Item name="prefix" noStyle>
												<Select
													defaultValue={defaultPrefix}
													onChange={(value) => setDefaultPrefix(value)}
													className=""
												>
													<Option value="+353">+353</Option>
													<Option value="+44">+44</Option>
												</Select>
											</Form.Item>
										}
										inputMode="numeric"
										placeholder="850123456"
									/>
								</Form.Item>
							</Col>
							<Col span={24} md={12}>
								<label htmlFor="homeAddress">Home Address</label>
								<Form.Item
									name="homeAddress"
									rules={[{ required: true, message: "Please input your Home Address!" }]}
								>
									<Input placeholder="Enter your home address" />
								</Form.Item>
							</Col>
						</Row>

						<Row gutter={16}>
							<Col span={24} md={12}>
								<label htmlFor="password">Password</label>
								<Form.Item
									name="password"
									rules={[{ required: true, message: "Please input your Password!" }]}
								>
									<Input.Password placeholder="Enter your password" />
								</Form.Item>
							</Col>
							<Col span={24} md={12}>
								<label htmlFor="confirmPassword">Confirm Password</label>
								<Form.Item
									name="confirmPassword"
									// rules={[{ required: true, message: 'Please confirm your Password!' }]}
									rules={[
										{ required: true, message: "Please confirm your Password!" },
										({ getFieldValue }) => ({
											validator(_, value) {
												if (!value || getFieldValue("password") === value) {
													return Promise.resolve();
												}
												return Promise.reject(new Error("Passwords do not match!"));
											},
										}),
									]}
								>
									<Input.Password placeholder="Confirm your password" />
								</Form.Item>
							</Col>
						</Row>

						<Row gutter={16}>
							<Col span={24} md={12}>
								<label htmlFor="pharmacy">Nominated Pharmacy</label>
								<Form.Item
									name="pharmacy"
									rules={[{ required: true, message: "Please select your Nominated Pharmacy!" }]}
								>
									<Select placeholder="Select your nominated pharmacy">
										<Option value="hanlysNewRos">Hanlys Local Pharmacy, New Ross</Option>
										<Option value="kellysEnniscorthy">Kellys Local Pharmacy, Enniscorthy</Option>
										<Option value="odonnellsTaghmon">O’Donnells Local Pharmacy, Taghmon</Option>
										<Option value="mayorsWalkWaterford">
											Mayors Walk Local Pharmacy, Waterford
										</Option>
										<Option value="pharmacyHub">Pharmacy Hub, Kilkenny</Option>
									</Select>
								</Form.Item>
							</Col>
						</Row>

						<Form.Item
							name="updatesOffers"
							// valuePropName="checked"
              //               rules={[
              //                   {
              //                       validator: (_, value) =>
              //                           value ? Promise.resolve() : Promise.reject(new Error('You must check this to proceed')),
              //                   },
              //               ]}
						>
							<Checkbox>
								Signup for updates & offers
								<p className="text-sm text-gray-500">
									We will occasionally send you updates via email or sms with information from the
									pharmacy including changes to opening hours, changes to services, alerts for
									seasonal services, public health warnings and pharmacy offers. We promise we won’t
									spam you.
								</p>
							</Checkbox>
						</Form.Item>

						<Form.Item
							name="privacyPolicy"
							valuePropName="checked"
                            rules={[
                                {
                                    validator: (_, value) =>
                                        value ? Promise.resolve() : Promise.reject(new Error('You must accept the privacy policy!')),
                                },
                            ]}
						>
							{/* <Checkbox onChange={({target})=>target.checked?showModal():handleOk()}> */}
							<Checkbox>
								I accept the privacy policy
								<p className="text-sm text-gray-500">
									I agree to accept the terms & conditions mentioned in your{" "}
									<span onClick={showModal} style={{ color: "blue" }}>
										privacy policy
									</span>
									.
								</p>
							</Checkbox>
						</Form.Item>
						<Form.Item style={{ marginBottom: 5 }}>
							<Button
								type="primary"
								htmlType="submit"
								className="w-full bg-primary"
								loading={loading}
							>
								Submit
							</Button>
						</Form.Item>

						<Form.Item>
							<Link href="/">
								<Button type="default" className="w-full" disabled={loading}>
									Back
								</Button>
							</Link>
						</Form.Item>
					</Form>
					<Modal
						open={isModalVisible}
						onCancel={handleCancel}
						footer={[
							<Button key="ok" type="primary" onClick={handleOk}>
								OK
							</Button>,
						]}
					>
						<h1 className="text-lg font-bold">Privacy Policy For Website and Taskgo Users</h1>
						<br />
						<p>
							The EU General Data Protection Regulation (GDPR) includes rules on giving privacy
							information to anyone using our online services. Further information about your rights
							under GDPR can be found at www.ico.org.uk
						</p>
						<br />

						<p className="mb-2">
							This site is provided and supported by <strong>Taskgo Pharma LTD</strong> for <strong>Local Pharmacy Group</strong>. Taskgo Pharma Ltd is a data processor for La Pharma Limited. Local Pharmacy Group is your data controller*.
						</p>

						<p className="mb-2">You can contact our Data Protection Officer by emailing info@taskgo.ie </p>

						<ol className="list-disc !pl-6">
							<li>
								<strong>Local Pharmacy Group</strong>, and <strong>Taskgo Pharma Ltd</strong> take
								your privacy and data protection very seriously.
							</li>
							<li>
								Registration on this site is only requested if either online shopping or online
								repeat prescription ordering is enabled on the site and used by you.
							</li>
							<li>
								<strong>Local Pharmacy Group is</strong> your Data Controller. Our full privacy
								policy is available above <br />
								<strong>Taskgo Pharma Ltd</strong> your Data Processor for the purposes of providing
								the services available on this site - online repeat prescription ordering and online
								appointment booking, the registered user information database.
							</li>
							<li>
								Where enabled our online retail sales are processed and filled on our behalf by
								Local Pharmacy Group
							</li>
							<li>
								<strong>Local Pharmacy Group</strong> is your Data Controller for the purposes of
								processing your online retail orders where shopping is available on website.
							</li>
							<li>
								Your personal information is stored encrypted on servers in the Republic of Ireland.{" "}
								<strong>Taskgo Pharma Ltd</strong> may at times process or transfer encrypted
								personal information outside the UK (and possibly to places outside the European
								Economic Area) to deliver site services, for example to process email and sms
								updates. <strong>Taskgo Pharma Ltd</strong> shall take reasonable steps to ensure
								that any transfer of your personal information to a country or territory outside the
								European Economic Area, whose laws may provide for a lesser standard of protection
								for your personal information than that provided under European law, shall have
								adequate protection (such as model contractual arrangements as approved by the EU).
							</li>
							<li>
								We will otherwise never pass, sell or share your personally identifiable data to
								third parties except when legally required to do so or when you have specifically
								given us consent to do so.
							</li>
							<li>
								You may review, edit, or delete your information at any time via your profile.
							</li>
							<li>
								Information you delete from your profile held in our systems may still be held by
								your data controller, Local Pharmacy Group, in other records held or systems used by
								Local Pharmacy Group for the purposes of patient safety, professional pharmacy
								regulations, prescription record keeping and business processing such as a your
								Patient Medical Record and VAT records.
							</li>
							<li>
								If Local Pharmacy Group ceases to use the website/app service provided by Taskgo
								Pharma LTD, as the data controller, Local Pharmacy Group may request a download of
								the data stored on our systems and your data will be deleted from our systems
							</li>
							<li>
								If you use the online shopping facility you will receive email updates on your
								order.
							</li>
							<li>
								If you use the online repeat prescription facility on this site you will receive
								email or sms updates on your prescription request and automated email or sms
								reminders if you request them.
							</li>
							<li>
								Every effort has been made to make sure our databases are secure. All your personal
								information is stored in the Republic of Ireland. Your information can only be
								accessed by Local Pharmacy Group and trusted Local Pharmacy Group and Taskgo Pharma
								Ltd staff and IT contractors. Occasionally, information may be viewed by trusted
								third parties such as Pharmacies, Doctors and IT personnel for the purpose of
								improving this service.
							</li>
							<li>
								The site and app, our servers and third party service providers wherever they are
								based, have appropriate technical and organisational measures in place to protect
								against unauthorised or unlawful use of your personal information as well as the
								accidental loss, destruction or damage of your personal information whilst under our
								control.
							</li>
							<li>
								However, no data transmission over the internet can ever be guaranteed to be 100%
								secure and whilst we strive to protect your personal information, we cannot
								guarantee the security of any information you transmit to us and you do so at your
								own risk.
							</li>
							<li>
								Your Community Pharmacist may use the information you supply to help in improving
								your wellbeing by informing your health decisions through advice, diagnostic testing
								and the management of chronic conditions. The information you supply here is
								important and will help <strong>Local Pharmacy Group</strong> and{" "}
								<strong>Taskgo Pharma Ltd</strong> understand your health needs better and improve
								the service given to you. With your permission only,{" "}
								<strong>Local Pharmacy Group and Taskgo Pharma LTD</strong> may in future use this
								information to:
								<ol className="list-disc !pl-6">
									<li>
										Update you with information on services relevant to you provided by Local
										Pharmacy Group for the HSE and privately.
									</li>
									<li>
										Update you with relevant pharmacy and general health, diet and wellbeing retail
										offers
									</li>
									<li>
										Update you with any public health alerts, drug recalls and changes in treatment
										advice and also information relevant to your condition(s)
									</li>
								</ol>
							</li>
							<li>
								<strong>Taskgo Pharma Ltd</strong> and <strong>Local Pharmacy Group</strong> may
								disclose depersonalised data (such as aggregated statistics) in order to describe
								sales, prescription demand, customers, traffic patterns and other site information
								to prospective partners, suppliers, medical researchers, sponsors, investors and
								other reputable third parties and for other lawful purposes, but these statistics
								will include no personally identifying information.
							</li>
							<li>
								<strong>Taskgo Pharma Ltd</strong> may disclose depersonalised aggregated data to
								third parties in the event that we sell or buy any business or assets.
							</li>
							<li>
								<strong>Tasko Pharma Ltd</strong> may disclose your personal data if all or
								substantially all of our assets are acquired by a third party, in which case
								personal data held by us as a processor for our customer La Pharma Limited may be
								one of the transferred assets.
							</li>
							<li>
								Under certain circumstances we may occasionally be required by law, court order or
								governmental authority to disclose certain types of personal information and we
								reserve the right to comply with any such legally binding request. Examples of the
								type of situation where this would occur would be:
								<ol className="list-disc !pl-6">
									<li>the administration of justice</li>
									<li>where we have to defend ourselves legally</li>
									<li>
										complying with the mandatory requirements of a government department collecting
										information
									</li>
									<li>
										to protect or defend the rights or property of Tasko Pharma Ltd or users of our
										services.
									</li>
								</ol>
							</li>
                        </ol>

                        <h1 className="text-lg font-bold my-2">Privacy Policy For Website Users</h1>

                        <p>
                            Hanlys Local Pharmacy New Ross, Kellys Local Pharmacy Enniscorthy, O’Donnells Local
                            Pharmacy Taghmon, Mayors Walk Local Pharmacy Waterford
                        </p>

                        <p className="font-bold my-3">PHARMACY PRIVACY NOTICE</p>

                        <p className="mb-2">
                            We process your personal data, which includes your name, contact details,
                            prescription medicines and data from other pharmacy and health care services we
                            provide to you (including, for example, pharmacy medicines, medicine use reviews,
                            flu vaccinations and stop smoking services) for the purposes of:
                        </p>

                        <p className="mb-2">
                            Your care – providing pharmacy services and care to you and, as appropriate, sharing
                            your information with your GP
                        </p>

                        <p className="mb-2">
                            Our payments – sharing your information with the PCRSE, others in the wider HSE, and
                            sometimes Local Authorities, and only limited information to those external to the
                            HSE who negotiate and check the accuracy of our payments; and,
                        </p>

                        <p className="mb-2">
                            Management – sharing only limited information with the PCRSE and others in the wider
                            HSE, and sometimes Local Authorities; as well as those external to the HSE who
                            ensure we maintain appropriate professional and service standards and that your
                            declarations and ours are accurate.
                        </p>

                        <p className="mb2">
                            We hold your information for as long as advised by the PSI. You have a right to a
                            copy of the information we hold about you, generally without charge. You may seek to
                            correct any inaccurate information.
                        </p>

                        <p className="mb-2">
                            We process your personal data in the performance of a task in the public interest,
                            for the provision of healthcare and treatment and the management of healthcare
                            systems. A pharmacist is responsible for the confidentiality of your information.
                            You may object to us holding your information.
                        </p>

                        <p className="mb-2">Our Data Protection Officer is David Wilson</p>

                        <p className="mb-2">
                            <strong>Local Pharmacy Group</strong> and Taskgo Pharma Ltd take your privacy and
                            data protection very seriously. Every effort has been made to make sure this
                            database is secure and it can only be accessed by{" "}
                            <strong>Local Pharmacy Group</strong> and trusted Taskgo Pharma Ltd staff and
                            occasionally, trusted third parties such as Doctors, Medical writers and IT
                            personnel for the purpose of improving this site. As well as helping you to treat
                            minor ailments, in support of your GP and the HSE, your Community Pharmacist can
                            play a very important and helpful role in your wellbeing and health decisions
                            through advice, diagnostic testing and the management of major conditions such as
                            coronary heart disease, diabetes, high cholesterol, high blood pressure and
                            respiratory problems.
                        </p>

                        <p className="mb-2">
                            The information you supply here is important and will help{" "}
                            <strong>Local Pharmacy Group</strong> and Taskgo Pharma Ltd understand your health
                            needs better and improve the service given to you. Only with your permission will
                            Pharmacy Company Name(s) and Taskgo Pharma Ltd use this information to: update you
                            with information on services relevant to you provided by your{" "}
                            <strong>Local Pharmacy Group</strong> and the HSE; update you with offers, coupons
                            and information relevant to your condition(s); update you with general health and
                            beauty, diet and wellbeing retail offers and coupons; update with you any public
                            health alerts, drug recalls and changes in treatment advice from the National
                            Institute of Clinical Excellence etc. We may also let medical research and public
                            health organisations access anonymous data for the benefit of the common good to
                            further understand disease incidence, treatment effectiveness and the better use of
                            research and medical resources.
                        </p>
						{/* Add more details about your privacy policy here */}
					</Modal>
				</div>
			</div>
		);
}

export default withAuth(RegisterPage,true);
