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
    FaGlobeAsia
} from 'react-icons/fa';
import { useQuery } from '@tanstack/react-query';
import { XCircle } from 'lucide-react';

export default function CategoriesDataTable({ categories, loading, refetch }) {
    const navigate = useNavigate();
    const [filters, setFilters] = useState({
        global: '',
        arabic: '',
        english: ''
    });
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage] = useState(10);
    const [deletingCategoryId, setDeletingCategoryId] = useState(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [categoryToDelete, setCategoryToDelete] = useState(null);
    const [updatingCategory, setUpdatingCategory] = useState(false);

    // Form states
    const [formData, setFormData] = useState({
        categoryDescAR: '',
        categoryDescEN: ''
    });

    const handleFilterChange = (field, value) => {
        setFilters(prev => ({
            ...prev,
            [field]: value
        }));
        setCurrentPage(1);
    };

    const handleDeleteClick = (categoryId) => {
        setCategoryToDelete(categoryId);
        setShowDeleteConfirm(true);
    };

    const handleConfirmDelete = async () => {
        if (!categoryToDelete) return;

        setDeletingCategoryId(categoryToDelete);
        setShowDeleteConfirm(false);

        try {
            await axios.delete(
                `https://localhost:7086/api/v1/Category/DeleteCategory/${categoryToDelete}`,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('userToken')}`
                    }
                }
            );
            toast.success('Category deleted successfully', { duration: 2000 });
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
            setDeletingCategoryId(null);
            setCategoryToDelete(null);
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
            categoryDescAR: '',
            categoryDescEN: ''
        });
    };

    const prepareEditForm = (category) => {
        setSelectedCategory(category);
        setFormData({
            categoryDescAR: category.categoryDescAR,
            categoryDescEN: category.categoryDescEN
        });
        setShowEditModal(true);
    };

    const handleAddCategory = async (e) => {
        e.preventDefault();

        if (!formData.categoryDescAR.trim() || !formData.categoryDescEN.trim()) {
            toast.error('Both Arabic and English descriptions are required', { duration: 3000 });
            return;
        }

        setUpdatingCategory(true);
        try {
            await axios.post(
                'https://localhost:7086/api/v1/Category/CreateCategory',
                {
                    categoryDescAR: formData.categoryDescAR,
                    categoryDescEN: formData.categoryDescEN
                },
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('userToken')}`
                    }
                }
            );
            setUpdatingCategory(false);
            toast.success('Category added successfully', { duration: 2000 });
            setShowAddModal(false);
            resetForm();
            refetch();
        } catch (error) {
            setUpdatingCategory(false);
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

    const handleUpdateCategory = async (e) => {
        e.preventDefault();

        if (!formData.categoryDescAR.trim() || !formData.categoryDescEN.trim()) {
            toast.error('Both Arabic and English descriptions are required', { duration: 3000 });
            return;
        }

        setUpdatingCategory(true);
        try {
            await axios.put(
                `https://localhost:7086/api/v1/Category/UpdateCategory/${selectedCategory.categoryID}`,
                {
                    categoryID: selectedCategory.categoryID,
                    categoryDescAR: formData.categoryDescAR,
                    categoryDescEN: formData.categoryDescEN
                },
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('userToken')}`
                    }
                }
            );
            setUpdatingCategory(false);
            toast.success('Category updated successfully', { duration: 2000 });
            setShowEditModal(false);
            resetForm();
            refetch();
        } catch (error) {
            setUpdatingCategory(false);
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

    // Filter categories based on all filter criteria
    const filteredCategories = categories?.filter(category => {
        return (
            (filters.global === '' ||
                category.categoryDescAR.includes(filters.global) ||
                category.categoryDescEN.toLowerCase().includes(filters.global.toLowerCase())) &&
            (filters.arabic === '' ||
                category.categoryDescAR.includes(filters.arabic)) &&
            (filters.english === '' ||
                category.categoryDescEN.toLowerCase().includes(filters.english.toLowerCase()))
        );
    }) || [];

    // Pagination logic
    const totalPages = Math.ceil(filteredCategories.length / rowsPerPage);
    const paginatedCategories = filteredCategories.slice(
        (currentPage - 1) * rowsPerPage,
        currentPage * rowsPerPage
    );

    const renderPagination = () => {
        if (totalPages <= 1) return null;

        return (
            <div className="flex justify-between items-center mt-4 px-4 pb-1">
                <div className='text-xs'>
                    Showing {((currentPage - 1) * rowsPerPage + 1)}-{Math.min(currentPage * rowsPerPage, filteredCategories.length)} of {filteredCategories.length} entries
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

    // Check if current user has permission to manage categories
    const canManageCategories = true;

    return (
        <div className="shadow-2xl rounded-2xl overflow-hidden bg-white">
            {/* Global Search and Add Button */}
            <div className="p-4 border-b flex justify-between items-center gap-4">
                <input
                    type="text"
                    value={filters.global}
                    onChange={(e) => handleFilterChange('global', e.target.value)}
                    placeholder="Search categories..."
                    className="px-3 py-2 rounded-xl shadow-sm focus:outline-2 focus:outline-primary w-full border border-primary transition-all"
                />
                {canManageCategories && (
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="bg-primary hover:bg-darkBlue transition-all text-white px-3 py-2 rounded-xl shadow-sm min-w-max flex items-center gap-2"
                    >
                        <FaPlus size={18} />
                        <span>Add Category</span>
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
                                Units Count
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
                                        Loading categories...
                                    </div>
                                </td>
                            </tr>
                        ) : paginatedCategories.length === 0 ? (
                            <tr>
                                <td colSpan="5" className="px-3 py-4 text-center">
                                    No categories found
                                </td>
                            </tr>
                        ) : (
                            paginatedCategories.map((category) => (
                                <tr key={category.categoryID} className="hover:bg-gray-50">
                                    <td className="px-3 py-4 whitespace-nowrap">
                                        <div className="font-medium text-gray-900">#{category.categoryID}</div>
                                    </td>
                                    <td className="px-3 py-4">
                                        <div className="font-medium">{category.categoryDescEN}</div>
                                    </td>
                                    <td className="px-3 py-4">
                                        <div className="text-right font-arabic text-lg">{category.categoryDescAR}</div>
                                    </td>
                                    <td className="px-3 py-4 whitespace-nowrap">
                                        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-800 text-sm font-semibold">
                                            {category.units?.length || 0}
                                        </span>
                                    </td>
                                    <td className="px-3 py-4 whitespace-nowrap">
                                        <div className="flex items-center gap-2">
                                            {canManageCategories && (
                                                <>
                                                    <button
                                                        className="text-blue-500 hover:text-blue-700 p-1"
                                                        onClick={() => prepareEditForm(category)}
                                                    >
                                                        <FaEdit size={18} />
                                                    </button>
                                                    <button
                                                        className="text-red-500 hover:text-red-700 p-1"
                                                        onClick={() => handleDeleteClick(category.categoryID)}
                                                        disabled={deletingCategoryId === category.categoryID}
                                                    >
                                                        {deletingCategoryId === category.categoryID ? (
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

            {/* Add Category Modal */}
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
                            <h2 className="text-xl font-bold mb-4">Add New Category</h2>
                            <form onSubmit={handleAddCategory}>
                                <div className="grid grid-cols-1 gap-6 mb-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            <div className="flex items-center gap-2">
                                                <FaGlobeAsia />
                                                <span>Arabic Description</span>
                                            </div>
                                        </label>
                                        <input
                                            name="categoryDescAR"
                                            value={formData.categoryDescAR}
                                            onChange={handleFormChange}
                                            className="w-full px-3 py-2 border rounded-md text-right font-arabic text-lg"
                                            placeholder="أدخل الوصف باللغة العربية"
                                            required
                                            dir="rtl"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            <div className="flex items-center gap-2">
                                                <FaGlobeAmericas />
                                                <span>English Description</span>
                                            </div>
                                        </label>
                                        <input
                                            name="categoryDescEN"
                                            value={formData.categoryDescEN}
                                            onChange={handleFormChange}
                                            className="w-full px-3 py-2 border rounded-md"
                                            placeholder="Enter description in English"
                                            required
                                        />
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
                                        disabled={updatingCategory}
                                    >
                                        {updatingCategory ? (
                                            <>
                                                <FaSpinner className="animate-spin" size={18} />
                                                <span>Adding...</span>
                                            </>
                                        ) : (
                                            <>
                                                <FaPlus size={18} />
                                                <span>Add Category</span>
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </motion.div>
                </motion.div>
            )}

            {/* Edit Category Modal */}
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
                            <h2 className="text-xl font-bold mb-4">Edit Category</h2>
                            <form onSubmit={handleUpdateCategory}>
                                <div className="grid grid-cols-1 gap-6 mb-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            <div className="flex items-center gap-2">
                                                <FaGlobeAsia />
                                                <span>Arabic Description</span>
                                            </div>
                                        </label>
                                        <input
                                            name="categoryDescAR"
                                            value={formData.categoryDescAR}
                                            onChange={handleFormChange}
                                            className="w-full px-3 py-2 border rounded-md text-right font-arabic text-lg"
                                            required
                                            dir="rtl"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            <div className="flex items-center gap-2">
                                                <FaGlobeAmericas />
                                                <span>English Description</span>
                                            </div>
                                        </label>
                                        <input
                                            name="categoryDescEN"
                                            value={formData.categoryDescEN}
                                            onChange={handleFormChange}
                                            className="w-full px-3 py-2 border rounded-md"
                                            required
                                        />
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
                                        disabled={updatingCategory}
                                    >
                                        {updatingCategory ? (
                                            <>
                                                <FaSpinner className="animate-spin" size={18} />
                                                <span>Updating...</span>
                                            </>
                                        ) : (
                                            <>
                                                <FaEdit size={18} />
                                                <span>Update Category</span>
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
                                    <h3 className="text-lg font-medium text-gray-900">Delete Category</h3>
                                    <div className="mt-2">
                                        <p className="text-sm text-gray-500">
                                            Are you sure you want to delete this category? This action cannot be undone.
                                        </p>
                                        {selectedCategory && (
                                            <div className="mt-3 p-3 bg-gray-50 rounded">
                                                <p className="text-sm font-medium text-gray-700">Category Details:</p>
                                                <p className="text-sm text-gray-600 mt-1">
                                                    <span className="font-arabic">{selectedCategory.categoryDescAR}</span>
                                                    <span className="mx-2">•</span>
                                                    <span>{selectedCategory.categoryDescEN}</span>
                                                </p>
                                                {selectedCategory.units?.length > 0 && (
                                                    <p className="text-sm text-yellow-600 mt-2">
                                                        ⚠️ This category has {selectedCategory.units.length} unit(s) associated with it.
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
                                    disabled={deletingCategoryId}
                                >
                                    {deletingCategoryId ? (
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