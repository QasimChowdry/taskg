import { useEffect, useState, ComponentType } from 'react';
import { useRouter } from 'next/navigation';

interface WithAuthProps {
    loginRoute?: boolean;
}

export default function withAuth<P extends object>(
    WrappedComponent: ComponentType<P>,
    loginRoute: boolean = false
) {
    return function (props: P & WithAuthProps) {
        const router = useRouter();
        const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

        useEffect(() => {
            const authStatus = checkAuth(); // Your auth check logic here
            setIsAuthenticated(authStatus);

            if (!authStatus && !loginRoute) {
                router.push('/'); // Redirect to login if not authenticated and not on a login route
            } else if (authStatus && loginRoute) {
                router.push('/dashboard/order/history'); // Redirect to dashboard if authenticated and on a login route
            }
        }, [router, loginRoute]);

        return isAuthenticated || loginRoute ? <WrappedComponent {...props} /> : null;
    };
}

function checkAuth(): boolean {
    // Retrieve the user object from local storage
    const userStr = localStorage.getItem('user');

    if (!userStr) {
        return false;
    }

    try {
        const userObj = JSON.parse(userStr);
        // Check if the token exists and is not empty
        return userObj.token && userObj.token.trim() !== '';
    } catch (e) {
        console.error('Error parsing user data:', e);
        return false;
    }
}