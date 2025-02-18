"use client";
import { Button } from 'antd';
import Link from 'next/link';
import withAuth from "@/app/auth/withAuth";

const ThankYouPage: React.FC = () => {

    const handleBackToHome = (): void => {
        // Add your navigation logic here
    };

    return (
        <div className="h-screen flex flex-col items-center justify-center">
            <h1 className="text-3xl font-bold">Thank You!</h1>
            <p className="text-gray-400">Your order has been placed successfully</p>
            <img src="/thank-you.png" alt="Thank You" className="my-8 h-32"/>
            <p className="text-gray-400 w-4/12 text-center">
                Thank you for placing this order. Your nominated pharmacy will process your order and contact you should there be any issues.
            </p>
            <Button type="primary" className="bg-primary mt-4" onClick={handleBackToHome}>
                <Link href="/dashboard/order/history">View Order History</Link>
            </Button>
        </div>
    );
};

export default withAuth(ThankYouPage);