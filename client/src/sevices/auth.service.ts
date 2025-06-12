import { LoginFormData } from "@/app/auth/login/page";
import { SignupFormData } from "@/app/auth/signup/page";
import { axiosInstance, loginUser } from "@/config/axios";

/**
 * Register a new user
 * @param data - The signup data
 * @returns The registered user
 */
export const signUp = async (data: SignupFormData) => {
    try {
        console.log("Registering user", data);
        // Transform data to match the expected format that the server expects
        const transformedData = {
            ...data,
            location: {
                country: data.country,
                state: data.state,
                city: data.city
            }
        };
        const response = await axiosInstance.post('/auth/signup', transformedData);
        return response?.data;
    } catch (error: any) {
        throw error;
    }
}

/**
 * Login a user
 * @param data - The login data
 * @returns The logged in user
 */
export const signIn = async (data: LoginFormData) => {
    try {
        console.log("Logging in user", data);
        const response = await axiosInstance.post('/auth/login', data);
        loginUser(response?.data?.accessToken);
        return response?.data;
    } catch (error: any) {
        throw error;
    }
}
