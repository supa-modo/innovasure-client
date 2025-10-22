import React from "react";
import {
  UseFormRegister,
  FieldErrors,
  UseFormClearErrors,
} from "react-hook-form";
import ToggleSwitch from "../ui/ToggleSwitch";
import { FaPlus } from "react-icons/fa";

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

interface Dependant {
  full_name: string;
  relationship: string;
  date_of_birth: string;
  is_covered: boolean;
}

interface Step2DependantsProps {
  register: UseFormRegister<RegisterFormData>;
  errors: FieldErrors<RegisterFormData>;
  dependants: Dependant[];
  setDependants: React.Dispatch<React.SetStateAction<Dependant[]>>;
  onBack: () => void;
  onNext: () => void;
  clearError?: () => void;
  clearErrors: UseFormClearErrors<RegisterFormData>;
}

const Step2Dependants: React.FC<Step2DependantsProps> = ({
  register,
  errors,
  dependants,
  setDependants,
  onBack,
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
  const addDependant = () => {
    setDependants([
      ...dependants,
      {
        full_name: "",
        relationship: "spouse",
        date_of_birth: "",
        is_covered: true,
      },
    ]);
  };

  const removeDependant = (index: number) => {
    setDependants(dependants.filter((_, i) => i !== index));
  };

  const updateDependant = (
    index: number,
    field: keyof Dependant,
    value: any
  ) => {
    const updated = [...dependants];
    updated[index] = { ...updated[index], [field]: value };
    setDependants(updated);
  };

  return (
    <div className="space-y-4">
      <h2 className="text-[1.1rem] lg:text-xl font-semibold text-secondary-700 mb-4">
        Dependants & Next of Kin
      </h2>
      <p className="text-gray-600 text-sm lg:text-[0.95rem] mb-4">
        Add your family members who will be covered under your insurance plan.
      </p>

      {dependants.map((dependant, index) => (
        <div
          key={index}
          className="-mx-2 lg:mx-0 border border-gray-200 rounded-xl p-3 lg:p-4"
        >
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-primary-700">
              Dependant {index + 1}
            </h3>
            <button
              type="button"
              onClick={() => removeDependant(index)}
              className="text-red-600 hover:text-red-700 text-sm"
            >
              Remove
            </button>
          </div>

          <div className="space-y-4">
            {/* Name and Relationship */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  placeholder="Full Name"
                  value={dependant.full_name}
                  onChange={(e) =>
                    updateDependant(index, "full_name", e.target.value)
                  }
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">
                  Relationship
                </label>
                <select
                  value={dependant.relationship}
                  onChange={(e) =>
                    updateDependant(index, "relationship", e.target.value)
                  }
                  className="input-field"
                >
                  <option value="spouse">Spouse</option>
                  <option value="child">Child</option>
                  <option value="parent">Parent</option>
                  <option value="sibling">Sibling</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            {/* Date of Birth and Coverage */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">
                  Date of Birth
                </label>
                <input
                  type="date"
                  value={dependant.date_of_birth}
                  onChange={(e) =>
                    updateDependant(index, "date_of_birth", e.target.value)
                  }
                  className="input-field"
                />
              </div>

              <div className="flex items-center pl-2">
                <div className="flex items-center space-x-3">
                  <ToggleSwitch
                    checked={dependant.is_covered}
                    onChange={() =>
                      updateDependant(
                        index,
                        "is_covered",
                        !dependant.is_covered
                      )
                    }
                    size="default"
                    variant="success"
                    title="Toggle coverage inclusion"
                  />
                  <span className="text-sm text-gray-700">
                    Included in coverage
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}

      <button
        type="button"
        onClick={addDependant}
        className="w-full bg-gray-100 hover:bg-gray-200 text-gray-600 font-medium py-2 px-4 rounded-lg transition-colors border border-gray-300"
      >
        <div className="flex items-center  font-semibold  justify-center space-x-2">
          <FaPlus size={15} className="text-gray-500" />
          <span>Add Dependent</span>
        </div>
      </button>

      {/* Next of Kin Section */}
      <div className="-mx-2 lg:mx-0 border border-gray-200 rounded-xl p-3 lg:p-4">
        <h3 className="font-semibold text-primary-700 mb-4">
          Next of Kin Information
        </h3>

        <div className="space-y-4">
          {/* Name and Phone */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">
                Full Name *
              </label>
              <input
                type="text"
                {...register("next_of_kin.name")}
                onChange={handleInputChange("next_of_kin")}
                className={`input-field ${errors.next_of_kin?.name ? "input-error" : ""}`}
              />
              {errors.next_of_kin?.name && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.next_of_kin.name.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">
                Phone Number *
              </label>
              <input
                type="tel"
                placeholder="+254712345678"
                {...register("next_of_kin.phone")}
                onChange={handleInputChange("next_of_kin")}
                className={`input-field ${errors.next_of_kin?.phone ? "input-error" : ""}`}
              />
              {errors.next_of_kin?.phone && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.next_of_kin.phone.message}
                </p>
              )}
            </div>
          </div>

          {/* Relationship and ID Number */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">
                Relationship *
              </label>
              <select
                {...register("next_of_kin.relationship")}
                onChange={handleInputChange("next_of_kin")}
                className={`input-field ${errors.next_of_kin?.relationship ? "input-error" : ""}`}
              >
                <option value="">Select Relationship</option>
                <option value="spouse">Spouse</option>
                <option value="parent">Parent</option>
                <option value="child">Child</option>
                <option value="sibling">Sibling</option>
                <option value="other">Other</option>
              </select>
              {errors.next_of_kin?.relationship && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.next_of_kin.relationship.message}
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
                {...register("next_of_kin.id_number")}
                onChange={handleInputChange("next_of_kin")}
                className={`input-field ${errors.next_of_kin?.id_number ? "input-error" : ""}`}
              />
              {errors.next_of_kin?.id_number && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.next_of_kin.id_number.message}
                </p>
              )}
            </div>
          </div>
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
          type="button"
          onClick={onNext}
          className="flex-1 bg-linear-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 transform shadow-lg"
        >
          Next: Agent Code & Plan
        </button>
      </div>
    </div>
  );
};

export default Step2Dependants;
