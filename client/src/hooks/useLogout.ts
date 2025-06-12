import { logoutUser } from "@/config/axios"
import { useRouter } from "next/navigation"
import toast from "react-hot-toast"

export const useLogout = () => {
    const router = useRouter();

    try {
        const logout = async () => {
            logoutUser();
            toast.success('Logged out successfully');
            router.push('/auth/login');
        }

        return logout;
    } catch (error) {
        toast.error('Failed to logout');
        throw error;
    }
}