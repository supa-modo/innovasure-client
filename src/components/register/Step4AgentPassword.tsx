import React, { useState } from "react";
import {
  UseFormRegister,
  FieldErrors,
  UseFormClearErrors,
} from "react-hook-form";
import api from "../../services/api";
import { TbArrowRight } from "react-icons/tb";
import { FaCheck } from "react-icons/fa";

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

interface Step4AgentPasswordProps {
  register: UseFormRegister<RegisterFormData>;
  errors: FieldErrors<RegisterFormData>;
  agentInfo: { name: string; code: string } | null;
  setAgentInfo: React.Dispatch<
    React.SetStateAction<{ name: string; code: string } | null>
  >;
  setError: React.Dispatch<React.SetStateAction<string>>;
  isLoading: boolean;
  onBack: () => void;
  onSubmit: () => void;
  clearError?: () => void;
  clearErrors: UseFormClearErrors<RegisterFormData>;
}

const Step4AgentPassword: React.FC<Step4AgentPasswordProps> = ({
  register,
  errors,
  agentInfo,
  setAgentInfo,
  setError,
  isLoading,
  onBack,
  onSubmit,
  clearError,
  clearErrors,
}) => {
  const [verifying, setVerifying] = useState(false);
  const [verifiedAgentCode, setVerifiedAgentCode] = useState<string>("");
  const [currentInputValue, setCurrentInputValue] = useState<string>("");

  const handleFormInputChange = (fieldName: keyof RegisterFormData) => {
    return (e: React.ChangeEvent<HTMLInputElement>) => {
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

  const validateAgentCode = async (agentCode: string) => {
    if (!agentCode || agentCode.length < 3) {
      setError("Please enter a valid agent code");
      return false;
    }

    try {
      setVerifying(true);
      setError("");

      const response = await api.get(`/agents/verify/${agentCode}`);

      if (response.data.valid && response.data.agent) {
        setAgentInfo({
          name: response.data.agent.name,
          code: response.data.agent.code,
        });
        setVerifiedAgentCode(agentCode);
        setCurrentInputValue(agentCode);
        return true;
      } else {
        setError("Invalid agent code. Please check and try again.");
        setAgentInfo(null);
        setVerifiedAgentCode("");
        return false;
      }
    } catch (err: any) {
      console.error("Agent verification error:", err);
      const errorMessage =
        err.response?.data?.error ||
        "Failed to verify agent code. Please try again.";
      setError(errorMessage);
      setAgentInfo(null);
      setVerifiedAgentCode("");
      return false;
    } finally {
      setVerifying(false);
    }
  };

  // Handle input changes to reset verification status
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setCurrentInputValue(newValue);

    // If the input value changes from the verified code, reset verification
    if (verifiedAgentCode && newValue !== verifiedAgentCode) {
      setVerifiedAgentCode("");
      setAgentInfo(null);
      setError("");
    }
  };

  // Check if agent is verified and input hasn't changed
  const isVerified =
    agentInfo && verifiedAgentCode && currentInputValue === verifiedAgentCode;

  return (
    <div className="space-y-4">
      <h2 className="text-[1.1rem] lg:text-xl font-semibold text-secondary-700 mb-4">
        Agent Code & Create Password
      </h2>

      {/* Agent Code Section */}
      <div className="-mx-1.5 lg:mx-0 border border-gray-200 rounded-xl p-3.5 lg:p-4 space-y-3">
        <p className="text-gray-600 text-sm lg:text-[0.95rem] mb-3">
          Enter the agent code provided by your insurance agent.
        </p>

        <div>
          <div className="flex items-center space-x-4 mb-1">
            <label className="block text-sm font-medium text-gray-700">
              Agent Code *
            </label>
            {agentInfo && (
              <div className="flex items-center space-x-3 px-3">
                <TbArrowRight className="w-4 h-4 text-green-800 " />
                <p className="text-green-800 text-sm font-medium">
                  {agentInfo.name}
                </p>
              </div>
            )}
          </div>

          <div className="flex space-x-2">
            <input
              type="text"
              placeholder="e.g., AG123456"
              {...register("agent_code")}
              onChange={(e) => {
                register("agent_code").onChange(e);
                handleInputChange(e);
              }}
              className={`flex-1 input-field ${errors.agent_code ? "input-error" : ""} placeholder:font-normal`}
            />
            <button
              type="button"
              onClick={() => {
                const agentCode = document.querySelector(
                  'input[name="agent_code"]'
                ) as HTMLInputElement;
                if (agentCode?.value) {
                  validateAgentCode(agentCode.value);
                }
              }}
              disabled={verifying}
              className={`px-4 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                isVerified
                  ? "bg-green-600 hover:bg-green-700 text-white"
                  : "bg-primary-600 hover:bg-primary-700 text-white"
              }`}
            >
              {verifying ? (
                "Verifying..."
              ) : isVerified ? (
                <FaCheck className="w-4 h-4" />
              ) : (
                "Verify"
              )}
            </button>
          </div>
          {errors.agent_code && (
            <p className="text-red-500 text-sm mt-1">
              {errors.agent_code.message}
            </p>
          )}
        </div>
      </div>

      {/* Password Section */}
      <div className="-mx-1.5 lg:mx-0 border border-gray-200 rounded-xl p-3.5 lg:p-4 space-y-3">
        <h3 className="font-semibold text-primary-700">
          Create Account Password
        </h3>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Password *
          </label>
          <input
            type="password"
            {...register("password")}
            onChange={handleFormInputChange("password")}
            className={`input-field ${errors.password ? "input-error" : ""}`}
          />
          {errors.password && (
            <p className="text-red-500 text-sm mt-1">
              {errors.password.message}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Confirm Password *
          </label>
          <input
            type="password"
            {...register("confirm_password")}
            onChange={handleFormInputChange("confirm_password")}
            className={`input-field ${errors.confirm_password ? "input-error" : ""}`}
          />
          {errors.confirm_password && (
            <p className="text-red-500 text-sm mt-1">
              {errors.confirm_password.message}
            </p>
          )}
        </div>
      </div>

      <div className="flex flex-col-reverse lg:flex-row gap-2 lg:gap-3 text-[0.9rem] lg:text-base">
        <button
          type="button"
          onClick={onBack}
          className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2.5 px-4 rounded-lg transition-colors border border-gray-300"
        >
          Back
        </button>
        <button
          type="submit"
          disabled={isLoading || !agentInfo}
          onClick={onSubmit}
          className="flex-1 bg-linear-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 transform disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg"
        >
          {isLoading ? (
            <div className="flex items-center justify-center">
              <div className="spinner mr-2"></div>
              Registering...
            </div>
          ) : (
            "Complete Registration"
          )}
        </button>
      </div>
    </div>
  );
};

export default Step4AgentPassword;
