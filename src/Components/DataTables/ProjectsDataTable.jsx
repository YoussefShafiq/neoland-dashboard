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
    FaEye,
    FaImage,
    FaMapMarkerAlt,
    FaBuilding,
    FaCity,
    FaFire,
    FaCalendarAlt,
    FaMoneyBillWave,
    FaGlobeAsia,
    FaGlobeAmericas,
    FaLink,
    FaCheck,
    FaTimes
} from 'react-icons/fa';
import { useQuery } from '@tanstack/react-query';
import { XCircle } from 'lucide-react';

export default function ProjectsDataTable({ projects, loading, refetch }) {
    const navigate = useNavigate();
    const [filters, setFilters] = useState({
        global: '',
        arabic: '',
        english: '',
        location: '',
        developer: '',
        hotDeal: ''
    });
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage] = useState(10);
    const [deletingProjectId, setDeletingProjectId] = useState(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedProject, setSelectedProject] = useState(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [projectToDelete, setProjectToDelete] = useState(null);
    const [updatingProject, setUpdatingProject] = useState(false);
    const [showPreviewModal, setShowPreviewModal] = useState(false);
    const [previewProject, setPreviewProject] = useState(null);

    // Form states
    const [formData, setFormData] = useState({
        ProjectDescAr: '',
        ProjectDescEn: '',
        ProjectImage: null,
        Flag: false,
        InstallmentPeriod: '',
        DownPayment: '',
        ActualLocation: '',
        LocationId: '',
        DeveloperId: ''
    });

    const [editFormData, setEditFormData] = useState({
        projectID: null,
        ProjectDescAr: '',
        ProjectDescEn: '',
        ProjectImage: null,
        existingImage: null,
        Flag: false,
        InstallmentPeriod: '',
        DownPayment: '',
        ActualLocation: '',
        LocationId: '',
        DeveloperId: ''
    });

    // Fetch locations and developers
    const { data: locationsData, isLoading: locationsLoading } = useQuery({
        queryKey: ['locations'],
        queryFn: () => {
            return axios.get(
                `https://localhost:7086/api/v1/Location/GetAllLocations`,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('userToken')}`
                    }
                }
            );
        },
    });

    const { data: developersData, isLoading: developersLoading } = useQuery({
        queryKey: ['developers'],
        queryFn: () => {
            return axios.get(
                `https://localhost:7086/api/v1/Developer/GetAllDevelopers`,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('userToken')}`
                    }
                }
            );
        },
    });

    const locations = locationsData?.data || [];
    const developers = developersData?.data || [];

    const handleFilterChange = (field, value) => {
        setFilters(prev => ({
            ...prev,
            [field]: value
        }));
        setCurrentPage(1);
    };

    const handleDeleteClick = (projectId) => {
        setProjectToDelete(projectId);
        setShowDeleteConfirm(true);
    };

    const handleConfirmDelete = async () => {
        if (!projectToDelete) return;

        setDeletingProjectId(projectToDelete);
        setShowDeleteConfirm(false);

        try {
            await axios.delete(
                `https://localhost:7086/api/v1/Project/DeleteProject/${projectToDelete}`,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('userToken')}`
                    }
                }
            );
            toast.success('Project deleted successfully', { duration: 2000 });
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
            setDeletingProjectId(null);
            setProjectToDelete(null);
        }
    };

    const handleFormChange = (e) => {
        const { name, value, type, checked, files } = e.target;

        if (type === 'file') {
            setFormData(prev => ({
                ...prev,
                [name]: files[0]
            }));
        } else if (type === 'checkbox') {
            setFormData(prev => ({
                ...prev,
                [name]: checked
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    const handleEditFormChange = (e) => {
        const { name, value, type, checked, files } = e.target;

        if (type === 'file') {
            setEditFormData(prev => ({
                ...prev,
                [name]: files[0]
            }));
        } else if (type === 'checkbox') {
            setEditFormData(prev => ({
                ...prev,
                [name]: checked
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
            ProjectDescAr: '',
            ProjectDescEn: '',
            ProjectImage: null,
            Flag: false,
            InstallmentPeriod: '',
            DownPayment: '',
            ActualLocation: '',
            LocationId: '',
            DeveloperId: ''
        });
    };

    const prepareEditForm = (project) => {
        setSelectedProject(project);
        setEditFormData({
            projectID: project.projectID,
            ProjectDescAr: project.projectDescAr,
            ProjectDescEn: project.projectDescEn,
            ProjectImage: null,
            existingImage: project.projectImagePath,
            Flag: project.flag,
            InstallmentPeriod: project.installmentPeriod || '',
            DownPayment: project.downPayment || '',
            ActualLocation: project.actualLocation || '',
            LocationId: project.locationId,
            DeveloperId: project.developerId
        });
        setShowEditModal(true);
    };

    const handleAddProject = async (e) => {
        e.preventDefault();

        // Validation
        if (!formData.ProjectDescAr.trim() || !formData.ProjectDescEn.trim()) {
            toast.error('Arabic and English descriptions are required', { duration: 3000 });
            return;
        }

        if (!formData.ProjectImage) {
            toast.error('Project image is required', { duration: 3000 });
            return;
        }

        if (!formData.LocationId) {
            toast.error('Please select a location', { duration: 3000 });
            return;
        }

        if (!formData.DeveloperId) {
            toast.error('Please select a developer', { duration: 3000 });
            return;
        }

        if (!formData.InstallmentPeriod || formData.InstallmentPeriod <= 0) {
            toast.error('Please enter a valid installment period (years)', { duration: 3000 });
            return;
        }

        // Optional: Add validation for DownPayment if needed
        // if (!formData.DownPayment || formData.DownPayment <= 0) {
        //     toast.error('Please enter a valid down payment amount', { duration: 3000 });
        //     return;
        // }

        setUpdatingProject(true);
        try {
            const formDataToSend = new FormData();
            formDataToSend.append('ProjectDescAr', formData.ProjectDescAr);
            formDataToSend.append('ProjectDescEn', formData.ProjectDescEn);
            formDataToSend.append('Flag', formData.Flag);
            formDataToSend.append('InstallmentPeriod', formData.InstallmentPeriod);
            formDataToSend.append('DownPayment', formData.DownPayment || 0);
            formDataToSend.append('ActualLocation', formData.ActualLocation);
            formDataToSend.append('LocationId', formData.LocationId);
            formDataToSend.append('DeveloperId', formData.DeveloperId);

            if (formData.ProjectImage) {
                formDataToSend.append('ProjectImage', formData.ProjectImage);
            }

            await axios.post(
                'https://localhost:7086/api/v1/Project/CreateProject',
                formDataToSend,
                {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('userToken')}`,
                        'Content-Type': 'multipart/form-data'
                    }
                }
            );
            setUpdatingProject(false);
            toast.success('Project added successfully', { duration: 2000 });
            setShowAddModal(false);
            resetForm();
            refetch();
        } catch (error) {
            setUpdatingProject(false);
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

    const handleUpdateProject = async (e) => {
        e.preventDefault();

        // Validation
        if (!editFormData.ProjectDescAr.trim() || !editFormData.ProjectDescEn.trim()) {
            toast.error('Arabic and English descriptions are required', { duration: 3000 });
            return;
        }

        if (!editFormData.LocationId) {
            toast.error('Please select a location', { duration: 3000 });
            return;
        }

        if (!editFormData.DeveloperId) {
            toast.error('Please select a developer', { duration: 3000 });
            return;
        }

        if (!editFormData.InstallmentPeriod || editFormData.InstallmentPeriod <= 0) {
            toast.error('Please enter a valid installment period (years)', { duration: 3000 });
            return;
        }

        // Optional: Add validation for DownPayment if needed
        // if (!editFormData.DownPayment || editFormData.DownPayment <= 0) {
        //     toast.error('Please enter a valid down payment amount', { duration: 3000 });
        //     return;
        // }

        setUpdatingProject(true);
        try {
            const formDataToSend = new FormData();
            formDataToSend.append('ProjectDescAr', editFormData.ProjectDescAr);
            formDataToSend.append('ProjectDescEn', editFormData.ProjectDescEn);
            formDataToSend.append('Flag', editFormData.Flag);
            formDataToSend.append('InstallmentPeriod', editFormData.InstallmentPeriod);
            formDataToSend.append('DownPayment', editFormData.DownPayment || 0);
            formDataToSend.append('ActualLocation', editFormData.ActualLocation);
            formDataToSend.append('LocationId', editFormData.LocationId);
            formDataToSend.append('DeveloperId', editFormData.DeveloperId);

            // Always send an image - either new or existing
            if (editFormData.ProjectImage) {
                formDataToSend.append('ProjectImage', editFormData.ProjectImage);
            } else if (editFormData.existingImage) {
                // Convert existing image URL to File object
                try {
                    const fullImageUrl = `https://localhost:7086${editFormData.existingImage}`;
                    const response = await fetch(fullImageUrl);
                    const blob = await response.blob();
                    const file = new File([blob], 'existing-image.jpg', { type: blob.type });
                    formDataToSend.append('ProjectImage', file);
                } catch (error) {
                    console.error('Error converting existing image:', error);
                    // Create a placeholder file if conversion fails
                    const blob = new Blob([''], { type: 'image/jpeg' });
                    const file = new File([blob], 'placeholder.jpg', { type: 'image/jpeg' });
                    formDataToSend.append('ProjectImage', file);
                }
            }

            await axios.put(
                `https://localhost:7086/api/v1/Project/UpdateProject/${editFormData.projectID}`,
                formDataToSend,
                {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('userToken')}`,
                        'Content-Type': 'multipart/form-data'
                    }
                }
            );
            setUpdatingProject(false);
            toast.success('Project updated successfully', { duration: 2000 });
            setShowEditModal(false);
            refetch();
        } catch (error) {
            setUpdatingProject(false);
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

    // Filter projects based on all filter criteria
    const filteredProjects = projects?.filter(project => {
        const matchesGlobal =
            filters.global === '' ||
            project.projectDescAr.includes(filters.global) ||
            project.projectDescEn.toLowerCase().includes(filters.global.toLowerCase()) ||
            project.locationNameAR.includes(filters.global) ||
            project.developerNameAR.includes(filters.global);

        const matchesArabic = filters.arabic === '' ||
            project.projectDescAr.includes(filters.arabic);

        const matchesEnglish = filters.english === '' ||
            project.projectDescEn.toLowerCase().includes(filters.english.toLowerCase());

        const matchesLocation = filters.location === '' ||
            project.locationId.toString() === filters.location;

        const matchesDeveloper = filters.developer === '' ||
            project.developerId.toString() === filters.developer;

        const matchesHotDeal = filters.hotDeal === '' ||
            (filters.hotDeal === 'hot' && project.flag) ||
            (filters.hotDeal === 'normal' && !project.flag);

        return matchesGlobal && matchesArabic && matchesEnglish && matchesLocation &&
            matchesDeveloper && matchesHotDeal;
    }) || [];

    // Pagination logic
    const totalPages = Math.ceil(filteredProjects.length / rowsPerPage);
    const paginatedProjects = filteredProjects.slice(
        (currentPage - 1) * rowsPerPage,
        currentPage * rowsPerPage
    );

    const renderPagination = () => {
        if (totalPages <= 1) return null;

        return (
            <div className="flex justify-between items-center mt-4 px-4 pb-1">
                <div className='text-xs'>
                    Showing {((currentPage - 1) * rowsPerPage + 1)}-{Math.min(currentPage * rowsPerPage, filteredProjects.length)} of {filteredProjects.length} entries
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

    // Check if current user has permission to manage projects
    const canManageProjects = true;

    // Preview modal
    const PreviewModal = ({ project, onClose }) => {
        if (!project) return null;

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
                            <h2 className="text-2xl font-bold text-gray-800">Project Preview</h2>
                            <button
                                onClick={onClose}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                <XCircle size={24} />
                            </button>
                        </div>

                        <div className="space-y-6">
                            {/* Project Image */}
                            {project.projectImagePath && (
                                <div className="mb-6">
                                    <img
                                        src={`https://localhost:7086${project.projectImagePath}`}
                                        alt={project.projectDescEn}
                                        className="w-full h-64 object-cover rounded-lg"
                                    />
                                </div>
                            )}

                            {/* Project Details */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                                        <FaGlobeAsia />
                                        Arabic Description
                                    </h3>
                                    <p className="text-right font-arabic text-xl">{project.projectDescAr}</p>
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                                        <FaGlobeAmericas />
                                        English Description
                                    </h3>
                                    <p className="text-lg">{project.projectDescEn}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                                        <FaCity />
                                        Location
                                    </h3>
                                    <div className="space-y-1">
                                        <p className="text-right font-arabic">{project.locationNameAR}</p>
                                        <p className="text-gray-600">{project.locationNameEN}</p>
                                    </div>
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                                        <FaBuilding />
                                        Developer
                                    </h3>
                                    <div className="space-y-1">
                                        <p className="text-right font-arabic">{project.developerNameAR}</p>
                                        <p className="text-gray-600">{project.developerNameEN}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Additional Details */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <div className="flex items-center gap-2 mb-2">
                                        <FaFire className={project.flag ? "text-red-500" : "text-gray-400"} />
                                        <span className="font-medium">Hot Deal</span>
                                    </div>
                                    <p className={project.flag ? "text-green-600 font-semibold" : "text-gray-600"}>
                                        {project.flag ? "Yes" : "No"}
                                    </p>
                                </div>

                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <div className="flex items-center gap-2 mb-2">
                                        <FaCalendarAlt className="text-blue-500" />
                                        <span className="font-medium">Installment Period</span>
                                    </div>
                                    <p className="text-gray-800 font-semibold">
                                        {project.installmentPeriod} years
                                    </p>
                                </div>

                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <div className="flex items-center gap-2 mb-2">
                                        <FaMoneyBillWave className="text-green-500" />
                                        <span className="font-medium">Down Payment</span>
                                    </div>
                                    <p className="text-gray-800 font-semibold">
                                        {project.downPayment ? `$${project.downPayment.toLocaleString()}` : 'Not specified'}
                                    </p>
                                </div>
                            </div>

                            {/* Google Maps Link */}
                            {project.actualLocation && (
                                <div className="bg-blue-50 p-4 rounded-lg">
                                    <div className="flex items-center gap-2 mb-2">
                                        <FaMapMarkerAlt className="text-red-500" />
                                        <span className="font-medium">Actual Location</span>
                                    </div>
                                    <a
                                        href={project.actualLocation}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-600 hover:text-blue-800 flex items-center gap-2"
                                    >
                                        <FaLink />
                                        View on Google Maps
                                    </a>
                                </div>
                            )}
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

    // Handle preview
    const handlePreview = (project) => {
        setPreviewProject(project);
        setShowPreviewModal(true);
    };

    return (
        <div className="shadow-2xl rounded-2xl overflow-hidden bg-white">
            {/* Global Search and Add Button */}
            <div className="p-4 border-b flex justify-between items-center gap-4">
                <input
                    type="text"
                    value={filters.global}
                    onChange={(e) => handleFilterChange('global', e.target.value)}
                    placeholder="Search projects..."
                    className="px-3 py-2 rounded-xl shadow-sm focus:outline-2 focus:outline-primary w-full border border-primary transition-all"
                />
                {canManageProjects && (
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="bg-primary hover:bg-darkBlue transition-all text-white px-3 py-2 rounded-xl shadow-sm min-w-max flex items-center gap-2"
                    >
                        <FaPlus size={18} />
                        <span>Add Project</span>
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
                                Image
                            </th>
                            <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                <div className="flex items-center gap-2">
                                    <FaCity />
                                    <select
                                        value={filters.location}
                                        onChange={(e) => handleFilterChange('location', e.target.value)}
                                        className="text-xs p-1 border rounded w-full"
                                    >
                                        <option value="">All Locations</option>
                                        {locations.map(loc => (
                                            <option key={loc.locationID} value={loc.locationID}>
                                                {loc.locationDescEN}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </th>
                            <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                <div className="flex items-center gap-2">
                                    <FaBuilding />
                                    <select
                                        value={filters.developer}
                                        onChange={(e) => handleFilterChange('developer', e.target.value)}
                                        className="text-xs p-1 border rounded w-full"
                                    >
                                        <option value="">All Developers</option>
                                        {developers.map(dev => (
                                            <option key={dev.developerID} value={dev.developerID}>
                                                {dev.developerDescEN}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </th>
                            <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                <div className="flex items-center gap-2">
                                    <FaFire />
                                    <select
                                        value={filters.hotDeal}
                                        onChange={(e) => handleFilterChange('hotDeal', e.target.value)}
                                        className="text-xs p-1 border rounded w-full"
                                    >
                                        <option value="">All</option>
                                        <option value="hot">Hot Deals</option>
                                        <option value="normal">Normal</option>
                                    </select>
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
                                <td colSpan="8" className="px-3 py-4 text-center">
                                    <div className="flex justify-center items-center gap-2">
                                        <FaSpinner className="animate-spin" size={18} />
                                        Loading projects...
                                    </div>
                                </td>
                            </tr>
                        ) : paginatedProjects.length === 0 ? (
                            <tr>
                                <td colSpan="8" className="px-3 py-4 text-center">
                                    No projects found
                                </td>
                            </tr>
                        ) : (
                            paginatedProjects.map((project) => (
                                <tr key={project.projectID} className="hover:bg-gray-50">
                                    <td className="px-3 py-4 whitespace-nowrap">
                                        <div className="font-medium text-gray-900">#{project.projectID}</div>
                                    </td>
                                    <td className="px-3 py-4">
                                        <div className="font-medium">{project.projectDescEn}</div>
                                    </td>
                                    <td className="px-3 py-4">
                                        <div className="text-right font-arabic">{project.projectDescAr}</div>
                                    </td>
                                    <td className="px-3 py-4 whitespace-nowrap">
                                        {project.projectImagePath ? (
                                            <img
                                                src={`https://localhost:7086${project.projectImagePath}`}
                                                alt={project.projectDescEn}
                                                className="h-12 w-12 object-cover rounded-md"
                                            />
                                        ) : (
                                            <div className="h-12 w-12 bg-gray-200 rounded-md flex items-center justify-center">
                                                <FaImage className="text-gray-400" />
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-3 py-4">
                                        <div className="space-y-1">
                                            <div className="text-right font-arabic text-sm">{project.locationNameAR}</div>
                                            <div className="text-gray-600 text-xs">{project.locationNameEN}</div>
                                        </div>
                                    </td>
                                    <td className="px-3 py-4">
                                        <div className="space-y-1">
                                            <div className="text-right font-arabic text-sm">{project.developerNameAR}</div>
                                            <div className="text-gray-600 text-xs">{project.developerNameEN}</div>
                                        </div>
                                    </td>
                                    <td className="px-3 py-4 whitespace-nowrap">
                                        {project.flag ? (
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                                <FaFire className="mr-1" />
                                                Hot Deal
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                                Normal
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-3 py-4 whitespace-nowrap">
                                        <div className="flex items-center gap-2">
                                            {canManageProjects && (
                                                <>
                                                    <button
                                                        className="text-blue-500 hover:text-blue-700 p-1"
                                                        onClick={() => prepareEditForm(project)}
                                                    >
                                                        <FaEdit size={18} />
                                                    </button>
                                                    <button
                                                        className="text-red-500 hover:text-red-700 p-1"
                                                        onClick={() => handleDeleteClick(project.projectID)}
                                                        disabled={deletingProjectId === project.projectID}
                                                    >
                                                        {deletingProjectId === project.projectID ? (
                                                            <FaSpinner className="animate-spin" size={18} />
                                                        ) : (
                                                            <FaTrashAlt size={18} />
                                                        )}
                                                    </button>
                                                </>
                                            )}
                                            <button
                                                className="text-green-500 hover:text-green-700 p-1"
                                                onClick={() => handlePreview(project)}
                                                title="Preview Project"
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

            {/* Add Project Modal */}
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
                            <h2 className="text-xl font-bold mb-4">Add New Project</h2>
                            <form onSubmit={handleAddProject}>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            <div className="flex items-center gap-2">
                                                <FaGlobeAsia />
                                                <span>Arabic Description *</span>
                                            </div>
                                        </label>
                                        <input
                                            type="text"
                                            name="ProjectDescAr"
                                            value={formData.ProjectDescAr}
                                            onChange={handleFormChange}
                                            className="w-full px-3 py-2 border rounded-md text-right font-arabic"
                                            required
                                            placeholder="أدخل الوصف باللغة العربية"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            <div className="flex items-center gap-2">
                                                <FaGlobeAmericas />
                                                <span>English Description *</span>
                                            </div>
                                        </label>
                                        <input
                                            type="text"
                                            name="ProjectDescEn"
                                            value={formData.ProjectDescEn}
                                            onChange={handleFormChange}
                                            className="w-full px-3 py-2 border rounded-md"
                                            required
                                            placeholder="Enter description in English"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            <div className="flex items-center gap-2">
                                                <FaCity />
                                                <span>Location *</span>
                                            </div>
                                        </label>
                                        <select
                                            name="LocationId"
                                            value={formData.LocationId}
                                            onChange={handleFormChange}
                                            className="w-full px-3 py-2 border rounded-md"
                                            required
                                        >
                                            <option value="">Select Location</option>
                                            {locations.map(location => (
                                                <option key={location.locationID} value={location.locationID}>
                                                    {location.locationDescEN} ({location.locationDescAR})
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            <div className="flex items-center gap-2">
                                                <FaBuilding />
                                                <span>Developer *</span>
                                            </div>
                                        </label>
                                        <select
                                            name="DeveloperId"
                                            value={formData.DeveloperId}
                                            onChange={handleFormChange}
                                            className="w-full px-3 py-2 border rounded-md"
                                            required
                                        >
                                            <option value="">Select Developer</option>
                                            {developers.map(developer => (
                                                <option key={developer.developerID} value={developer.developerID}>
                                                    {developer.developerDescEN} ({developer.developerDescAR})
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        <div className="flex items-center gap-2">
                                            <FaImage />
                                            <span>Project Image *</span>
                                        </div>
                                    </label>
                                    {formData.ProjectImage ? (
                                        <div className="relative mb-4">
                                            <img
                                                src={URL.createObjectURL(formData.ProjectImage)}
                                                alt="Preview"
                                                className="h-48 w-full object-cover rounded-lg"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setFormData(prev => ({ ...prev, ProjectImage: null }))}
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
                                                id="ProjectImage"
                                                name="ProjectImage"
                                                type="file"
                                                className="hidden"
                                                onChange={handleFormChange}
                                                accept="image/*"
                                                required
                                            />
                                        </label>
                                    )}
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            <div className="flex items-center gap-2">
                                                <FaCalendarAlt />
                                                <span>Installment Period (Years) *</span>
                                            </div>
                                        </label>
                                        <input
                                            type="number"
                                            name="InstallmentPeriod"
                                            value={formData.InstallmentPeriod}
                                            onChange={handleFormChange}
                                            className="w-full px-3 py-2 border rounded-md"
                                            required
                                            min="1"
                                            placeholder="e.g., 10"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            <div className="flex items-center gap-2">
                                                <FaMoneyBillWave />
                                                <span>Down Payment ($)</span>
                                            </div>
                                        </label>
                                        <input
                                            type="number"
                                            name="DownPayment"
                                            value={formData.DownPayment}
                                            onChange={handleFormChange}
                                            className="w-full px-3 py-2 border rounded-md"
                                            min="0"
                                            step="0.01"
                                            placeholder="e.g., 50000"
                                        />
                                    </div>
                                </div>

                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        <div className="flex items-center gap-2">
                                            <FaMapMarkerAlt />
                                            <span>Google Maps Link</span>
                                        </div>
                                    </label>
                                    <input
                                        type="url"
                                        name="ActualLocation"
                                        value={formData.ActualLocation}
                                        onChange={handleFormChange}
                                        className="w-full px-3 py-2 border rounded-md"
                                        placeholder="https://maps.app.goo.gl/..."
                                    />
                                </div>

                                <div className="mb-6">
                                    <div className="flex items-center">
                                        <input
                                            type="checkbox"
                                            id="Flag"
                                            name="Flag"
                                            checked={formData.Flag}
                                            onChange={handleFormChange}
                                            className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                                        />
                                        <label htmlFor="Flag" className="ml-2 text-sm text-gray-700 flex items-center gap-2">
                                            <FaFire className="text-red-500" />
                                            Mark as Hot Deal
                                        </label>
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
                                        disabled={updatingProject || !formData.ProjectImage}
                                    >
                                        {updatingProject ? (
                                            <>
                                                <FaSpinner className="animate-spin" size={18} />
                                                <span>Adding...</span>
                                            </>
                                        ) : (
                                            <>
                                                <FaPlus size={18} />
                                                <span>Add Project</span>
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </motion.div>
                </motion.div>
            )}

            {/* Edit Project Modal */}
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
                            <h2 className="text-xl font-bold mb-4">Edit Project</h2>
                            <form onSubmit={handleUpdateProject}>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            <div className="flex items-center gap-2">
                                                <FaGlobeAsia />
                                                <span>Arabic Description *</span>
                                            </div>
                                        </label>
                                        <input
                                            type="text"
                                            name="ProjectDescAr"
                                            value={editFormData.ProjectDescAr}
                                            onChange={handleEditFormChange}
                                            className="w-full px-3 py-2 border rounded-md text-right font-arabic"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            <div className="flex items-center gap-2">
                                                <FaGlobeAmericas />
                                                <span>English Description *</span>
                                            </div>
                                        </label>
                                        <input
                                            type="text"
                                            name="ProjectDescEn"
                                            value={editFormData.ProjectDescEn}
                                            onChange={handleEditFormChange}
                                            className="w-full px-3 py-2 border rounded-md"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            <div className="flex items-center gap-2">
                                                <FaCity />
                                                <span>Location *</span>
                                            </div>
                                        </label>
                                        <select
                                            name="LocationId"
                                            value={editFormData.LocationId}
                                            onChange={handleEditFormChange}
                                            className="w-full px-3 py-2 border rounded-md"
                                            required
                                        >
                                            <option value="">Select Location</option>
                                            {locations.map(location => (
                                                <option key={location.locationID} value={location.locationID}>
                                                    {location.locationDescEN} ({location.locationDescAR})
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            <div className="flex items-center gap-2">
                                                <FaBuilding />
                                                <span>Developer *</span>
                                            </div>
                                        </label>
                                        <select
                                            name="DeveloperId"
                                            value={editFormData.DeveloperId}
                                            onChange={handleEditFormChange}
                                            className="w-full px-3 py-2 border rounded-md"
                                            required
                                        >
                                            <option value="">Select Developer</option>
                                            {developers.map(developer => (
                                                <option key={developer.developerID} value={developer.developerID}>
                                                    {developer.developerDescEN} ({developer.developerDescAR})
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        <div className="flex items-center gap-2">
                                            <FaImage />
                                            <span>Project Image</span>
                                        </div>
                                    </label>
                                    <div className="mb-2">
                                        <p className="text-sm text-gray-600">
                                            {editFormData.ProjectImage ?
                                                "New image selected. It will be uploaded." :
                                                "Existing image will be kept. You can upload a new one if needed."}
                                        </p>
                                    </div>
                                    {editFormData.ProjectImage ? (
                                        <div className="relative mb-4">
                                            <img
                                                src={URL.createObjectURL(editFormData.ProjectImage)}
                                                alt="New Preview"
                                                className="h-48 w-full object-cover rounded-lg"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setEditFormData(prev => ({ ...prev, ProjectImage: null }))}
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
                                                className="h-48 w-full object-cover rounded-lg opacity-50"
                                            />
                                            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40 rounded-lg">
                                                <p className="text-white font-medium">Existing image will be kept</p>
                                            </div>
                                        </div>
                                    ) : null}

                                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 mt-4">
                                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                            <FaImage className="w-8 h-8 mb-3 text-gray-400" />
                                            <p className="mb-2 text-sm text-gray-500">
                                                <span className="font-semibold">Click to upload new image</span> (optional)
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                If not provided, existing image will be kept
                                            </p>
                                        </div>
                                        <input
                                            id="edit_ProjectImage"
                                            name="ProjectImage"
                                            type="file"
                                            className="hidden"
                                            onChange={handleEditFormChange}
                                            accept="image/*"
                                        />
                                    </label>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            <div className="flex items-center gap-2">
                                                <FaCalendarAlt />
                                                <span>Installment Period (Years) *</span>
                                            </div>
                                        </label>
                                        <input
                                            type="number"
                                            name="InstallmentPeriod"
                                            value={editFormData.InstallmentPeriod}
                                            onChange={handleEditFormChange}
                                            className="w-full px-3 py-2 border rounded-md"
                                            required
                                            min="1"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            <div className="flex items-center gap-2">
                                                <FaMoneyBillWave />
                                                <span>Down Payment ($)</span>
                                            </div>
                                        </label>
                                        <input
                                            type="number"
                                            name="DownPayment"
                                            value={editFormData.DownPayment}
                                            onChange={handleEditFormChange}
                                            className="w-full px-3 py-2 border rounded-md"
                                            min="0"
                                            step="0.01"
                                            placeholder="e.g., 50000"
                                        />
                                    </div>
                                </div>

                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        <div className="flex items-center gap-2">
                                            <FaMapMarkerAlt />
                                            <span>Google Maps Link</span>
                                        </div>
                                    </label>
                                    <input
                                        type="url"
                                        name="ActualLocation"
                                        value={editFormData.ActualLocation}
                                        onChange={handleEditFormChange}
                                        className="w-full px-3 py-2 border rounded-md"
                                        placeholder="https://maps.app.goo.gl/..."
                                    />
                                </div>

                                <div className="mb-6">
                                    <div className="flex items-center">
                                        <input
                                            type="checkbox"
                                            id="edit_Flag"
                                            name="Flag"
                                            checked={editFormData.Flag}
                                            onChange={handleEditFormChange}
                                            className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                                        />
                                        <label htmlFor="edit_Flag" className="ml-2 text-sm text-gray-700 flex items-center gap-2">
                                            <FaFire className="text-red-500" />
                                            Mark as Hot Deal
                                        </label>
                                    </div>
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
                                        disabled={updatingProject}
                                    >
                                        {updatingProject ? (
                                            <>
                                                <FaSpinner className="animate-spin" size={18} />
                                                <span>Updating...</span>
                                            </>
                                        ) : (
                                            <>
                                                <FaCheck size={18} />
                                                <span>Update Project</span>
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
                                    <h3 className="text-lg font-medium text-gray-900">Delete Project</h3>
                                    <div className="mt-2">
                                        <p className="text-sm text-gray-500">
                                            Are you sure you want to delete this project? This action cannot be undone.
                                        </p>
                                        {selectedProject && (
                                            <div className="mt-3 p-3 bg-gray-50 rounded">
                                                <p className="text-sm font-medium text-gray-700">Project Details:</p>
                                                <p className="text-sm text-gray-600 mt-1">
                                                    <span className="font-arabic">{selectedProject.projectDescAr}</span>
                                                    <span className="mx-2">•</span>
                                                    <span>{selectedProject.projectDescEn}</span>
                                                </p>
                                                <p className="text-sm text-gray-600 mt-1">
                                                    Location: {selectedProject.locationNameEN}
                                                </p>
                                                <p className="text-sm text-gray-600 mt-1">
                                                    Developer: {selectedProject.developerNameEN}
                                                </p>
                                                <p className="text-sm text-gray-600 mt-1">
                                                    Down Payment: ${selectedProject.downPayment ? selectedProject.downPayment.toLocaleString() : '0'}
                                                </p>
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
                    project={previewProject}
                    onClose={() => {
                        setShowPreviewModal(false);
                        setPreviewProject(null);
                    }}
                />
            )}
        </div>
    );
}