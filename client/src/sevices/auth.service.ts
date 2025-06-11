import { SignupFormData } from "@/app/auth/signup/page";
import { axiosInstance } from "@/config/axios.instance";

/**
 * Register a new user
 * @param data - The signup data
 * @returns The registered user
 */
export const registerUser = async (data: SignupFormData) => {
    try {
        console.log("Registering user", data);
        const response = await axiosInstance.post('/auth/signup', data);
        return response.data;
    } catch (error: any) {
        throw error;
    }
}
