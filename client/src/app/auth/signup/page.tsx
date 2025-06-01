"use client"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import PhoneInput from "react-phone-input-2"
import "react-phone-input-2/lib/style.css"

// Create form data validation schema
const signupSchema = z
  .object({
    username: z.string().min(3, { message: "Username must have at least 3 characters" }),
    email: z.string().email({ message: "Invalid email address" }),
    password: z.string().min(5, { message: "Password must have at least 5 characters" }),
    confirmPassword: z.string().min(1, { message: "Confirm password is required" }),
    phoneNumber: z.string().min(1, { message: "Phone number is required" }),
    country: z.string().min(1, { message: "Country is required" }),
    state: z.string().min(1, { message: "State is required" }),
    city: z.string().min(1, { message: "City is required" }),
  })
  .refine((data: { password: string; confirmPassword: string }) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })

type SignupFormData = z.infer<typeof signupSchema>

export default function Page() {
  // Initialize form
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    mode: "onBlur",
  })

  // Handle form submission
  const onSubmit = async (data: SignupFormData) => {
    try {
      console.log(data)
    } catch (error) {
      console.error("signup failed", error)
    }
  }

  return (
    <div className="min-h-screen px-4 py-12 sm:px-6 lg:px-8">
      <div className="max-w-lg mx-auto shadow-lg border border-gray-100 rounded-lg p-6 sm:p-8">
        <div className="text-center gap-2 mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Create Account</h1>
          <p className="text-sm sm:text-base text-gray-600">
            Join <span className="text-orange-500 font-bold">FlavourCompass</span> to discover amazing food experiences
          </p>
        </div>
        <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="flex flex-col gap-2">
            <label className="text-gray-600 text-sm font-semibold" htmlFor="username">
              Username{" "}
              <span className="text-red-500" aria-label="required">
                *
              </span>
            </label>
            <input
              type="text"
              id="username"
              className="w-full px-4 py-2 rounded-lg text-gray-500 font-semibold border border-gray-300 hover:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-colors"
              {...register("username")}
              placeholder="Enter your username"
            />
            {errors.username && <p className="text-red-600 text-sm">{errors.username.message}</p>}
          </div>

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

          <div className="flex flex-col gap-2">
            <label className="text-gray-600 text-sm font-semibold" htmlFor="phoneNumber">
              Phone Number{" "}
              <span className="text-red-500" aria-label="required">
                *
              </span>
            </label>
            <div className="phone-input-container">
              <PhoneInput
                country={"ng"}
                value={watch("phoneNumber")}
                onChange={(phone) => setValue("phoneNumber", phone)}
                containerClass="w-full"
                inputClass="phone-input-field"
                buttonClass="phone-input-button"
                dropdownClass="phone-input-dropdown"
                enableSearch={true}
                searchPlaceholder="Search country..."
                countryCodeEditable={false}
                specialLabel=""
                inputProps={{
                  id: "phoneNumber",
                  name: "phoneNumber",
                  required: true,
                  placeholder: "Enter your phone number",
                }}
              />
            </div>
            {errors.phoneNumber && <p className="text-red-600 text-sm">{errors.phoneNumber.message}</p>}
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-gray-600 text-sm font-semibold" htmlFor="password">
              Password{" "}
              <span className="text-red-500" aria-label="required">
                *
              </span>
            </label>
            <input
              type="password"
              id="password"
              className="w-full px-4 py-2 rounded-lg text-gray-500 font-semibold border border-gray-300 hover:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-colors"
              {...register("password")}
              placeholder="Enter your password"
            />
            {errors.password && <p className="text-red-600 text-sm">{errors.password.message}</p>}
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-gray-600 text-sm font-semibold" htmlFor="confirmPassword">
              Confirm Password{" "}
              <span className="text-red-500" aria-label="required">
                *
              </span>
            </label>
            <input
              type="password"
              id="confirmPassword"
              className="w-full px-4 py-2 rounded-lg text-gray-500 font-semibold border border-gray-300 hover:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-colors"
              {...register("confirmPassword")}
              placeholder="Confirm your password"
            />
            {errors.confirmPassword && <p className="text-red-600 text-sm">{errors.confirmPassword.message}</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-gray-600 text-sm font-semibold" htmlFor="country">
                Country{" "}
                <span className="text-red-500" aria-label="required">
                  *
                </span>
              </label>
              <input
                type="text"
                id="country"
                className="w-full px-4 py-2 rounded-lg text-gray-500 font-semibold border border-gray-300 hover:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-colors"
                {...register("country")}
                placeholder="Enter country"
              />
              {errors.country && <p className="text-red-600 text-sm">{errors.country.message}</p>}
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-gray-600 text-sm font-semibold" htmlFor="state">
                State{" "}
                <span className="text-red-500" aria-label="required">
                  *
                </span>
              </label>
              <input
                type="text"
                id="state"
                className="w-full px-4 py-2 rounded-lg text-gray-500 font-semibold border border-gray-300 hover:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-colors"
                {...register("state")}
                placeholder="Enter state"
              />
              {errors.state && <p className="text-red-600 text-sm">{errors.state.message}</p>}
            </div>
            <div className="flex flex-col gap-2 sm:col-span-2 lg:col-span-1">
              <label className="text-gray-600 text-sm font-semibold" htmlFor="city">
                City{" "}
                <span className="text-red-500" aria-label="required">
                  *
                </span>
              </label>
              <input
                type="text"
                id="city"
                className="w-full px-4 py-2 rounded-lg text-gray-500 font-semibold border border-gray-300 hover:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-colors"
                {...register("city")}
                placeholder="Enter city"
              />
              {errors.city && <p className="text-red-600 text-sm">{errors.city.message}</p>}
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 px-4 bg-orange-600 hover:bg-orange-700 text-white font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 transition-colors"
          >
            Sign Up
          </button>
        </form>
      </div>
    </div>
  )
}
