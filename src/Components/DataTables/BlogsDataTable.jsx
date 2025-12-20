import React, { useState } from 'react';
import toast from 'react-hot-toast';
import axios from 'axios';
import { motion } from 'framer-motion';
import {
    FaSpinner,
    FaPlus,
    FaTrashAlt,
    FaEdit,
    FaChevronRight,
    FaChevronLeft,
    FaCheck,
    FaTimes,
    FaEye,
    FaImage,
    FaCalendar,
    FaUser
} from 'react-icons/fa';
import { useQuery } from '@tanstack/react-query';
import { XCircle } from 'lucide-react';
import TiptapWithImg from '../TextEditor/TiptapWithImg';

export default function BlogsDataTable({ blogs, loading, refetch }) {
    const [filters, setFilters] = useState({
        global: '',
        title: '',
        author: '',
        date_from: '',
        date_to: ''
    });
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage] = useState(10);
    const [deletingBlogId, setDeletingBlogId] = useState(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedBlog, setSelectedBlog] = useState(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [blogToDelete, setBlogToDelete] = useState(null);
    const [updatingBlog, setUpdatingBlog] = useState(false);
    const [previewBlog, setPreviewBlog] = useState(null);
    const [showPreviewModal, setShowPreviewModal] = useState(false);

    // Form states
    const [formData, setFormData] = useState({
        BlogTitle: '',
        BlogContent: '',
        Image: null
    });

    const [editFormData, setEditFormData] = useState({
        blogID: null,
        BlogTitle: '',
        BlogContent: '',
        Image: null,
        existingImage: null
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
    });

    const handleDeleteClick = (blogId) => {
        setBlogToDelete(blogId);
        setShowDeleteConfirm(true);
    };

    const handleConfirmDelete = async () => {
        if (!blogToDelete) return;

        setDeletingBlogId(blogToDelete);
        setShowDeleteConfirm(false);

        try {
            await axios.delete(
                `https://localhost:7086/api/v1/Blog/DeleteBlog/${blogToDelete}`,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('userToken')}`
                    }
                }
            );
            toast.success('Blog deleted successfully', { duration: 2000 });
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
            setDeletingBlogId(null);
            setBlogToDelete(null);
        }
    };

    const handleFormChange = (e) => {
        const { name, value, type, files } = e.target;

        if (type === 'file') {
            setFormData(prev => ({
                ...prev,
                [name]: files[0]
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    const handleEditFormChange = (e) => {
        const { name, value, type, files } = e.target;

        if (type === 'file') {
            setEditFormData(prev => ({
                ...prev,
                [name]: files[0]
            }));
        } else {
            setEditFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    const resetForm = () => {
        setFormData({
            BlogTitle: '',
            BlogContent: '',
            Image: null
        });
    };

    const prepareEditForm = async (blog) => {
        try {
            // Fetch full blog details including content
            const response = await axios.get(
                `https://localhost:7086/api/v1/Blog/GetBlogByID/${blog.blogID}`,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('userToken')}`
                    }
                }
            );

            const blogData = response.data;
            
            setSelectedBlog(blog);
            setEditFormData({
                blogID: blogData.blogID,
                BlogTitle: blogData.blogTitle,
                BlogContent: blogData.blogContent || '',
                Image: null,
                existingImage: blogData.blogImagePath
            });
            setShowEditModal(true);
        } catch (error) {
            toast.error('Failed to load blog details');
            console.error(error);
        }
    };

    const handleAddBlog = async (e) => {
        e.preventDefault();

        const userId = localStorage.getItem('userId');
        if (!userId) {
            toast.error('User ID not found. Please log in again.');
            return;
        }

        if (!formData.BlogTitle.trim() || !formData.BlogContent.trim()) {
            toast.error('Title and content are required', { duration: 3000 });
            return;
        }

        setUpdatingBlog(true);
        try {
            const formDataToSend = new FormData();
            formDataToSend.append('BlogTitle', formData.BlogTitle);
            formDataToSend.append('BlogContent', formData.BlogContent);
            formDataToSend.append('UserID', userId);
            
            if (formData.Image) {
                formDataToSend.append('Image', formData.Image);
            }

            await axios.post(
                'https://localhost:7086/api/v1/Blog/CreateBlog',
                formDataToSend,
                {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('userToken')}`,
                        'Content-Type': 'multipart/form-data'
                    }
                }
            );
            setUpdatingBlog(false);
            toast.success('Blog added successfully', { duration: 2000 });
            setShowAddModal(false);
            resetForm();
            refetch();
        } catch (error) {
            setUpdatingBlog(false);
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

    const handleUpdateBlog = async (e) => {
        e.preventDefault();

        const userId = localStorage.getItem('userId');
        if (!userId) {
            toast.error('User ID not found. Please log in again.');
            return;
        }

        if (!editFormData.BlogTitle.trim() || !editFormData.BlogContent.trim()) {
            toast.error('Title and content are required', { duration: 3000 });
            return;
        }

        setUpdatingBlog(true);
        try {
            const formDataToSend = new FormData();
            formDataToSend.append('BlogTitle', editFormData.BlogTitle);
            formDataToSend.append('BlogContent', editFormData.BlogContent);
            formDataToSend.append('UserID', userId);
            
            if (editFormData.Image) {
                formDataToSend.append('Image', editFormData.Image);
            }

            await axios.put(
                `https://localhost:7086/api/v1/Blog/UpdatBlog/${editFormData.blogID}`,
                formDataToSend,
                {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('userToken')}`,
                        'Content-Type': 'multipart/form-data'
                    }
                }
            );
            setUpdatingBlog(false);
            toast.success('Blog updated successfully', { duration: 2000 });
            setShowEditModal(false);
            refetch();
        } catch (error) {
            setUpdatingBlog(false);
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

    // Filter blogs based on all filter criteria
    const filteredBlogs = blogs?.filter(blog => {
        const matchesGlobal =
            filters.global === '' ||
            blog.blogTitle.toLowerCase().includes(filters.global.toLowerCase()) ||
            blog.blogCreatedBy.toLowerCase().includes(filters.global.toLowerCase());

        const matchesTitle = filters.title === '' || 
            blog.blogTitle.toLowerCase().includes(filters.title.toLowerCase());
        
        const matchesAuthor = filters.author === '' || 
            blog.blogCreatedBy.toLowerCase().includes(filters.author.toLowerCase());

        // Date range filter
        let matchesDate = true;
        if (blog.blogCreatedDate) {
            const blogDate = new Date(blog.blogCreatedDate);
            if (filters.date_from) {
                const startDate = new Date(filters.date_from);
                startDate.setHours(0, 0, 0, 0);
                if (blogDate < startDate) matchesDate = false;
            }
            if (filters.date_to) {
                const endDate = new Date(filters.date_to);
                endDate.setHours(23, 59, 59, 999);
                if (blogDate > endDate) matchesDate = false;
            }
        }

        return matchesGlobal && matchesTitle && matchesAuthor && matchesDate;
    }) || [];

    // Pagination logic
    const totalPages = Math.ceil(filteredBlogs.length / rowsPerPage);
    const paginatedBlogs = filteredBlogs.slice(
        (currentPage - 1) * rowsPerPage,
        currentPage * rowsPerPage
    );

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const renderPagination = () => {
        if (totalPages <= 1) return null;

        return (
            <div className="flex justify-between items-center mt-4 px-4 pb-1">
                <div className='text-xs'>
                    Showing {((currentPage - 1) * rowsPerPage + 1)}-{Math.min(currentPage * rowsPerPage, filteredBlogs.length)} of {filteredBlogs.length} entries
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

    // Check if current user has permission to manage blogs
    const canManageBlogs = true;

    // Preview blog function
    const handlePreviewBlog = async (blog) => {
        try {
            // Fetch full blog details for preview
            const response = await axios.get(
                `https://localhost:7086/api/v1/Blog/GetBlogByID/${blog.blogID}`,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('userToken')}`
                    }
                }
            );

            const blogData = response.data;
            setPreviewBlog(blogData);
            setShowPreviewModal(true);
        } catch (error) {
            toast.error('Failed to load blog for preview');
            console.error(error);
        }
    };

    // Render preview modal
    const PreviewModal = ({ blog, onClose }) => {
        if (!blog) return null;

        return (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
                onClick={onClose}
            >
                <motion.div
                    initial={{ y: -50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 50, opacity: 0 }}
                    className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold text-gray-800">Blog Preview</h2>
                            <button
                                onClick={onClose}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                <XCircle size={24} />
                            </button>
                        </div>

                        {/* Blog Content */}
                        <div className="space-y-6">
                            {/* Title */}
                            <h1 className="text-3xl font-bold text-gray-900">{blog.blogTitle}</h1>

                            {/* Author and Date */}
                            <div className="flex items-center gap-4 text-gray-600">
                                <div className="flex items-center gap-2">
                                    <FaUser className="text-gray-400" />
                                    <span>{blog.blogCreatedBy || 'Unknown Author'}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <FaCalendar className="text-gray-400" />
                                    <span>{formatDate(blog.blogCreatedDate)}</span>
                                </div>
                            </div>

                            {/* Image */}
                            {blog.blogImagePath && (
                                <div className="mt-4">
                                    <img
                                        src={`https://localhost:7086${blog.blogImagePath}`}
                                        alt={blog.blogTitle}
                                        className="w-full h-auto rounded-lg shadow-md"
                                    />
                                </div>
                            )}

                            {/* Content */}
                            <div className="mt-6 prose prose-lg max-w-none">
                                <div dangerouslySetInnerHTML={{ __html: blog.blogContent }} />
                            </div>
                        </div>

                        <div className="mt-8 flex justify-end">
                            <button
                                onClick={onClose}
                                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
                            >
                                Close Preview
                            </button>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        );
    };

    return (
        <div className="shadow-2xl rounded-2xl overflow-hidden bg-white">
            {/* Global Search and Add Button */}
            <div className="p-4 border-b flex justify-between items-center gap-4">
                <input
                    type="text"
                    value={filters.global}
                    onChange={(e) => handleFilterChange('global', e.target.value)}
                    placeholder="Search blogs..."
                    className="px-3 py-2 rounded-xl shadow-sm focus:outline-2 focus:outline-primary w-full border border-primary transition-all"
                />
                {canManageBlogs && (
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="bg-primary hover:bg-darkBlue transition-all text-white px-3 py-2 rounded-xl shadow-sm min-w-max flex items-center gap-2"
                    >
                        <FaPlus size={18} />
                        <span>Add Blog</span>
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
                                <input
                                    type="text"
                                    placeholder="Title"
                                    value={filters.title}
                                    onChange={(e) => handleFilterChange('title', e.target.value)}
                                    className="text-xs p-1 border rounded w-full"
                                />
                            </th>
                            <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Image
                            </th>
                            <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                <div className="flex items-center gap-2">
                                    <FaUser />
                                    <input
                                        type="text"
                                        placeholder="Author"
                                        value={filters.author}
                                        onChange={(e) => handleFilterChange('author', e.target.value)}
                                        className="text-xs p-1 border rounded w-full"
                                    />
                                </div>
                            </th>
                            <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                <div className="flex items-center gap-2">
                                    <FaCalendar />
                                    <span>Created Date</span>
                                    <div className="flex flex-col gap-1">
                                        <input
                                            type="date"
                                            value={filters.date_from}
                                            onChange={(e) => handleFilterChange('date_from', e.target.value)}
                                            className="text-xs p-1 border rounded w-full"
                                            placeholder="From"
                                        />
                                        <input
                                            type="date"
                                            value={filters.date_to}
                                            onChange={(e) => handleFilterChange('date_to', e.target.value)}
                                            className="text-xs p-1 border rounded w-full"
                                            placeholder="To"
                                        />
                                    </div>
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
                                <td colSpan="6" className="px-3 py-4 text-center">
                                    <div className="flex justify-center items-center gap-2">
                                        <FaSpinner className="animate-spin" size={18} />
                                        Loading blogs...
                                    </div>
                                </td>
                            </tr>
                        ) : paginatedBlogs.length === 0 ? (
                            <tr>
                                <td colSpan="6" className="px-3 py-4 text-center">
                                    No blogs found
                                </td>
                            </tr>
                        ) : (
                            paginatedBlogs.map((blog) => (
                                <tr key={blog.blogID} className="hover:bg-gray-50">
                                    <td className="px-3 py-4 whitespace-nowrap">
                                        <div className="font-medium text-gray-900">#{blog.blogID}</div>
                                    </td>
                                    <td className="px-3 py-4">
                                        <div className="font-medium">{blog.blogTitle}</div>
                                    </td>
                                    <td className="px-3 py-4 whitespace-nowrap">
                                        {blog.blogImagePath ? (
                                            <img
                                                src={`https://localhost:7086${blog.blogImagePath}`}
                                                alt={blog.blogTitle}
                                                className="h-12 w-12 object-cover rounded-md"
                                            />
                                        ) : (
                                            <div className="h-12 w-12 bg-gray-200 rounded-md flex items-center justify-center">
                                                <FaImage className="text-gray-400" />
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-3 py-4 whitespace-nowrap">
                                        <div className="flex items-center gap-2">
                                            <FaUser className="text-gray-400" />
                                            {blog.blogCreatedBy}
                                        </div>
                                    </td>
                                    <td className="px-3 py-4 whitespace-nowrap">
                                        <div className="flex items-center gap-2">
                                            <FaCalendar className="text-gray-400" />
                                            {formatDate(blog.blogCreatedDate)}
                                        </div>
                                    </td>
                                    <td className="px-3 py-4 whitespace-nowrap">
                                        <div className="flex items-center gap-2">
                                            {canManageBlogs && (
                                                <>
                                                    <button
                                                        className="text-blue-500 hover:text-blue-700 p-1"
                                                        onClick={() => prepareEditForm(blog)}
                                                    >
                                                        <FaEdit size={18} />
                                                    </button>
                                                    <button
                                                        className="text-red-500 hover:text-red-700 p-1"
                                                        onClick={() => handleDeleteClick(blog.blogID)}
                                                        disabled={deletingBlogId === blog.blogID}
                                                    >
                                                        {deletingBlogId === blog.blogID ? (
                                                            <FaSpinner className="animate-spin" size={18} />
                                                        ) : (
                                                            <FaTrashAlt size={18} />
                                                        )}
                                                    </button>
                                                </>
                                            )}
                                            <button
                                                className="text-green-500 hover:text-green-700 p-1"
                                                onClick={() => handlePreviewBlog(blog)}
                                                title="Preview Blog"
                                            >
                                                <FaEye size={18} />
                                            </button>
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

            {/* Add Blog Modal */}
            {showAddModal && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
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
                        className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="p-6">
                            <h2 className="text-xl font-bold mb-4">Add New Blog</h2>
                            <form onSubmit={handleAddBlog}>
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                                    <input
                                        type="text"
                                        name="BlogTitle"
                                        value={formData.BlogTitle}
                                        onChange={handleFormChange}
                                        className="w-full px-3 py-2 border rounded-md"
                                        required
                                        placeholder="Enter blog title"
                                    />
                                </div>

                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Cover Image</label>
                                    {formData.Image ? (
                                        <div className="relative mb-4">
                                            <img
                                                src={URL.createObjectURL(formData.Image)}
                                                alt="Preview"
                                                className="h-48 w-full object-cover rounded-lg"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setFormData(prev => ({ ...prev, Image: null }))}
                                                className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-2"
                                            >
                                                <FaTimes size={16} />
                                            </button>
                                        </div>
                                    ) : (
                                        <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                                <FaImage className="w-8 h-8 mb-3 text-gray-400" />
                                                <p className="mb-2 text-sm text-gray-500">
                                                    <span className="font-semibold">Click to upload</span> or drag and drop
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    PNG, JPG, JPEG (MAX. 5MB)
                                                </p>
                                            </div>
                                            <input
                                                id="Image"
                                                name="Image"
                                                type="file"
                                                className="hidden"
                                                onChange={handleFormChange}
                                                accept="image/*"
                                            />
                                        </label>
                                    )}
                                </div>

                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Content *</label>
                                    <TiptapWithImg
                                        content={formData.BlogContent}
                                        onUpdate={(content) => setFormData(prev => ({ ...prev, BlogContent: content }))}
                                    />
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
                                        disabled={updatingBlog}
                                    >
                                        {updatingBlog ? (
                                            <>
                                                <FaSpinner className="animate-spin" size={18} />
                                                <span>Adding...</span>
                                            </>
                                        ) : (
                                            <>
                                                <FaPlus size={18} />
                                                <span>Add Blog</span>
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </motion.div>
                </motion.div>
            )}

            {/* Edit Blog Modal */}
            {showEditModal && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
                >
                    <button onClick={() => {
                        setShowEditModal(false);
                    }} className='fixed top-5 right-5 text-red-500 backdrop-blur-lg rounded-full z-50' >
                        <XCircle className='' size={40} />
                    </button>
                    <motion.div
                        initial={{ y: -50, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 50, opacity: 0 }}
                        className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="p-6">
                            <h2 className="text-xl font-bold mb-4">Edit Blog</h2>
                            <form onSubmit={handleUpdateBlog}>
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                                    <input
                                        type="text"
                                        name="BlogTitle"
                                        value={editFormData.BlogTitle}
                                        onChange={handleEditFormChange}
                                        className="w-full px-3 py-2 border rounded-md"
                                        required
                                    />
                                </div>

                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Cover Image</label>
                                    {editFormData.Image ? (
                                        <div className="relative mb-4">
                                            <img
                                                src={URL.createObjectURL(editFormData.Image)}
                                                alt="Preview"
                                                className="h-48 w-full object-cover rounded-lg"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setEditFormData(prev => ({ ...prev, Image: null }))}
                                                className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-2"
                                            >
                                                <FaTimes size={16} />
                                            </button>
                                        </div>
                                    ) : editFormData.existingImage ? (
                                        <div className="relative mb-4">
                                            <img
                                                src={`https://localhost:7086${editFormData.existingImage}`}
                                                alt="Current"
                                                className="h-48 w-full object-cover rounded-lg"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setEditFormData(prev => ({ ...prev, existingImage: null }))}
                                                className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-2"
                                            >
                                                <FaTimes size={16} />
                                            </button>
                                        </div>
                                    ) : (
                                        <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                                <FaImage className="w-8 h-8 mb-3 text-gray-400" />
                                                <p className="mb-2 text-sm text-gray-500">
                                                    <span className="font-semibold">Click to upload</span> or drag and drop
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    PNG, JPG, JPEG (MAX. 5MB)
                                                </p>
                                            </div>
                                            <input
                                                id="edit_Image"
                                                name="Image"
                                                type="file"
                                                className="hidden"
                                                onChange={handleEditFormChange}
                                                accept="image/*"
                                            />
                                        </label>
                                    )}
                                </div>

                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Content *</label>
                                    <TiptapWithImg
                                        content={editFormData.BlogContent}
                                        onUpdate={(content) => setEditFormData(prev => ({ ...prev, BlogContent: content }))}
                                    />
                                </div>

                                <div className="flex justify-end gap-3 mt-6">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowEditModal(false);
                                        }}
                                        className="px-4 py-2 border rounded-md text-gray-700 hover:bg-gray-50"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-4 py-2 bg-primary text-white rounded-md hover:bg-darkBlue transition-all flex items-center justify-center gap-2"
                                        disabled={updatingBlog}
                                    >
                                        {updatingBlog ? (
                                            <>
                                                <FaSpinner className="animate-spin" size={18} />
                                                <span>Updating...</span>
                                            </>
                                        ) : (
                                            <>
                                                <FaCheck size={18} />
                                                <span>Update Blog</span>
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
                                    <h3 className="text-lg font-medium text-gray-900">Delete Blog</h3>
                                    <div className="mt-2">
                                        <p className="text-sm text-gray-500">
                                            Are you sure you want to delete this blog? This action cannot be undone.
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

            {/* Preview Modal */}
            {showPreviewModal && (
                <PreviewModal
                    blog={previewBlog}
                    onClose={() => {
                        setShowPreviewModal(false);
                        setPreviewBlog(null);
                    }}
                />
            )}
        </div>
    );
}