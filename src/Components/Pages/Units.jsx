import { useQuery } from '@tanstack/react-query'
import axios from 'axios';
import React, { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import UnitsDataTable from '../DataTables/UnitsDataTable';

export default function Units() {
    const navigate = useNavigate();

    const { data: locations, isLoading: locationsLoading } = useQuery({
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
    })

    const { data: projects, isLoading: projectsLoading } = useQuery({
        queryKey: ['projects'],
        queryFn: () => {
            return axios.get(
                `https://localhost:7086/api/v1/Project/GetAllProjects`,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('userToken')}`
                    }
                }
            );
        },
    })

    const { data: categories, isLoading: categoriesLoading } = useQuery({
        queryKey: ['categories'],
        queryFn: () => {
            return axios.get(
                `https://localhost:7086/api/v1/Category/GetAllCategories`,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('userToken')}`
                    }
                }
            );
        },
    })

    const { data: finishings, isLoading: finishingsLoading } = useQuery({
        queryKey: ['finishings'],
        queryFn: () => {
            return axios.get(
                `https://localhost:7086/api/v1/Finishing/GetAllFinishings`,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('userToken')}`
                    }
                }
            );
        },
    })

    const { data: units, isLoading, refetch, isError, error } = useQuery({
        queryKey: ['units'],
        queryFn: () => {
            return axios.get(
                `https://localhost:7086/api/v1/Unit/GetAllUnits`,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('userToken')}`
                    }
                }
            );
        },
    })

    useEffect(() => {
        if (isError) {
            if (error.response?.status == 401) {
                localStorage.removeItem('userToken')
                navigate('/login')
            }
            if (error.response?.status == 403) {
                toast.error('You are not authorized to view this page')
                navigate('/home')
            }
        }
    }, [isError])

    return (
        <div className="p-4">

            <h1 className="text-3xl font-bold text-gray-800 mb-8">Units</h1>
            <UnitsDataTable
                units={units?.data || []}
                locations={locations?.data || []}
                projects={projects?.data || []}
                categories={categories?.data || []}
                finishings={finishings?.data || []}
                loading={isLoading}
                refetch={refetch}
            />
        </div>
    )
}