import React, { useState } from 'react';
import toast from 'react-hot-toast';
import axios from 'axios';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
    FaSpinner,
    FaPlus,
    FaTrashAlt,
    FaEdit,
    FaChevronRight,
    FaChevronLeft,
    FaGlobeAmericas,
    FaGlobeAsia,
    FaBuilding,
    FaCity,
    FaHardHat
} from 'react-icons/fa';
import { useQuery } from '@tanstack/react-query';
import { XCircle } from 'lucide-react';

export default function DevelopersDataTable({ developers, loading, refetch }) {
    const navigate = useNavigate();
    const [filters, setFilters] = useState({
        global: '',
        arabic: '',
        english: ''
    });
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage] = useState(10);
    const [deletingDeveloperId, setDeletingDeveloperId] = useState(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedDeveloper, setSelectedDeveloper] = useState(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [developerToDelete, setDeveloperToDelete] = useState(null);
    const [updatingDeveloper, setUpdatingDeveloper] = useState(false);

    // Form states - Note: API uses "DeveloperDescAR" not "developerDescAR"
    const [formData, setFormData] = useState({
        DeveloperDescAR: '',
        DeveloperDescEN: ''
    });

    const handleFilterChange = (field, value) => {
        setFilters(prev => ({
            ...prev,
            [field]: value
        }));
        setCurrentPage(1);
    };

    const { data: currentUser } = useQuery({
        queryKey: ['currentUser'],
        queryFn: () => {
            return axios.get('https://localhost:7086/api/v1/User/GetCurrentUser',
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('userToken')}`
                    }
                })
        }
    })

    const handleDeleteClick = (developerId) => {
        setDeveloperToDelete(developerId);
        setShowDeleteConfirm(true);
    };

    const handleConfirmDelete = async () => {
        if (!developerToDelete) return;

        setDeletingDeveloperId(developerToDelete);
        setShowDeleteConfirm(false);

        try {
            await axios.delete(
                `https://localhost:7086/api/v1/Developer/DeleteDeveloper/${developerToDelete}`,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('userToken')}`
                    }
                }
            );
            toast.success('Developer deleted successfully', { duration: 2000 });
            refetch();
        } catch (error) {
            toast.error(error.response?.data?.message || 'An unexpected error occurred', { duration: 3000 });
            if (error.response?.status === 401) {
                localStorage.removeItem('userToken')
                navigate('/login')
            }
            if (error.response?.status === 403) {
                toast.error('You are not authorized to perform this action')
            }
        } finally {
            setDeletingDeveloperId(null);
            setDeveloperToDelete(null);
        }
    };

    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const resetForm = () => {
        setFormData({
            DeveloperDescAR: '',
            DeveloperDescEN: ''
        });
    };

    const prepareEditForm = (developer) => {
        setSelectedDeveloper(developer);
        setFormData({
            DeveloperDescAR: developer.developerDescAR,
            DeveloperDescEN: developer.developerDescEN
        });
        setShowEditModal(true);
    };

    const handleAddDeveloper = async (e) => {
        e.preventDefault();

        if (!formData.DeveloperDescAR.trim() || !formData.DeveloperDescEN.trim()) {
            toast.error('Both Arabic and English descriptions are required', { duration: 3000 });
            return;
        }

        setUpdatingDeveloper(true);
        try {
            await axios.post(
                'https://localhost:7086/api/v1/Developer/CreateDeveloper',
                {
                    DeveloperDescAR: formData.DeveloperDescAR,
                    DeveloperDescEN: formData.DeveloperDescEN
                },
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('userToken')}`
                    }
                }
            );
            setUpdatingDeveloper(false);
            toast.success('Developer added successfully', { duration: 2000 });
            setShowAddModal(false);
            resetForm();
            refetch();
        } catch (error) {
            setUpdatingDeveloper(false);
            toast.error(error.response?.data?.message || 'An unexpected error occurred', { duration: 3000 });
            if (error.response?.status === 401) {
                localStorage.removeItem('userToken')
                navigate('/login')
            }
            if (error.response?.status === 403) {
                toast.error('You are not authorized to perform this action')
            }
        }
    };

    const handleUpdateDeveloper = async (e) => {
        e.preventDefault();

        if (!formData.DeveloperDescAR.trim() || !formData.DeveloperDescEN.trim()) {
            toast.error('Both Arabic and English descriptions are required', { duration: 3000 });
            return;
        }

        setUpdatingDeveloper(true);
        try {
            await axios.put(
                `https://localhost:7086/api/v1/Developer/UpdateDeveloper/${selectedDeveloper.developerID}`,
                {
                    DeveloperDescAR: formData.DeveloperDescAR,
                    DeveloperDescEN: formData.DeveloperDescEN
                },
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('userToken')}`
                    }
                }
            );
            setUpdatingDeveloper(false);
            toast.success('Developer updated successfully', { duration: 2000 });
            setShowEditModal(false);
            resetForm();
            refetch();
        } catch (error) {
            setUpdatingDeveloper(false);
            toast.error(error.response?.data?.message || 'An unexpected error occurred', { duration: 3000 });
            if (error.response?.status === 401) {
                localStorage.removeItem('userToken')
                navigate('/login')
            }
            if (error.response?.status === 403) {
                toast.error('You are not authorized to perform this action')
            }
        }
    };

    // Filter developers based on all filter criteria
    const filteredDevelopers = developers?.filter(developer => {
        return (
            (filters.global === '' ||
                developer.developerDescAR.includes(filters.global) ||
                developer.developerDescEN.toLowerCase().includes(filters.global.toLowerCase())) &&
            (filters.arabic === '' ||
                developer.developerDescAR.includes(filters.arabic)) &&
            (filters.english === '' ||
                developer.developerDescEN.toLowerCase().includes(filters.english.toLowerCase()))
        );
    }) || [];

    // Pagination logic
    const totalPages = Math.ceil(filteredDevelopers.length / rowsPerPage);
    const paginatedDevelopers = filteredDevelopers.slice(
        (currentPage - 1) * rowsPerPage,
        currentPage * rowsPerPage
    );

    // Count projects
    const countProjects = (developer) => developer.projects?.length || 0;

    const renderPagination = () => {
        if (totalPages <= 1) return null;

        return (
            <div className="flex justify-between items-center mt-4 px-4 pb-1">
                <div className='text-xs'>
                    Showing {((currentPage - 1) * rowsPerPage + 1)}-{Math.min(currentPage * rowsPerPage, filteredDevelopers.length)} of {filteredDevelopers.length} entries
                </div>
                <div className="flex gap-1">
                    <button
                        onClick={() => setCurrentPage(1)}
                        disabled={currentPage === 1}
                        className="p-1 disabled:opacity-50"
                    >
                        <FaChevronLeft className="h-4 w-4" />
                    </button>
                    <span className="px-3 py-1">
                        Page {currentPage} of {totalPages}
                    </span>
                    <button
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                        className="p-1 disabled:opacity-50"
                    >
                        <FaChevronRight className="h-4 w-4" />
                    </button>
                </div>
            </div>
        );
    };

    // Check if current user has permission to manage developers
    const canManageDevelopers = true;

    return (
        <div className="shadow-2xl rounded-2xl overflow-hidden bg-white">
            {/* Global Search and Add Button */}
            <div className="p-4 border-b flex justify-between items-center gap-4">
                <input
                    type="text"
                    value={filters.global}
                    onChange={(e) => handleFilterChange('global', e.target.value)}
                    placeholder="Search developers..."
                    className="px-3 py-2 rounded-xl shadow-sm focus:outline-2 focus:outline-primary w-full border border-primary transition-all"
                />
                {canManageDevelopers && (
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="bg-primary hover:bg-darkBlue transition-all text-white px-3 py-2 rounded-xl shadow-sm min-w-max flex items-center gap-2"
                    >
                        <FaPlus size={18} />
                        <span>Add Developer</span>
                    </button>
                )}
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                ID
                            </th>
                            <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                <div className="flex items-center gap-2">
                                    <FaGlobeAmericas />
                                    <input
                                        type="text"
                                        placeholder="Filter English"
                                        value={filters.english}
                                        onChange={(e) => handleFilterChange('english', e.target.value)}
                                        className="text-xs p-1 border rounded w-full"
                                    />
                                </div>
                            </th>
                            <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                <div className="flex items-center gap-2">
                                    <FaGlobeAsia />
                                    <input
                                        type="text"
                                        placeholder="Filter Arabic"
                                        value={filters.arabic}
                                        onChange={(e) => handleFilterChange('arabic', e.target.value)}
                                        className="text-xs p-1 border rounded w-full"
                                    />
                                </div>
                            </th>
                            <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                <div className="flex items-center gap-2">
                                    <FaBuilding />
                                    <span>Projects</span>
                                </div>
                            </th>
                            <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200 text-sm">
                        {loading ? (
                            <tr>
                                <td colSpan="5" className="px-3 py-4 text-center">
                                    <div className="flex justify-center items-center gap-2">
                                        <FaSpinner className="animate-spin" size={18} />
                                        Loading developers...
                                    </div>
                                </td>
                            </tr>
                        ) : paginatedDevelopers.length === 0 ? (
                            <tr>
                                <td colSpan="5" className="px-3 py-4 text-center">
                                    No developers found
                                </td>
                            </tr>
                        ) : (
                            paginatedDevelopers.map((developer) => (
                                <tr key={developer.developerID} className="hover:bg-gray-50">
                                    <td className="px-3 py-4 whitespace-nowrap">
                                        <div className="font-medium text-gray-900">#{developer.developerID}</div>
                                    </td>
                                    <td className="px-3 py-4">
                                        <div className="font-medium">{developer.developerDescEN}</div>
                                    </td>
                                    <td className="px-3 py-4">
                                        <div className="text-right font-arabic text-lg">{developer.developerDescAR}</div>
                                    </td>
                                    <td className="px-3 py-4 whitespace-nowrap">
                                        <div className="flex items-center gap-2">
                                            <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-800 text-sm font-semibold">
                                                {countProjects(developer)}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-3 py-4 whitespace-nowrap">
                                        <div className="flex items-center gap-2">
                                            {canManageDevelopers && (
                                                <>
                                                    <button
                                                        className="text-blue-500 hover:text-blue-700 p-1"
                                                        onClick={() => prepareEditForm(developer)}
                                                    >
                                                        <FaEdit size={18} />
                                                    </button>
                                                    <button
                                                        className="text-red-500 hover:text-red-700 p-1"
                                                        onClick={() => handleDeleteClick(developer.developerID)}
                                                        disabled={deletingDeveloperId === developer.developerID}
                                                    >
                                                        {deletingDeveloperId === developer.developerID ? (
                                                            <FaSpinner className="animate-spin" size={18} />
                                                        ) : (
                                                            <FaTrashAlt size={18} />
                                                        )}
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {!loading && renderPagination()}

            {/* Add Developer Modal */}
            {showAddModal && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
                >
                    <button onClick={() => {
                        setShowAddModal(false);
                        resetForm();
                    }} className='fixed top-5 right-5 text-red-500 backdrop-blur-lg rounded-full z-50' >
                        <XCircle className='' size={40} />
                    </button>
                    <motion.div
                        initial={{ y: -50, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 50, opacity: 0 }}
                        className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="p-6">
                            <h2 className="text-xl font-bold mb-4">Add New Developer</h2>
                            <form onSubmit={handleAddDeveloper}>
                                <div className="grid grid-cols-1 gap-6 mb-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            <div className="flex items-center gap-2">
                                                <FaGlobeAsia />
                                                <span>Arabic Description *</span>
                                            </div>
                                        </label>
                                        <input
                                            name="DeveloperDescAR"
                                            value={formData.DeveloperDescAR}
                                            onChange={handleFormChange}
                                            className="w-full px-3 py-2 border rounded-md text-right font-arabic text-lg"
                                            placeholder="أدخل الوصف باللغة العربية"
                                            required
                                            dir="rtl"
                                        />
                                        <p className="text-xs text-gray-500 mt-1">
                                            اسم المطور باللغة العربية
                                        </p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            <div className="flex items-center gap-2">
                                                <FaGlobeAmericas />
                                                <span>English Description *</span>
                                            </div>
                                        </label>
                                        <input
                                            name="DeveloperDescEN"
                                            value={formData.DeveloperDescEN}
                                            onChange={handleFormChange}
                                            className="w-full px-3 py-2 border rounded-md"
                                            placeholder="Enter description in English"
                                            required
                                        />
                                        <p className="text-xs text-gray-500 mt-1">
                                            Developer name in English
                                        </p>
                                    </div>
                                </div>

                                <div className="flex justify-end gap-3 mt-6">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowAddModal(false);
                                            resetForm();
                                        }}
                                        className="px-4 py-2 border rounded-md text-gray-700 hover:bg-gray-50"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-4 py-2 bg-primary text-white rounded-md hover:bg-darkBlue transition-all flex items-center justify-center gap-2"
                                        disabled={updatingDeveloper}
                                    >
                                        {updatingDeveloper ? (
                                            <>
                                                <FaSpinner className="animate-spin" size={18} />
                                                <span>Adding...</span>
                                            </>
                                        ) : (
                                            <>
                                                <FaPlus size={18} />
                                                <span>Add Developer</span>
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </motion.div>
                </motion.div>
            )}

            {/* Edit Developer Modal */}
            {showEditModal && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
                >
                    <button onClick={() => {
                        setShowEditModal(false);
                        resetForm();
                    }} className='fixed top-5 right-5 text-red-500 backdrop-blur-lg rounded-full z-50' >
                        <XCircle className='' size={40} />
                    </button>
                    <motion.div
                        initial={{ y: -50, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 50, opacity: 0 }}
                        className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="p-6">
                            <h2 className="text-xl font-bold mb-4">Edit Developer</h2>
                            <form onSubmit={handleUpdateDeveloper}>
                                <div className="grid grid-cols-1 gap-6 mb-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            <div className="flex items-center gap-2">
                                                <FaGlobeAsia />
                                                <span>Arabic Description *</span>
                                            </div>
                                        </label>
                                        <input
                                            name="DeveloperDescAR"
                                            value={formData.DeveloperDescAR}
                                            onChange={handleFormChange}
                                            className="w-full px-3 py-2 border rounded-md text-right font-arabic text-lg"
                                            required
                                            dir="rtl"
                                        />
                                        <p className="text-xs text-gray-500 mt-1">
                                            اسم المطور باللغة العربية
                                        </p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            <div className="flex items-center gap-2">
                                                <FaGlobeAmericas />
                                                <span>English Description *</span>
                                            </div>
                                        </label>
                                        <input
                                            name="DeveloperDescEN"
                                            value={formData.DeveloperDescEN}
                                            onChange={handleFormChange}
                                            className="w-full px-3 py-2 border rounded-md"
                                            required
                                        />
                                        <p className="text-xs text-gray-500 mt-1">
                                            Developer name in English
                                        </p>
                                    </div>
                                </div>

                                <div className="flex justify-end gap-3 mt-6">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowEditModal(false);
                                            resetForm();
                                        }}
                                        className="px-4 py-2 border rounded-md text-gray-700 hover:bg-gray-50"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-4 py-2 bg-primary text-white rounded-md hover:bg-darkBlue transition-all flex items-center justify-center gap-2"
                                        disabled={updatingDeveloper}
                                    >
                                        {updatingDeveloper ? (
                                            <>
                                                <FaSpinner className="animate-spin" size={18} />
                                                <span>Updating...</span>
                                            </>
                                        ) : (
                                            <>
                                                <FaEdit size={18} />
                                                <span>Update Developer</span>
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </motion.div>
                </motion.div>
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteConfirm && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
                    onClick={() => setShowDeleteConfirm(false)}
                >
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        className="bg-white rounded-lg shadow-xl w-full max-w-md"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="p-6">
                            <div className="flex items-start">
                                <div className="flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                                    <FaTrashAlt className="h-5 w-5 text-red-600" />
                                </div>
                                <div className="ml-4">
                                    <h3 className="text-lg font-medium text-gray-900">Delete Developer</h3>
                                    <div className="mt-2">
                                        <p className="text-sm text-gray-500">
                                            Are you sure you want to delete this developer? This action cannot be undone.
                                        </p>
                                        {selectedDeveloper && (
                                            <div className="mt-3 p-3 bg-gray-50 rounded">
                                                <p className="text-sm font-medium text-gray-700">Developer Details:</p>
                                                <p className="text-sm text-gray-600 mt-1">
                                                    <span className="font-arabic">{selectedDeveloper.developerDescAR}</span>
                                                    <span className="mx-2">•</span>
                                                    <span>{selectedDeveloper.developerDescEN}</span>
                                                </p>
                                                {countProjects(selectedDeveloper) > 0 && (
                                                    <p className="text-sm text-yellow-600 mt-2">
                                                        ⚠️ This developer has {countProjects(selectedDeveloper)} project(s) associated with it.
                                                    </p>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="mt-5 flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setShowDeleteConfirm(false)}
                                    className="px-4 py-2 border rounded-md text-gray-700 hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    onClick={handleConfirmDelete}
                                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                                    disabled={deletingDeveloperId}
                                >
                                    {deletingDeveloperId ? (
                                        <>
                                            <FaSpinner className="animate-spin inline mr-2" />
                                            Deleting...
                                        </>
                                    ) : 'Delete'}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </div>
    );
}