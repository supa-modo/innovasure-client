import React from "react";
import {
  UseFormRegister,
  FieldErrors,
  UseFormClearErrors,
} from "react-hook-form";

interface RegisterFormData {
  full_name: string;
  phone: string;
  email?: string;
  id_number: string;
  kra_pin?: string;
  date_of_birth: string;
  gender: "male" | "female" | "other";
  address: {
    town: string;
    county: string;
  };
  next_of_kin: {
    name: string;
    phone: string;
    relationship: string;
    id_number: string;
  };
  agent_code: string;
  password: string;
  confirm_password: string;
}

interface Step1PersonalInfoProps {
  register: UseFormRegister<RegisterFormData>;
  errors: FieldErrors<RegisterFormData>;
  onNext: () => void;
  clearError?: () => void;
  clearErrors: UseFormClearErrors<RegisterFormData>;
}

const Step1PersonalInfo: React.FC<Step1PersonalInfoProps> = ({
  register,
  errors,
  onNext,
  clearError,
  clearErrors,
}) => {
  const handleInputChange = (fieldName: keyof RegisterFormData) => {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      // Call the original register onChange
      register(fieldName).onChange(e);

      // Clear the specific field error
      clearErrors(fieldName);

      // Clear any general error message when user starts typing
      if (clearError) {
        clearError();
      }
    };
  };
  return (
    <div className="space-y-6">
      <h2 className="text-base md:text-[1.1rem] lg:text-xl font-semibold text-secondary-700 mb-2 md:mb-3">
        Personal Information & Address
      </h2>

      {/* Row 1: Full Name and ID Number */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-500 mb-1">
            Full Name *
          </label>
          <input
            type="text"
            {...register("full_name")}
            onChange={handleInputChange("full_name")}
            className={`input-field ${errors.full_name ? "input-error" : ""}`}
            placeholder="Enter your full name"
          />
          {errors.full_name && (
            <p className="text-red-500 text-xs lg:text-sm mt-1">
              {errors.full_name.message}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-500 mb-1">
            ID Number *
          </label>
          <input
            type="text"
            placeholder="12345678"
            {...register("id_number")}
            onChange={handleInputChange("id_number")}
            className={`input-field ${errors.id_number ? "input-error" : ""}`}
          />
          {errors.id_number && (
            <p className="text-red-500 text-xs lg:text-sm mt-1">
              {errors.id_number.message}
            </p>
          )}
        </div>
      </div>

      {/* Row 2: Phone and Email */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-500 mb-1">
            Phone Number *
          </label>
          <input
            type="tel"
            placeholder="+254712345678"
            {...register("phone")}
            onChange={handleInputChange("phone")}
            className={`input-field ${errors.phone ? "input-error" : ""}`}
          />
          {errors.phone && (
            <p className="text-red-500 text-xs lg:text-sm mt-1">{errors.phone.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-500 mb-1">
            Email (Optional)
          </label>
          <input
            type="email"
            {...register("email")}
            onChange={handleInputChange("email")}
            className={`input-field ${errors.email ? "input-error" : ""}`}
            placeholder="email@example.com"
          />
          {errors.email && (
            <p className="text-red-500 text-xs lg:text-sm mt-1">{errors.email.message}</p>
          )}
        </div>
      </div>

      {/* Row 3: Gender, Date of Birth, and KRA PIN */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-500 mb-1">
            Gender *
          </label>
          <select
            {...register("gender")}
            onChange={handleInputChange("gender")}
            className={`input-field ${errors.gender ? "input-error" : ""}`}
          >
            <option value="">Select Gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
          {errors.gender && (
            <p className="text-red-500 text-xs lg:text-sm mt-1">{errors.gender.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-500 mb-1">
            Date of Birth *
          </label>
          <input
            type="date"
            {...register("date_of_birth")}
            onChange={handleInputChange("date_of_birth")}
            className={`input-field ${errors.date_of_birth ? "input-error" : ""}`}
            style={{
              // Improve mobile date picker experience
              fontSize: "16px", // Prevents zoom on iOS
              minHeight: "44px", // Better touch target
            }}
            // Add attributes for better mobile UX
            inputMode="numeric"
            pattern="[0-9]{4}-[0-9]{2}-[0-9]{2}"
            placeholder="YYYY-MM-DD"
          />
          {errors.date_of_birth && (
            <p className="text-red-500 text-xs lg:text-sm mt-1">
              {errors.date_of_birth.message}
            </p>
          )}
        </div>

        {/* <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            KRA PIN (Optional)
          </label>
          <input
            type="text"
            placeholder="A123456789B"
            {...register("kra_pin")}
            className={`input-field ${errors.kra_pin ? "input-error" : ""}`}
          />
          {errors.kra_pin && (
            <p className="text-red-500 text-xs lg:text-sm mt-1">
              {errors.kra_pin.message}
            </p>
          )}
        </div> */}
      </div>

      {/* Address Section - Full Width */}
      <div className="border border-gray-200 rounded-xl p-3.5 lg:p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">
              Member's Town *
            </label>
            <input
              type="text"
              {...register("address.town")}
              onChange={handleInputChange("address")}
              className={`input-field ${errors.address?.town ? "input-error" : ""}`}
              placeholder="Enter your town"
            />
            {errors.address?.town && (
              <p className="text-red-500 text-xs lg:text-sm mt-1">
                {errors.address.town.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">
              Member's County *
            </label>
            <input
              type="text"
              {...register("address.county")}
              onChange={handleInputChange("address")}
              className={`input-field ${errors.address?.county ? "input-error" : ""}`}
              placeholder="Enter your county"
            />
            {errors.address?.county && (
              <p className="text-red-500 text-xs lg:text-sm mt-1">
                {errors.address.county.message}
              </p>
            )}
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={onNext}
        className="w-full bg-linear-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white text-sm md:text-[0.9rem] lg:text-base font-medium py-3 px-4 rounded-lg transition-all duration-300 transform  shadow-lg"
      >
        Next: Dependants & Next of Kin
      </button>
    </div>
  );
};

export default Step1PersonalInfo;
