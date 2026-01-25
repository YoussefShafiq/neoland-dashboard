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
    FaHome,
    FaCalendarAlt,
    FaMoneyBillWave,
    FaBed,
    FaCheck,
    FaTimes,
    FaLayerGroup,
    FaPaintRoller
} from 'react-icons/fa';
import { XCircle } from 'lucide-react';

export default function UnitsDataTable({
    units,
    locations,
    projects,
    categories,
    finishings,
    loading,
    refetch
}) {
    const navigate = useNavigate();
    const [filters, setFilters] = useState({
        global: '',
        arabic: '',
        english: '',
        location: '',
        project: '',
        category: '',
        finishing: '',
        minPrice: '',
        maxPrice: '',
        bedrooms: ''
    });
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage] = useState(10);
    const [deletingUnitId, setDeletingUnitId] = useState(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedUnit, setSelectedUnit] = useState(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [unitToDelete, setUnitToDelete] = useState(null);
    const [updatingUnit, setUpdatingUnit] = useState(false);
    const [showPreviewModal, setShowPreviewModal] = useState(false);
    const [previewUnit, setPreviewUnit] = useState(null);

    // Form states
    const [formData, setFormData] = useState({
        ProjectId: '',
        CategoryId: '',
        UnitImage: null,
        LocationId: '',
        FinishingStatusId: '',
        UnitDescriptionAR: '',
        UnitDescriptionEN: '',
        NumberOfBedrooms: '',
        StartingPrice: '',
        DeliveryDate: ''
    });

    const [editFormData, setEditFormData] = useState({
        unitId: null,
        ProjectId: '',
        CategoryId: '',
        UnitImage: null,
        existingImage: null,
        LocationId: '',
        FinishingStatusId: '',
        UnitDescriptionAR: '',
        UnitDescriptionEN: '',
        NumberOfBedrooms: '',
        StartingPrice: '',
        DeliveryDate: ''
    });

    const handleFilterChange = (field, value) => {
        setFilters(prev => ({
            ...prev,
            [field]: value
        }));
        setCurrentPage(1);
    };

    const handleDeleteClick = (unitId) => {
        setUnitToDelete(unitId);
        setShowDeleteConfirm(true);
    };

    const handleConfirmDelete = async () => {
        if (!unitToDelete) return;

        setDeletingUnitId(unitToDelete);
        setShowDeleteConfirm(false);

        try {
            await axios.delete(
                `https://localhost:7086/api/v1/Unit/DeleteUnit/${unitToDelete}`,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('userToken')}`
                    }
                }
            );
            toast.success('Unit deleted successfully', { duration: 2000 });
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
            setDeletingUnitId(null);
            setUnitToDelete(null);
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
            ProjectId: '',
            CategoryId: '',
            UnitImage: null,
            LocationId: '',
            FinishingStatusId: '',
            UnitDescriptionAR: '',
            UnitDescriptionEN: '',
            NumberOfBedrooms: '',
            StartingPrice: '',
            DeliveryDate: ''
        });
    };

    const prepareEditForm = (unit) => {
        setSelectedUnit(unit);
        setEditFormData({
            unitId: unit.unitId,
            ProjectId: unit.projectId,
            CategoryId: unit.categoryId,
            UnitImage: null,
            existingImage: unit.unitImagePath,
            LocationId: unit.locationId,
            FinishingStatusId: unit.finishingStatusId,
            UnitDescriptionAR: unit.unitDescriptionAR,
            UnitDescriptionEN: unit.unitDescriptionEN,
            NumberOfBedrooms: unit.numberOfBedrooms,
            StartingPrice: unit.startingPrice,
            DeliveryDate: unit.deliveryDate
        });
        setShowEditModal(true);
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            maximumFractionDigits: 0
        }).format(price);
    };

    const handleAddUnit = async (e) => {
        e.preventDefault();

        // Validation
        if (!formData.ProjectId) {
            toast.error('Please select a project', { duration: 3000 });
            return;
        }

        if (!formData.CategoryId) {
            toast.error('Please select a category', { duration: 3000 });
            return;
        }

        if (!formData.UnitImage) {
            toast.error('Unit image is required', { duration: 3000 });
            return;
        }

        if (!formData.LocationId) {
            toast.error('Please select a location', { duration: 3000 });
            return;
        }

        if (!formData.FinishingStatusId) {
            toast.error('Please select a finishing status', { duration: 3000 });
            return;
        }

        if (!formData.UnitDescriptionAR.trim() || !formData.UnitDescriptionEN.trim()) {
            toast.error('Arabic and English descriptions are required', { duration: 3000 });
            return;
        }

        if (!formData.NumberOfBedrooms || formData.NumberOfBedrooms < 0) {
            toast.error('Please enter a valid number of bedrooms', { duration: 3000 });
            return;
        }

        if (!formData.StartingPrice || formData.StartingPrice <= 0) {
            toast.error('Please enter a valid starting price', { duration: 3000 });
            return;
        }

        if (!formData.DeliveryDate || formData.DeliveryDate < 0) {
            toast.error('Please enter a valid delivery date (years)', { duration: 3000 });
            return;
        }

        setUpdatingUnit(true);
        try {
            const formDataToSend = new FormData();
            formDataToSend.append('ProjectId', formData.ProjectId);
            formDataToSend.append('CategoryId', formData.CategoryId);
            formDataToSend.append('LocationId', formData.LocationId);
            formDataToSend.append('FinishingStatusId', formData.FinishingStatusId);
            formDataToSend.append('UnitDescriptionAR', formData.UnitDescriptionAR);
            formDataToSend.append('UnitDescriptionEN', formData.UnitDescriptionEN);
            formDataToSend.append('NumberOfBedrooms', formData.NumberOfBedrooms);
            formDataToSend.append('StartingPrice', formData.StartingPrice);
            formDataToSend.append('DeliveryDate', formData.DeliveryDate);

            if (formData.UnitImage) {
                formDataToSend.append('UnitImage', formData.UnitImage);
            }

            await axios.post(
                'https://localhost:7086/api/v1/Unit/CreateUnit',
                formDataToSend,
                {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('userToken')}`,
                        'Content-Type': 'multipart/form-data'
                    }
                }
            );
            setUpdatingUnit(false);
            toast.success('Unit added successfully', { duration: 2000 });
            setShowAddModal(false);
            resetForm();
            refetch();
        } catch (error) {
            setUpdatingUnit(false);
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

    const handleUpdateUnit = async (e) => {
        e.preventDefault();

        // Validation
        if (!editFormData.ProjectId) {
            toast.error('Please select a project', { duration: 3000 });
            return;
        }

        if (!editFormData.CategoryId) {
            toast.error('Please select a category', { duration: 3000 });
            return;
        }

        if (!editFormData.LocationId) {
            toast.error('Please select a location', { duration: 3000 });
            return;
        }

        if (!editFormData.FinishingStatusId) {
            toast.error('Please select a finishing status', { duration: 3000 });
            return;
        }

        if (!editFormData.UnitDescriptionAR.trim() || !editFormData.UnitDescriptionEN.trim()) {
            toast.error('Arabic and English descriptions are required', { duration: 3000 });
            return;
        }

        if (!editFormData.NumberOfBedrooms || editFormData.NumberOfBedrooms < 0) {
            toast.error('Please enter a valid number of bedrooms', { duration: 3000 });
            return;
        }

        if (!editFormData.StartingPrice || editFormData.StartingPrice <= 0) {
            toast.error('Please enter a valid starting price', { duration: 3000 });
            return;
        }

        if (!editFormData.DeliveryDate || editFormData.DeliveryDate < 0) {
            toast.error('Please enter a valid delivery date (years)', { duration: 3000 });
            return;
        }

        setUpdatingUnit(true);
        try {
            const formDataToSend = new FormData();
            formDataToSend.append('ProjectId', editFormData.ProjectId);
            formDataToSend.append('CategoryId', editFormData.CategoryId);
            formDataToSend.append('LocationId', editFormData.LocationId);
            formDataToSend.append('FinishingStatusId', editFormData.FinishingStatusId);
            formDataToSend.append('UnitDescriptionAR', editFormData.UnitDescriptionAR);
            formDataToSend.append('UnitDescriptionEN', editFormData.UnitDescriptionEN);
            formDataToSend.append('NumberOfBedrooms', editFormData.NumberOfBedrooms);
            formDataToSend.append('StartingPrice', editFormData.StartingPrice);
            formDataToSend.append('DeliveryDate', editFormData.DeliveryDate);

            // Always send an image - either new or existing
            if (editFormData.UnitImage) {
                formDataToSend.append('UnitImage', editFormData.UnitImage);
            } else if (editFormData.existingImage) {
                // Convert existing image URL to File object
                try {
                    const fullImageUrl = `https://localhost:7086${editFormData.existingImage}`;
                    const response = await fetch(fullImageUrl);
                    const blob = await response.blob();
                    const file = new File([blob], 'existing-image.jpg', { type: blob.type });
                    formDataToSend.append('UnitImage', file);
                } catch (error) {
                    console.error('Error converting existing image:', error);
                    // Create a placeholder file if conversion fails
                    const blob = new Blob([''], { type: 'image/jpeg' });
                    const file = new File([blob], 'placeholder.jpg', { type: 'image/jpeg' });
                    formDataToSend.append('UnitImage', file);
                }
            }

            await axios.put(
                `https://localhost:7086/api/v1/Unit/UpdateUnit/${editFormData.unitId}`,
                formDataToSend,
                {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('userToken')}`,
                        'Content-Type': 'multipart/form-data'
                    }
                }
            );
            setUpdatingUnit(false);
            toast.success('Unit updated successfully', { duration: 2000 });
            setShowEditModal(false);
            refetch();
        } catch (error) {
            setUpdatingUnit(false);
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

    // Filter units based on all filter criteria
    const filteredUnits = units?.filter(unit => {
        const matchesGlobal =
            filters.global === '' ||
            unit.unitDescriptionAR.includes(filters.global) ||
            unit.unitDescriptionEN.toLowerCase().includes(filters.global.toLowerCase()) ||
            unit.projectDescEN.toLowerCase().includes(filters.global.toLowerCase()) ||
            unit.categoryDescEN.toLowerCase().includes(filters.global.toLowerCase());

        const matchesArabic = filters.arabic === '' ||
            unit.unitDescriptionAR.includes(filters.arabic);

        const matchesEnglish = filters.english === '' ||
            unit.unitDescriptionEN.toLowerCase().includes(filters.english.toLowerCase());

        const matchesLocation = filters.location === '' ||
            unit.locationId.toString() === filters.location;

        const matchesProject = filters.project === '' ||
            unit.projectId.toString() === filters.project;

        const matchesCategory = filters.category === '' ||
            unit.categoryId.toString() === filters.category;

        const matchesFinishing = filters.finishing === '' ||
            unit.finishingStatusId.toString() === filters.finishing;

        const matchesMinPrice = filters.minPrice === '' ||
            unit.startingPrice >= parseFloat(filters.minPrice);

        const matchesMaxPrice = filters.maxPrice === '' ||
            unit.startingPrice <= parseFloat(filters.maxPrice);

        const matchesBedrooms = filters.bedrooms === '' ||
            unit.numberOfBedrooms.toString() === filters.bedrooms;

        return matchesGlobal && matchesArabic && matchesEnglish && matchesLocation &&
            matchesProject && matchesCategory && matchesFinishing &&
            matchesMinPrice && matchesMaxPrice && matchesBedrooms;
    }) || [];

    // Pagination logic
    const totalPages = Math.ceil(filteredUnits.length / rowsPerPage);
    const paginatedUnits = filteredUnits.slice(
        (currentPage - 1) * rowsPerPage,
        currentPage * rowsPerPage
    );

    const renderPagination = () => {
        if (totalPages <= 1) return null;

        return (
            <div className="flex justify-between items-center mt-4 px-4 pb-1">
                <div className='text-xs'>
                    Showing {((currentPage - 1) * rowsPerPage + 1)}-{Math.min(currentPage * rowsPerPage, filteredUnits.length)} of {filteredUnits.length} entries
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

    // Check if current user has permission to manage units
    const canManageUnits = true;

    // Preview modal
    const PreviewModal = ({ unit, onClose }) => {
        if (!unit) return null;

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
                            <h2 className="text-2xl font-bold text-gray-800">Unit Preview</h2>
                            <button
                                onClick={onClose}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                <XCircle size={24} />
                            </button>
                        </div>

                        <div className="space-y-6">
                            {/* Unit Image */}
                            {unit.unitImagePath && (
                                <div className="mb-6">
                                    <img
                                        src={`https://localhost:7086${unit.unitImagePath}`}
                                        alt={unit.unitDescriptionEN}
                                        className="w-full h-64 object-cover rounded-lg"
                                    />
                                </div>
                            )}

                            {/* Unit Details */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <h3 className="text-lg font-semibold mb-2">
                                        Arabic Description
                                    </h3>
                                    <p className="text-right font-arabic text-xl">{unit.unitDescriptionAR}</p>
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold mb-2">
                                        English Description
                                    </h3>
                                    <p className="text-lg">{unit.unitDescriptionEN}</p>
                                </div>
                            </div>

                            {/* Project & Location */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                                        <FaBuilding />
                                        Project
                                    </h3>
                                    <div className="space-y-1">
                                        <p className="text-right font-arabic">{unit.projectDescAR}</p>
                                        <p className="text-gray-600">{unit.projectDescEN}</p>
                                    </div>
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                                        <FaMapMarkerAlt />
                                        Location
                                    </h3>
                                    <div className="space-y-1">
                                        <p className="text-right font-arabic">{unit.locationDescAR}</p>
                                        <p className="text-gray-600">{unit.locationDescEN}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Category & Finishing */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                                        <FaHome />
                                        Category
                                    </h3>
                                    <div className="space-y-1">
                                        <p className="text-right font-arabic">{unit.categoryDescAR}</p>
                                        <p className="text-gray-600">{unit.categoryDescEN}</p>
                                    </div>
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                                        <FaPaintRoller />
                                        Finishing Status
                                    </h3>
                                    <div className="space-y-1">
                                        <p className="text-right font-arabic">{unit.finishingStatusDescAR}</p>
                                        <p className="text-gray-600">{unit.finishingStatusDescEN}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Specifications */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <div className="flex items-center gap-2 mb-2">
                                        <FaBed className="text-blue-500" />
                                        <span className="font-medium">Bedrooms</span>
                                    </div>
                                    <p className="text-gray-800 font-semibold text-xl">
                                        {unit.numberOfBedrooms}
                                    </p>
                                </div>

                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <div className="flex items-center gap-2 mb-2">
                                        <FaMoneyBillWave className="text-green-500" />
                                        <span className="font-medium">Starting Price</span>
                                    </div>
                                    <p className="text-gray-800 font-semibold text-xl">
                                        {formatPrice(unit.startingPrice)}
                                    </p>
                                </div>

                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <div className="flex items-center gap-2 mb-2">
                                        <FaCalendarAlt className="text-purple-500" />
                                        <span className="font-medium">Delivery Date</span>
                                    </div>
                                    <p className="text-gray-800 font-semibold text-xl">
                                        {unit.deliveryDate} years
                                    </p>
                                </div>
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

    // Handle preview
    const handlePreview = (unit) => {
        setPreviewUnit(unit);
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
                    placeholder="Search units..."
                    className="px-3 py-2 rounded-xl shadow-sm focus:outline-2 focus:outline-primary w-full border border-primary transition-all"
                />
                {canManageUnits && (
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="bg-primary hover:bg-darkBlue transition-all text-white px-3 py-2 rounded-xl shadow-sm min-w-max flex items-center gap-2"
                    >
                        <FaPlus size={18} />
                        <span>Add Unit</span>
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
                                Image
                            </th>
                            <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                <div className="flex items-center gap-2">
                                    <select
                                        value={filters.project}
                                        onChange={(e) => handleFilterChange('project', e.target.value)}
                                        className="text-xs p-1 border rounded w-full"
                                    >
                                        <option value="">All Projects</option>
                                        {projects.map(project => (
                                            <option key={project.projectID} value={project.projectID}>
                                                {project.projectDescEn}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </th>
                            <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                <div className="flex items-center gap-2">
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
                                    <select
                                        value={filters.category}
                                        onChange={(e) => handleFilterChange('category', e.target.value)}
                                        className="text-xs p-1 border rounded w-full"
                                    >
                                        <option value="">All Categories</option>
                                        {categories.map(category => (
                                            <option key={category.categoryID} value={category.categoryID}>
                                                {category.categoryDescEN}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </th>
                            <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                <div className="flex items-center gap-2">
                                    <select
                                        value={filters.location}
                                        onChange={(e) => handleFilterChange('location', e.target.value)}
                                        className="text-xs p-1 border rounded w-full"
                                    >
                                        <option value="">All Locations</option>
                                        {locations.map(location => (
                                            <option key={location.locationID} value={location.locationID}>
                                                {location.locationDescEN}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </th>
                            <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                <div className="flex items-center gap-2">
                                    <FaBed />
                                    <select
                                        value={filters.bedrooms}
                                        onChange={(e) => handleFilterChange('bedrooms', e.target.value)}
                                        className="text-xs p-1 border rounded w-full"
                                    >
                                        <option value="">All</option>
                                        {[1, 2, 3, 4, 5, 6, 7, 8].map(num => (
                                            <option key={num} value={num}>
                                                {num} {num === 1 ? 'Bedroom' : 'Bedrooms'}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </th>
                            <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                <div className="flex items-center gap-2">
                                    <div className="flex gap-1 w-full">
                                        <input
                                            type="number"
                                            placeholder="Min"
                                            value={filters.minPrice}
                                            onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                                            className="text-xs p-1 border rounded w-1/2"
                                        />
                                        <input
                                            type="number"
                                            placeholder="Max"
                                            value={filters.maxPrice}
                                            onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                                            className="text-xs p-1 border rounded w-1/2"
                                        />
                                    </div>
                                </div>
                            </th>
                            <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                <div className="flex items-center gap-2">
                                    <select
                                        value={filters.finishing}
                                        onChange={(e) => handleFilterChange('finishing', e.target.value)}
                                        className="text-xs p-1 border rounded w-full"
                                    >
                                        <option value="">All Finishings</option>
                                        {finishings.map(finishing => (
                                            <option key={finishing.finishingID} value={finishing.finishingID}>
                                                {finishing.finishingDescEN}
                                            </option>
                                        ))}
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
                                <td colSpan="10" className="px-3 py-4 text-center">
                                    <div className="flex justify-center items-center gap-2">
                                        <FaSpinner className="animate-spin" size={18} />
                                        Loading units...
                                    </div>
                                </td>
                            </tr>
                        ) : paginatedUnits.length === 0 ? (
                            <tr>
                                <td colSpan="10" className="px-3 py-4 text-center">
                                    No units found
                                </td>
                            </tr>
                        ) : (
                            paginatedUnits.map((unit) => (
                                <tr key={unit.unitId} className="hover:bg-gray-50">
                                    <td className="px-3 py-4 whitespace-nowrap">
                                        <div className="font-medium text-gray-900">#{unit.unitId}</div>
                                    </td>
                                    <td className="px-3 py-4 whitespace-nowrap">
                                        {unit.unitImagePath ? (
                                            <img
                                                src={`https://localhost:7086${unit.unitImagePath}`}
                                                alt={unit.unitDescriptionEN}
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
                                            <div className="font-medium">{unit.projectDescEN}</div>
                                            <div className="text-right font-arabic text-xs">{unit.projectDescAR}</div>
                                        </div>
                                    </td>
                                    <td className="px-3 py-4">
                                        <div className="space-y-1">
                                            <div className="font-medium">{unit.unitDescriptionEN}</div>
                                            <div className="text-right font-arabic text-xs">{unit.unitDescriptionAR}</div>
                                        </div>
                                    </td>
                                    <td className="px-3 py-4">
                                        <div className="space-y-1">
                                            <div className="font-medium">{unit.categoryDescEN}</div>
                                            <div className="text-right font-arabic text-xs">{unit.categoryDescAR}</div>
                                        </div>
                                    </td>
                                    <td className="px-3 py-4">
                                        <div className="space-y-1">
                                            <div className="font-medium">{unit.locationDescEN}</div>
                                            <div className="text-right font-arabic text-xs">{unit.locationDescAR}</div>
                                        </div>
                                    </td>
                                    <td className="px-3 py-4 whitespace-nowrap">
                                        <div className="flex items-center gap-1">
                                            <FaBed className="text-blue-500" />
                                            <span className="font-medium">{unit.numberOfBedrooms}</span>
                                        </div>
                                    </td>
                                    <td className="px-3 py-4 whitespace-nowrap">
                                        <div className="font-bold text-green-600">
                                            {formatPrice(unit.startingPrice)}
                                        </div>
                                    </td>
                                    <td className="px-3 py-4">
                                        <div className="space-y-1">
                                            <div className="font-medium">{unit.finishingStatusDescEN}</div>
                                            <div className="text-right font-arabic text-xs">{unit.finishingStatusDescAR}</div>
                                        </div>
                                    </td>
                                    <td className="px-3 py-4 whitespace-nowrap">
                                        <div className="flex items-center gap-2">
                                            {canManageUnits && (
                                                <>
                                                    <button
                                                        className="text-blue-500 hover:text-blue-700 p-1"
                                                        onClick={() => prepareEditForm(unit)}
                                                    >
                                                        <FaEdit size={18} />
                                                    </button>
                                                    <button
                                                        className="text-red-500 hover:text-red-700 p-1"
                                                        onClick={() => handleDeleteClick(unit.unitId)}
                                                        disabled={deletingUnitId === unit.unitId}
                                                    >
                                                        {deletingUnitId === unit.unitId ? (
                                                            <FaSpinner className="animate-spin" size={18} />
                                                        ) : (
                                                            <FaTrashAlt size={18} />
                                                        )}
                                                    </button>
                                                </>
                                            )}
                                            <button
                                                className="text-green-500 hover:text-green-700 p-1"
                                                onClick={() => handlePreview(unit)}
                                                title="Preview Unit"
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

            {/* Add Unit Modal */}
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
                            <h2 className="text-xl font-bold mb-4">Add New Unit</h2>
                            <form onSubmit={handleAddUnit}>
                                {/* Project and Category */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            <div className="flex items-center gap-2">
                                                <FaBuilding />
                                                <span>Project *</span>
                                            </div>
                                        </label>
                                        <select
                                            name="ProjectId"
                                            value={formData.ProjectId}
                                            onChange={handleFormChange}
                                            className="w-full px-3 py-2 border rounded-md"
                                            required
                                        >
                                            <option value="">Select Project</option>
                                            {projects.map(project => (
                                                <option key={project.projectID} value={project.projectID}>
                                                    {project.projectDescEN} - {project.locationNameEN}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            <div className="flex items-center gap-2">
                                                <FaHome />
                                                <span>Category *</span>
                                            </div>
                                        </label>
                                        <select
                                            name="CategoryId"
                                            value={formData.CategoryId}
                                            onChange={handleFormChange}
                                            className="w-full px-3 py-2 border rounded-md"
                                            required
                                        >
                                            <option value="">Select Category</option>
                                            {categories.map(category => (
                                                <option key={category.categoryID} value={category.categoryID}>
                                                    {category.categoryDescEN} ({category.categoryDescAR})
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                {/* Location and Finishing */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            <div className="flex items-center gap-2">
                                                <FaMapMarkerAlt />
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
                                                <FaPaintRoller />
                                                <span>Finishing Status *</span>
                                            </div>
                                        </label>
                                        <select
                                            name="FinishingStatusId"
                                            value={formData.FinishingStatusId}
                                            onChange={handleFormChange}
                                            className="w-full px-3 py-2 border rounded-md"
                                            required
                                        >
                                            <option value="">Select Finishing</option>
                                            {finishings.map(finishing => (
                                                <option key={finishing.finishingID} value={finishing.finishingID}>
                                                    {finishing.finishingDescEN} ({finishing.finishingDescAR})
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                {/* Descriptions */}
                                <div className="grid grid-cols-1 gap-6 mb-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            <span>Arabic Description *</span>
                                        </label>
                                        <input
                                            name="UnitDescriptionAR"
                                            value={formData.UnitDescriptionAR}
                                            onChange={handleFormChange}
                                            className="w-full px-3 py-2 border rounded-md text-right font-arabic"
                                            required
                                            placeholder="أدخل الوصف باللغة العربية"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            <span>English Description *</span>
                                        </label>
                                        <input
                                            name="UnitDescriptionEN"
                                            value={formData.UnitDescriptionEN}
                                            onChange={handleFormChange}
                                            className="w-full px-3 py-2 border rounded-md"
                                            required
                                            placeholder="Enter description in English"
                                        />
                                    </div>
                                </div>

                                {/* Image Upload */}
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        <div className="flex items-center gap-2">
                                            <FaImage />
                                            <span>Unit Image *</span>
                                        </div>
                                    </label>
                                    {formData.UnitImage ? (
                                        <div className="relative mb-4">
                                            <img
                                                src={URL.createObjectURL(formData.UnitImage)}
                                                alt="Preview"
                                                className="h-48 w-full object-cover rounded-lg"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setFormData(prev => ({ ...prev, UnitImage: null }))}
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
                                                id="UnitImage"
                                                name="UnitImage"
                                                type="file"
                                                className="hidden"
                                                onChange={handleFormChange}
                                                accept="image/*"
                                                required
                                            />
                                        </label>
                                    )}
                                </div>

                                {/* Specifications */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            <div className="flex items-center gap-2">
                                                <FaBed />
                                                <span>Number of Bedrooms *</span>
                                            </div>
                                        </label>
                                        <input
                                            type="number"
                                            name="NumberOfBedrooms"
                                            value={formData.NumberOfBedrooms}
                                            onChange={handleFormChange}
                                            className="w-full px-3 py-2 border rounded-md"
                                            required
                                            min="0"
                                            placeholder="e.g., 3"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            <div className="flex items-center gap-2">
                                                <FaMoneyBillWave />
                                                <span>Starting Price ($) *</span>
                                            </div>
                                        </label>
                                        <input
                                            type="number"
                                            name="StartingPrice"
                                            value={formData.StartingPrice}
                                            onChange={handleFormChange}
                                            className="w-full px-3 py-2 border rounded-md"
                                            required
                                            min="0"
                                            placeholder="e.g., 500000"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            <div className="flex items-center gap-2">
                                                <FaCalendarAlt />
                                                <span>Delivery Date (Years) *</span>
                                            </div>
                                        </label>
                                        <input
                                            type="number"
                                            name="DeliveryDate"
                                            value={formData.DeliveryDate}
                                            onChange={handleFormChange}
                                            className="w-full px-3 py-2 border rounded-md"
                                            required
                                            min="0"
                                            placeholder="e.g., 3"
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
                                        disabled={updatingUnit || !formData.UnitImage}
                                    >
                                        {updatingUnit ? (
                                            <>
                                                <FaSpinner className="animate-spin" size={18} />
                                                <span>Adding...</span>
                                            </>
                                        ) : (
                                            <>
                                                <FaPlus size={18} />
                                                <span>Add Unit</span>
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </motion.div>
                </motion.div>
            )}

            {/* Edit Unit Modal */}
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
                            <h2 className="text-xl font-bold mb-4">Edit Unit</h2>
                            <form onSubmit={handleUpdateUnit}>
                                {/* Project and Category */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            <div className="flex items-center gap-2">
                                                <FaBuilding />
                                                <span>Project *</span>
                                            </div>
                                        </label>
                                        <select
                                            name="ProjectId"
                                            value={editFormData.ProjectId}
                                            onChange={handleEditFormChange}
                                            className="w-full px-3 py-2 border rounded-md"
                                            required
                                        >
                                            <option value="">Select Project</option>
                                            {projects.map(project => (
                                                <option key={project.projectID} value={project.projectID}>
                                                    {project.projectDescEN} - {project.locationNameEN}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            <div className="flex items-center gap-2">
                                                <FaHome />
                                                <span>Category *</span>
                                            </div>
                                        </label>
                                        <select
                                            name="CategoryId"
                                            value={editFormData.CategoryId}
                                            onChange={handleEditFormChange}
                                            className="w-full px-3 py-2 border rounded-md"
                                            required
                                        >
                                            <option value="">Select Category</option>
                                            {categories.map(category => (
                                                <option key={category.categoryID} value={category.categoryID}>
                                                    {category.categoryDescEN} ({category.categoryDescAR})
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                {/* Location and Finishing */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            <div className="flex items-center gap-2">
                                                <FaMapMarkerAlt />
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
                                                <FaPaintRoller />
                                                <span>Finishing Status *</span>
                                            </div>
                                        </label>
                                        <select
                                            name="FinishingStatusId"
                                            value={editFormData.FinishingStatusId}
                                            onChange={handleEditFormChange}
                                            className="w-full px-3 py-2 border rounded-md"
                                            required
                                        >
                                            <option value="">Select Finishing</option>
                                            {finishings.map(finishing => (
                                                <option key={finishing.finishingID} value={finishing.finishingID}>
                                                    {finishing.finishingDescEN} ({finishing.finishingDescAR})
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                {/* Descriptions */}
                                <div className="grid grid-cols-1 gap-6 mb-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            <span>Arabic Description *</span>
                                        </label>
                                        <input
                                            name="UnitDescriptionAR"
                                            value={editFormData.UnitDescriptionAR}
                                            onChange={handleEditFormChange}
                                            className="w-full px-3 py-2 border rounded-md text-right font-arabic"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            <span>English Description *</span>
                                        </label>
                                        <input
                                            name="UnitDescriptionEN"
                                            value={editFormData.UnitDescriptionEN}
                                            onChange={handleEditFormChange}
                                            className="w-full px-3 py-2 border rounded-md"
                                            required
                                        />
                                    </div>
                                </div>

                                {/* Image Upload */}
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        <div className="flex items-center gap-2">
                                            <FaImage />
                                            <span>Unit Image</span>
                                        </div>
                                    </label>
                                    <div className="mb-2">
                                        <p className="text-sm text-gray-600">
                                            {editFormData.UnitImage ?
                                                "New image selected. It will be uploaded." :
                                                "Existing image will be kept. You can upload a new one if needed."}
                                        </p>
                                    </div>
                                    {editFormData.UnitImage ? (
                                        <div className="relative mb-4">
                                            <img
                                                src={URL.createObjectURL(editFormData.UnitImage)}
                                                alt="New Preview"
                                                className="h-48 w-full object-cover rounded-lg"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setEditFormData(prev => ({ ...prev, UnitImage: null }))}
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
                                            id="edit_UnitImage"
                                            name="UnitImage"
                                            type="file"
                                            className="hidden"
                                            onChange={handleEditFormChange}
                                            accept="image/*"
                                        />
                                    </label>
                                </div>

                                {/* Specifications */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            <div className="flex items-center gap-2">
                                                <FaBed />
                                                <span>Number of Bedrooms *</span>
                                            </div>
                                        </label>
                                        <input
                                            type="number"
                                            name="NumberOfBedrooms"
                                            value={editFormData.NumberOfBedrooms}
                                            onChange={handleEditFormChange}
                                            className="w-full px-3 py-2 border rounded-md"
                                            required
                                            min="0"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            <div className="flex items-center gap-2">
                                                <FaMoneyBillWave />
                                                <span>Starting Price ($) *</span>
                                            </div>
                                        </label>
                                        <input
                                            type="number"
                                            name="StartingPrice"
                                            value={editFormData.StartingPrice}
                                            onChange={handleEditFormChange}
                                            className="w-full px-3 py-2 border rounded-md"
                                            required
                                            min="0"
                                            step="1000"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            <div className="flex items-center gap-2">
                                                <FaCalendarAlt />
                                                <span>Delivery Date (Years) *</span>
                                            </div>
                                        </label>
                                        <input
                                            type="number"
                                            name="DeliveryDate"
                                            value={editFormData.DeliveryDate}
                                            onChange={handleEditFormChange}
                                            className="w-full px-3 py-2 border rounded-md"
                                            required
                                            min="0"
                                        />
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
                                        disabled={updatingUnit}
                                    >
                                        {updatingUnit ? (
                                            <>
                                                <FaSpinner className="animate-spin" size={18} />
                                                <span>Updating...</span>
                                            </>
                                        ) : (
                                            <>
                                                <FaCheck size={18} />
                                                <span>Update Unit</span>
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
                                    <h3 className="text-lg font-medium text-gray-900">Delete Unit</h3>
                                    <div className="mt-2">
                                        <p className="text-sm text-gray-500">
                                            Are you sure you want to delete this unit? This action cannot be undone.
                                        </p>
                                        {selectedUnit && (
                                            <div className="mt-3 p-3 bg-gray-50 rounded">
                                                <p className="text-sm font-medium text-gray-700">Unit Details:</p>
                                                <p className="text-sm text-gray-600 mt-1">
                                                    <span className="font-arabic">{selectedUnit.unitDescriptionAR}</span>
                                                    <span className="mx-2">•</span>
                                                    <span>{selectedUnit.unitDescriptionEN}</span>
                                                </p>
                                                <p className="text-sm text-gray-600 mt-1">
                                                    Project: {selectedUnit.projectDescEN}
                                                </p>
                                                <p className="text-sm text-gray-600 mt-1">
                                                    Category: {selectedUnit.categoryDescEN}
                                                </p>
                                                <p className="text-sm text-gray-600 mt-1">
                                                    Price: {formatPrice(selectedUnit.startingPrice)}
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
                    unit={previewUnit}
                    onClose={() => {
                        setShowPreviewModal(false);
                        setPreviewUnit(null);
                    }}
                />
            )}
        </div>
    );
}