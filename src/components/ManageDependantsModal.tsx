import React, { useState, useEffect } from "react";
import { FiX, FiEdit2, FiTrash2, FiPlus, FiSave } from "react-icons/fi";
import ToggleSwitch from "./ui/ToggleSwitch";
import {
  getDependantsByMember,
  createDependant,
  updateDependant,
  deleteDependant,
  Dependant,
  CreateDependantRequest,
  UpdateDependantRequest,
} from "../services/dependantsService";

interface ManageDependantsModalProps {
  isOpen: boolean;
  onClose: () => void;
  memberId: string;
  memberName: string;
}

const ManageDependantsModal: React.FC<ManageDependantsModalProps> = ({
  isOpen,
  onClose,
  memberId,
  memberName,
}) => {
  const [dependants, setDependants] = useState<Dependant[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Form state for adding/editing
  const [formData, setFormData] = useState({
    full_name: "",
    relationship: "spouse" as const,
    date_of_birth: "",
    gender: "",
    id_number: "",
    is_covered: true,
  });

  useEffect(() => {
    if (isOpen && memberId) {
      fetchDependants();
    }
  }, [isOpen, memberId]);

  const fetchDependants = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getDependantsByMember(memberId);
      setDependants(response.dependants);
    } catch (err: any) {
      setError(err.message || "Failed to fetch dependants");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      full_name: "",
      relationship: "spouse",
      date_of_birth: "",
      gender: "",
      id_number: "",
      is_covered: true,
    });
    setShowAddForm(false);
    setEditingId(null);
  };

  const handleAdd = () => {
    resetForm();
    setShowAddForm(true);
  };

  const handleEdit = (dependant: Dependant) => {
    setFormData({
      full_name: dependant.full_name,
      relationship: dependant.relationship,
      date_of_birth: dependant.date_of_birth || "",
      gender: dependant.gender || "",
      id_number: dependant.id_number || "",
      is_covered: dependant.is_covered,
    });
    setEditingId(dependant.id);
    setShowAddForm(false);
  };

  const handleSave = async () => {
    if (!formData.full_name.trim()) {
      setError("Full name is required");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      if (editingId) {
        // Update existing dependant
        const updateData: UpdateDependantRequest = {
          full_name: formData.full_name,
          relationship: formData.relationship,
          date_of_birth: formData.date_of_birth || undefined,
          gender: formData.gender || undefined,
          id_number: formData.id_number || undefined,
          is_covered: formData.is_covered,
        };
        await updateDependant(editingId, updateData);
      } else {
        // Create new dependant
        const createData: CreateDependantRequest = {
          member_id: memberId,
          full_name: formData.full_name,
          relationship: formData.relationship,
          date_of_birth: formData.date_of_birth || undefined,
          gender: formData.gender || undefined,
          id_number: formData.id_number || undefined,
          is_covered: formData.is_covered,
        };
        await createDependant(createData);
      }

      await fetchDependants();
      resetForm();
    } catch (err: any) {
      setError(err.message || "Failed to save dependant");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (dependantId: string) => {
    if (!window.confirm("Are you sure you want to delete this dependant?")) {
      return;
    }

    setSaving(true);
    setError(null);

    try {
      await deleteDependant(dependantId);
      await fetchDependants();
    } catch (err: any) {
      setError(err.message || "Failed to delete dependant");
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div
          className="fixed inset-0 bg-black bg-opacity-50"
          onClick={onClose}
        ></div>

        <div className="relative bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Manage Dependants
              </h2>
              <p className="text-sm text-gray-600 mt-1">{memberName}</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <FiX className="h-6 w-6" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
            {error && (
              <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
                <p className="text-sm font-medium">{error}</p>
              </div>
            )}

            {loading ? (
              <div className="text-center py-8">
                <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600"></div>
                <p className="mt-2 text-sm text-gray-500">
                  Loading dependants...
                </p>
              </div>
            ) : (
              <>
                {/* Dependants List */}
                <div className="space-y-4 mb-6">
                  {dependants.map((dependant) => (
                    <div
                      key={dependant.id}
                      className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                    >
                      {editingId === dependant.id ? (
                        // Edit Form
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Full Name *
                              </label>
                              <input
                                type="text"
                                value={formData.full_name}
                                onChange={(e) =>
                                  setFormData({
                                    ...formData,
                                    full_name: e.target.value,
                                  })
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Enter full name"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Relationship *
                              </label>
                              <select
                                value={formData.relationship}
                                onChange={(e) =>
                                  setFormData({
                                    ...formData,
                                    relationship: e.target.value as any,
                                  })
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                              >
                                <option value="spouse">Spouse</option>
                                <option value="child">Child</option>
                                <option value="parent">Parent</option>
                                <option value="sibling">Sibling</option>
                                <option value="other">Other</option>
                              </select>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Date of Birth
                              </label>
                              <input
                                type="date"
                                value={formData.date_of_birth}
                                onChange={(e) =>
                                  setFormData({
                                    ...formData,
                                    date_of_birth: e.target.value,
                                  })
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Gender
                              </label>
                              <select
                                value={formData.gender}
                                onChange={(e) =>
                                  setFormData({
                                    ...formData,
                                    gender: e.target.value,
                                  })
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                              >
                                <option value="">Select Gender</option>
                                <option value="male">Male</option>
                                <option value="female">Female</option>
                                <option value="other">Other</option>
                              </select>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                ID Number
                              </label>
                              <input
                                type="text"
                                value={formData.id_number}
                                onChange={(e) =>
                                  setFormData({
                                    ...formData,
                                    id_number: e.target.value,
                                  })
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Enter ID number"
                              />
                            </div>
                            <div className="flex items-center space-x-3">
                              <ToggleSwitch
                                checked={formData.is_covered}
                                onChange={() =>
                                  setFormData({
                                    ...formData,
                                    is_covered: !formData.is_covered,
                                  })
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
                          <div className="flex space-x-2">
                            <button
                              onClick={handleSave}
                              disabled={saving}
                              className="inline-flex items-center px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 disabled:opacity-50"
                            >
                              <FiSave className="mr-1 h-4 w-4" />
                              {saving ? "Saving..." : "Save"}
                            </button>
                            <button
                              onClick={resetForm}
                              className="inline-flex items-center px-3 py-2 bg-gray-300 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-400"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        // Display Mode
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3">
                              <h3 className="text-lg font-medium text-gray-900">
                                {dependant.full_name}
                              </h3>
                              <span
                                className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                  dependant.is_covered
                                    ? "bg-green-100 text-green-800"
                                    : "bg-gray-100 text-gray-800"
                                }`}
                              >
                                {dependant.is_covered
                                  ? "Covered"
                                  : "Not Covered"}
                              </span>
                            </div>
                            <div className="mt-1 text-sm text-gray-600">
                              <p>
                                {dependant.relationship
                                  .charAt(0)
                                  .toUpperCase() +
                                  dependant.relationship.slice(1)}
                                {dependant.date_of_birth && (
                                  <>
                                    {" "}
                                    • Born {formatDate(dependant.date_of_birth)}
                                  </>
                                )}
                                {dependant.gender && (
                                  <>
                                    {" "}
                                    •{" "}
                                    {dependant.gender.charAt(0).toUpperCase() +
                                      dependant.gender.slice(1)}
                                  </>
                                )}
                              </p>
                              {dependant.id_number && (
                                <p className="text-xs text-gray-500">
                                  ID: {dependant.id_number}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleEdit(dependant)}
                              className="text-blue-600 hover:text-blue-700 p-1"
                              title="Edit dependant"
                            >
                              <FiEdit2 className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(dependant.id)}
                              className="text-red-600 hover:text-red-700 p-1"
                              title="Delete dependant"
                            >
                              <FiTrash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}

                  {dependants.length === 0 && !showAddForm && (
                    <div className="text-center py-8 text-gray-500">
                      <p>No dependants added yet.</p>
                    </div>
                  )}
                </div>

                {/* Add Form */}
                {showAddForm && (
                  <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">
                      Add New Dependant
                    </h3>
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Full Name *
                          </label>
                          <input
                            type="text"
                            value={formData.full_name}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                full_name: e.target.value,
                              })
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Enter full name"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Relationship *
                          </label>
                          <select
                            value={formData.relationship}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                relationship: e.target.value as any,
                              })
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                          >
                            <option value="spouse">Spouse</option>
                            <option value="child">Child</option>
                            <option value="parent">Parent</option>
                            <option value="sibling">Sibling</option>
                            <option value="other">Other</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Date of Birth
                          </label>
                          <input
                            type="date"
                            value={formData.date_of_birth}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                date_of_birth: e.target.value,
                              })
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Gender
                          </label>
                          <select
                            value={formData.gender}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                gender: e.target.value,
                              })
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                          >
                            <option value="">Select Gender</option>
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                            <option value="other">Other</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            ID Number
                          </label>
                          <input
                            type="text"
                            value={formData.id_number}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                id_number: e.target.value,
                              })
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Enter ID number"
                          />
                        </div>
                        <div className="flex items-center space-x-3">
                          <ToggleSwitch
                            checked={formData.is_covered}
                            onChange={() =>
                              setFormData({
                                ...formData,
                                is_covered: !formData.is_covered,
                              })
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
                      <div className="flex space-x-2">
                        <button
                          onClick={handleSave}
                          disabled={saving}
                          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 disabled:opacity-50"
                        >
                          <FiSave className="mr-1 h-4 w-4" />
                          {saving ? "Saving..." : "Add Dependant"}
                        </button>
                        <button
                          onClick={resetForm}
                          className="inline-flex items-center px-4 py-2 bg-gray-300 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-400"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Add Button */}
                {!showAddForm && (
                  <button
                    onClick={handleAdd}
                    className="w-full bg-gray-100 hover:bg-gray-200 text-gray-600 font-medium py-3 px-4 rounded-lg transition-colors border border-gray-300 flex items-center justify-center space-x-2"
                  >
                    <FiPlus className="h-4 w-4" />
                    <span>Add Dependant</span>
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManageDependantsModal;
