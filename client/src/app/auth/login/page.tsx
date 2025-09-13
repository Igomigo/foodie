"use client"

import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import Link from "next/link"
import { useState } from "react"
import toast from "react-hot-toast"
import { useRouter } from "next/navigation"
import { signIn } from "@/sevices/auth.service"
import { Eye, EyeOff } from "lucide-react"

// Create form data validation schema
const loginSchema = z
  .object({
    email: z.string().email({ message: "Invalid email address" }),
    password: z.string().min(6, { message: "Password must have at least 6 characters" }),
  });

export type LoginFormData = z.infer<typeof loginSchema>

export default function LoginPage() {
  // Hooks
  const router = useRouter();

  // State Management
  const [isLoading, setIsLoading] = useState(false);
  const [seePassword, setSeePassword] = useState(false);  

  // Initialize form
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  // Handle form submission
  const onSubmit = async (data: LoginFormData) => {
    try {
      setIsLoading(true);

      const response = await signIn(data);

      toast.success(response?.data?.message || "Login successful");

      // Check for redirect route
      const redirectRoute = localStorage.getItem('redirectAfterLogin');
      if (redirectRoute) {
        localStorage.removeItem('redirectAfterLogin');
        router.replace(redirectRoute);
      } else {
        router.replace("/home");
      }
    } catch (error: any) {
      toast.error(error.response?.data?.errors || error.response?.data?.message);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen px-4 py-12 sm:px-6 lg:px-8 flex items-center">
      <div className="flex-1 max-w-lg mx-auto shadow-lg border border-gray-100 rounded-lg p-6 sm:p-8">
        <div className="text-center gap-2 mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-orange-500 mb-2">Foodie</h1>
          <p className="text-sm sm:text-base text-gray-600">
            Sign in to your account to continue
          </p>
        </div>
        <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="flex flex-col gap-2">
            <label className="text-gray-600 text-sm font-semibold" htmlFor="email">
              Email{" "}
              <span className="text-red-500" aria-label="required">
                *
              </span>
            </label>
            <input
              type="email"
              id="email"
              className="w-full px-4 py-2 rounded-lg text-gray-500 font-semibold border border-gray-300 hover:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-colors"
              {...register("email")}
              placeholder="Enter your email"
            />
            {errors.email && <p className="text-red-600 text-sm">{errors.email.message}</p>}
          </div>

          <div className="relative flex flex-col gap-2">
            <label className="text-gray-600 text-sm font-semibold" htmlFor="password">
              Password{" "}
              <span className="text-red-500" aria-label="required">
                *
              </span>
            </label>
            <input
              type={seePassword ? "text" : "password"}
              id="password"
              className="w-full px-4 py-2 rounded-lg text-gray-500 font-semibold border border-gray-300 hover:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-colors"
              {...register("password")}
              placeholder="Enter your password"
            />
            <button
              type="button"
              onClick={() => setSeePassword(!seePassword)}
              className="absolute right-4 top-1/2 text-gray-500 hover:text-orange-500 transition-colors ease-in-out duration-500"
            >
              {seePassword ? <EyeOff /> : <Eye />}
            </button>
            {errors.password && <p className="text-red-600 text-sm">{errors.password.message}</p>}
          </div>

          <button
            type="submit"
            className="w-full py-3 px-4 bg-orange-600 hover:bg-orange-700 text-white font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 transition-colors"
            disabled={isLoading}
          >
            {isLoading ? "Signing In..." : "Sign In"}
          </button>
          <div className="text-center">
            <p className="text-sm">Don't have an account? <Link href={"/auth/signup"} className="text-orange-500 font-semibold hover:text-orange-600">sign up</Link></p>
          </div>
        </form>
      </div>
    </div>
  )
}
