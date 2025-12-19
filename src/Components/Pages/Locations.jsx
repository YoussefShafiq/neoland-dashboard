import { useQuery } from '@tanstack/react-query'
import axios from 'axios';
import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom';
import LocationsDataTable from '../DataTables/LocationsDataTable';
import toast from 'react-hot-toast';

export default function Locations () {
    const navigate = useNavigate();

    function getLocationsData() {
        return axios.get(
            `https://localhost:7086/api/v1/Location/GetAllLocations`,
            {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('userToken')}`
                }
            }
        );
    }

    const { data: locations, isLoading, refetch, error, isError } = useQuery({
        queryKey: ['locations'],
        queryFn: getLocationsData,
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
            <h1 className="text-3xl font-bold text-gray-800 mb-8">Locations</h1>
            <LocationsDataTable
                locations={locations?.data || []}
                loading={isLoading}
                refetch={refetch}
            />
        </div>
    )
}