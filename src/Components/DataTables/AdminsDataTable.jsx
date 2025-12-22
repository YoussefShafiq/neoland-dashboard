import React, { useState } from 'react';
import toast from 'react-hot-toast';
import axios from 'axios';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
    FaSpinner,
    FaPlus,
    FaTrashAlt,
    FaTimes,
    FaEdit,
    FaChevronRight,
    FaChevronLeft,
    FaKey
} from 'react-icons/fa';
import { useQuery } from '@tanstack/react-query';
import { XCircle } from 'lucide-react';

export default function AdminsDataTable({ admins, loading, refetch }) {
    const navigate = useNavigate();
    const [filters, setFilters] = useState({
        global: '',
        name: '',
        description: '',
        role: ''
    });
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage] = useState(10);
    const [deletingAdminId, setDeletingAdminId] = useState(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showResetPasswordModal, setShowResetPasswordModal] = useState(false);
    const [selectedAdmin, setSelectedAdmin] = useState(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [adminToDelete, setAdminToDelete] = useState(null);
    const [updatingAdmin, setUpdatingAdmin] = useState(false);

    // Form states
    const [formData, setFormData] = useState({
        userName: '',
        userDescription: '',
        userPassword: '',
        confirmPassword: '',
        userRole: 'Admin'
    });

    // Reset password form state
    const [resetPasswordData, setResetPasswordData] = useState({
        newPassword: '',
        confirmPassword: ''
    });

    const handleFilterChange = (field, value) => {
        setFilters(prev => ({
            ...prev,
            [field]: value
        }));
        setCurrentPage(1);
    };


    const handleDeleteClick = (userId) => {
        setAdminToDelete(userId);
        setShowDeleteConfirm(true);
    };

    const handleConfirmDelete = async () => {
        if (!adminToDelete) return;

        setDeletingAdminId(adminToDelete);
        setShowDeleteConfirm(false);

        try {
            await axios.delete(
                `https://localhost:7086/api/v1/User/delete/${adminToDelete}`,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('userToken')}`
                    }
                }
            );
            toast.success('User deleted successfully', { duration: 2000 });
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
            setDeletingAdminId(null);
            setAdminToDelete(null);
        }
    };

    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleResetPasswordChange = (e) => {
        const { name, value } = e.target;
        setResetPasswordData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const resetForm = () => {
        setFormData({
            userName: '',
            userDescription: '',
            userPassword: '',
            confirmPassword: '',
            userRole: 'Admin'
        });
    };

    const resetPasswordForm = () => {
        setResetPasswordData({
            newPassword: '',
            confirmPassword: ''
        });
    };

    const prepareEditForm = (admin) => {
        setSelectedAdmin(admin);
        setFormData({
            userName: admin.userName,
            userDescription: admin.userDescription,
            userPassword: '',
            confirmPassword: '',
            userRole: admin.userRole
        });
        setShowEditModal(true);
    };

    const prepareResetPasswordForm = (admin) => {
        setSelectedAdmin(admin);
        resetPasswordForm();
        setShowResetPasswordModal(true);
    };

    const handleAddUser = async (e) => {
        e.preventDefault();

        if (formData.userPassword !== formData.confirmPassword) {
            toast.error('Passwords do not match', { duration: 3000 });
            return;
        }

        if (formData.userPassword.length < 6) {
            toast.error('Password must be at least 6 characters long', { duration: 3000 });
            return;
        }

        setUpdatingAdmin(true);
        try {
            await axios.post(
                'https://localhost:7086/api/v1/User/CreateUser',
                {
                    userName: formData.userName,
                    userDescription: formData.userDescription,
                    userPassword: formData.userPassword,
                    userRole: formData.userRole
                },
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('userToken')}`
                    }
                }
            );
            setUpdatingAdmin(false);
            toast.success('User added successfully', { duration: 2000 });
            setShowAddModal(false);
            resetForm();
            refetch();
        } catch (error) {
            setUpdatingAdmin(false);
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

    const handleUpdateUser = async (e) => {
        e.preventDefault();

        setUpdatingAdmin(true);
        try {
            await axios.put(
                `https://localhost:7086/api/v1/User/UpdateUsers/${selectedAdmin.userId}`,
                {
                    userName: formData.userName,
                    userDescription: formData.userDescription,
                    userRole: formData.userRole
                },
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('userToken')}`
                    }
                }
            );
            setUpdatingAdmin(false);
            toast.success('User updated successfully', { duration: 2000 });
            setShowEditModal(false);
            resetForm();
            refetch();
        } catch (error) {
            setUpdatingAdmin(false);
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

    const handleResetPassword = async (e) => {
        e.preventDefault();

        if (resetPasswordData.newPassword !== resetPasswordData.confirmPassword) {
            toast.error('Passwords do not match', { duration: 3000 });
            return;
        }

        if (resetPasswordData.newPassword.length < 6) {
            toast.error('Password must be at least 6 characters long', { duration: 3000 });
            return;
        }

        setUpdatingAdmin(true);
        try {
            await axios.post(
                `https://localhost:7086/api/v1/User/reset-password/${selectedAdmin.userId}`,
                {
                    newPassword: resetPasswordData.newPassword,
                    confirmPassword: resetPasswordData.confirmPassword
                },
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('userToken')}`
                    }
                }
            );
            setUpdatingAdmin(false);
            toast.success('Password reset successfully', { duration: 2000 });
            setShowResetPasswordModal(false);
            resetPasswordForm();
            refetch();
        } catch (error) {
            setUpdatingAdmin(false);
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

    // Filter users based on all filter criteria
    const filteredAdmins = admins?.filter(admin => {
        return (
            (filters.global === '' ||
                admin.userName.toLowerCase().includes(filters.global.toLowerCase()) ||
                admin.userDescription.toLowerCase().includes(filters.global.toLowerCase())) &&
            (filters.name === '' ||
                admin.userName.toLowerCase().includes(filters.name.toLowerCase())) &&
            (filters.description === '' ||
                admin.userDescription.toLowerCase().includes(filters.description.toLowerCase())) &&
            (filters.role === '' || admin.userRole.toLowerCase().includes(filters.role.toLowerCase()))
        );
    }) || [];

    // Pagination logic
    const totalPages = Math.ceil(filteredAdmins.length / rowsPerPage);
    const paginatedAdmins = filteredAdmins.slice(
        (currentPage - 1) * rowsPerPage,
        currentPage * rowsPerPage
    );

    const renderPagination = () => {
        if (totalPages <= 1) return null;

        return (
            <div className="flex justify-between items-center mt-4 px-4 pb-1">
                <div className='text-xs'>
                    Showing {((currentPage - 1) * rowsPerPage + 1)}-{Math.min(currentPage * rowsPerPage, filteredAdmins.length)} of {filteredAdmins.length} entries
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

    // Check if current user has permission to manage users
    // Since there are no permissions in your API, we'll assume all admins can manage users
    // You can adjust this logic based on your actual authentication/authorization
    const canManageUsers = true;

    return (
        <div className="shadow-2xl rounded-2xl overflow-hidden bg-white">
            {/* Global Search and Add Button */}
            <div className="p-4 border-b flex justify-between items-center gap-4">
                <input
                    type="text"
                    value={filters.global}
                    onChange={(e) => handleFilterChange('global', e.target.value)}
                    placeholder="Search users..."
                    className="px-3 py-2 rounded-xl shadow-sm focus:outline-2 focus:outline-primary w-full border border-primary transition-all"
                />
                {canManageUsers && (
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="bg-primary hover:bg-darkBlue transition-all text-white px-3 py-2 rounded-xl shadow-sm min-w-max flex items-center gap-2"
                    >
                        <FaPlus size={18} />
                        <span>Add User</span>
                    </button>
                )}
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                <input
                                    type="text"
                                    placeholder="Name"
                                    value={filters.name}
                                    onChange={(e) => handleFilterChange('name', e.target.value)}
                                    className="text-xs p-1 border rounded w-full"
                                />
                            </th>
                            <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                <input
                                    type="text"
                                    placeholder="Description"
                                    value={filters.description}
                                    onChange={(e) => handleFilterChange('description', e.target.value)}
                                    className="text-xs p-1 border rounded w-full"
                                />
                            </th>
                            <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                <input
                                    type="text"
                                    placeholder="Role"
                                    value={filters.role}
                                    onChange={(e) => handleFilterChange('role', e.target.value)}
                                    className="text-xs p-1 border rounded w-full"
                                />
                            </th>
                            <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200 text-sm">
                        {loading ? (
                            <tr>
                                <td colSpan="4" className="px-3 py-4 text-center">
                                    <div className="flex justify-center items-center gap-2">
                                        <FaSpinner className="animate-spin" size={18} />
                                        Loading users...
                                    </div>
                                </td>
                            </tr>
                        ) : paginatedAdmins.length === 0 ? (
                            <tr>
                                <td colSpan="4" className="px-3 py-4 text-center">
                                    No users found
                                </td>
                            </tr>
                        ) : (
                            paginatedAdmins.map((admin) => (
                                <tr key={admin.userId} className="hover:bg-gray-50">
                                    <td className="px-3 py-4 whitespace-nowrap">
                                        <div className="font-medium">{admin.userName}</div>
                                    </td>
                                    <td className="px-3 py-4 whitespace-nowrap">
                                        {admin.userDescription}
                                    </td>
                                    <td className="px-3 py-4 whitespace-nowrap capitalize">
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                            {admin.userRole}
                                        </span>
                                    </td>
                                    <td className="px-3 py-4 whitespace-nowrap">
                                        <div className="flex items-center gap-2">
                                            {canManageUsers && (
                                                <>
                                                    <button
                                                        className="text-blue-500 hover:text-blue-700 p-1"
                                                        onClick={() => prepareEditForm(admin)}
                                                    >
                                                        <FaEdit size={18} />
                                                    </button>
                                                    <button
                                                        className="text-purple-500 hover:text-purple-700 p-1"
                                                        onClick={() => prepareResetPasswordForm(admin)}
                                                    >
                                                        <FaKey size={18} />
                                                    </button>
                                                    <button
                                                        className="text-red-500 hover:text-red-700 p-1"
                                                        onClick={() => handleDeleteClick(admin.userId)}
                                                        disabled={deletingAdminId === admin.userId}
                                                    >
                                                        {deletingAdminId === admin.userId ? (
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

            {/* Add User Modal */}
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
                            <h2 className="text-xl font-bold mb-4">Add New User</h2>
                            <form onSubmit={handleAddUser}>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                                        <input
                                            type="text"
                                            name="userName"
                                            value={formData.userName}
                                            onChange={handleFormChange}
                                            className="w-full px-3 py-2 border rounded-md"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                                        <select
                                            name="userRole"
                                            value={formData.userRole}
                                            onChange={handleFormChange}
                                            className="w-full px-3 py-2 border rounded-md"
                                            required
                                        >
                                            <option value="Admin">Admin</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                    <textarea
                                        name="userDescription"
                                        value={formData.userDescription}
                                        onChange={handleFormChange}
                                        className="w-full px-3 py-2 border rounded-md"
                                        rows="3"
                                        required
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                                        <input
                                            type="password"
                                            name="userPassword"
                                            value={formData.userPassword}
                                            onChange={handleFormChange}
                                            className="w-full px-3 py-2 border rounded-md"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                                        <input
                                            type="password"
                                            name="confirmPassword"
                                            value={formData.confirmPassword}
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
                                        disabled={updatingAdmin}
                                    >
                                        {updatingAdmin ? (
                                            <>
                                                <FaSpinner className="animate-spin" size={18} />
                                                <span>Adding...</span>
                                            </>
                                        ) : (
                                            <>
                                                <FaPlus size={18} />
                                                <span>Add User</span>
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </motion.div>
                </motion.div>
            )}

            {/* Edit User Modal */}
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
                            <h2 className="text-xl font-bold mb-4">Edit User</h2>
                            <form onSubmit={handleUpdateUser}>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                                        <input
                                            type="text"
                                            name="userName"
                                            value={formData.userName}
                                            onChange={handleFormChange}
                                            className="w-full px-3 py-2 border rounded-md"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                                        <select
                                            name="userRole"
                                            value={formData.userRole}
                                            onChange={handleFormChange}
                                            className="w-full px-3 py-2 border rounded-md"
                                            required
                                        >
                                            <option value="Admin">Admin</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                    <textarea
                                        name="userDescription"
                                        value={formData.userDescription}
                                        onChange={handleFormChange}
                                        className="w-full px-3 py-2 border rounded-md"
                                        rows="3"
                                        required
                                    />
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
                                        disabled={updatingAdmin}
                                    >
                                        {updatingAdmin ? (
                                            <>
                                                <FaSpinner className="animate-spin" size={18} />
                                                <span>Updating...</span>
                                            </>
                                        ) : (
                                            <>
                                                <FaEdit size={18} />
                                                <span>Update User</span>
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </motion.div>
                </motion.div>
            )}

            {/* Reset Password Modal */}
            {showResetPasswordModal && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
                >
                    <button onClick={() => {
                        setShowResetPasswordModal(false);
                        resetPasswordForm();
                    }} className='fixed top-5 right-5 text-red-500 backdrop-blur-lg rounded-full z-50' >
                        <XCircle className='' size={40} />
                    </button>
                    <motion.div
                        initial={{ y: -50, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 50, opacity: 0 }}
                        className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="p-6">
                            <h2 className="text-xl font-bold mb-4">
                                Reset Password for {selectedAdmin?.userName}
                            </h2>
                            <form onSubmit={handleResetPassword}>
                                <div className="grid grid-cols-1 gap-4 mb-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                                        <input
                                            type="password"
                                            name="newPassword"
                                            value={resetPasswordData.newPassword}
                                            onChange={handleResetPasswordChange}
                                            className="w-full px-3 py-2 border rounded-md"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                                        <input
                                            type="password"
                                            name="confirmPassword"
                                            value={resetPasswordData.confirmPassword}
                                            onChange={handleResetPasswordChange}
                                            className="w-full px-3 py-2 border rounded-md"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="flex justify-end gap-3 mt-6">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowResetPasswordModal(false);
                                            resetPasswordForm();
                                        }}
                                        className="px-4 py-2 border rounded-md text-gray-700 hover:bg-gray-50"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-4 py-2 bg-primary text-white rounded-md hover:bg-darkBlue transition-all flex items-center justify-center gap-2"
                                        disabled={updatingAdmin}
                                    >
                                        {updatingAdmin ? (
                                            <>
                                                <FaSpinner className="animate-spin" size={18} />
                                                <span>Updating...</span>
                                            </>
                                        ) : (
                                            <>
                                                <FaKey size={18} />
                                                <span>Reset Password</span>
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
                                    <h3 className="text-lg font-medium text-gray-900">Delete User</h3>
                                    <div className="mt-2">
                                        <p className="text-sm text-gray-500">
                                            Are you sure you want to delete this user? This action cannot be undone.
                                        </p>
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
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </div>
    );
}