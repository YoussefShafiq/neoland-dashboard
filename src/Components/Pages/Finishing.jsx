import { useQuery } from '@tanstack/react-query'
import axios from 'axios';
import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom';
import FinishingsDataTable from '../DataTables/FinishingsDataTable';
import toast from 'react-hot-toast';

export default function Finishings () {
    const navigate = useNavigate();

    function getFinishingsData() {
        return axios.get(
            `https://localhost:7086/api/v1/Finishing/GetAllFinishings`,
            {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('userToken')}`
                }
            }
        );
    }

    const { data: finishings, isLoading, refetch, error, isError } = useQuery({
        queryKey: ['finishings'],
        queryFn: getFinishingsData,
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
            <h1 className="text-3xl font-bold text-gray-800 mb-8">Finishings</h1>
            <FinishingsDataTable
                finishings={finishings?.data || []}
                loading={isLoading}
                refetch={refetch}
            />
        </div>
    )
}