import React, { useContext, useEffect, useState } from 'react'
import logo from '../../assets/images/Logo.png'
import { NavLink, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import axios from 'axios'
import { SidebarContext } from '../../Contexts/SidebarContext'
import { GoSidebarExpand } from 'react-icons/go'
import { CiLogout } from 'react-icons/ci'
import { useQuery } from '@tanstack/react-query'
import { IoConstructOutline } from 'react-icons/io5';
import { RiAdminLine } from "react-icons/ri";
import { BsPostcard } from "react-icons/bs";
import { CgWorkAlt } from "react-icons/cg";
import { GrUserWorker } from "react-icons/gr";
import { VscFeedback } from "react-icons/vsc";
import { ImProfile } from "react-icons/im";
import { BiCategoryAlt } from "react-icons/bi";
import { BsBuildings } from "react-icons/bs";

export default function Sidebar() {
    const { sidebarOpen, setSidebarOpen } = useContext(SidebarContext)
    const [loggingOut, setloggingOut] = useState(false)

    const navigate = useNavigate()

    async function handleLogout() {
        setloggingOut(true)
        try {
            localStorage.removeItem('userToken')
            navigate('/login')
            toast.success('logged Out Successfully', { duration: 2000 })
            setloggingOut(false)
        } catch (error) {
            if (error.status == 401) {
                localStorage.removeItem('userToken')
                navigate('/login')

            }
            setloggingOut(false)
            toast.error(error.response?.data?.message || 'something went wrong', { duration: 3000 });
            localStorage.removeItem('userToken')
            navigate('/login')
        }
    }

    const toggleSidebar = () => setSidebarOpen(!sidebarOpen)




    const sidebarPages = [
        {
            title: 'Admins',
            path: '/admins',
            icon: <RiAdminLine />,
        },
        {
            title: 'Categories',
            path: '/categories',
            icon: <RiAdminLine />,
        },
        {
            title: 'Locations',
            path: '/locations',
            icon: <RiAdminLine />,
        },
        {
            title: 'Developers',
            path: '/developers',
            icon: <RiAdminLine />,
        },
        {
            title: 'Finishings',
            path: '/finishings',
            icon: <RiAdminLine />,
        },
        {
            title: 'Projects',
            path: '/projects',
            icon: <RiAdminLine />,
        },
        {
            title: 'Units',
            path: '/units',
            icon: <RiAdminLine />,
        },
        {
            title: 'Blogs',
            path: '/blogs',
            icon: <BsPostcard />,
        },

    ]
    return <>
        <div className={`h-full bg-tramsparent p-5 fixed w-56 left-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-all duration-500 z-50`}>
            <div className={`absolute z-50 ${sidebarOpen ? 'top-5 right-5 -translate-x-1/2 translate-y-1/2 text-gray-400' : 'top-2 -right-2 translate-x-full p-1.5 flex justify-center items-center bg-white text-gray-700 bg-opacity-90 aspect-square rounded-full cursor-pointer'} transition-all duration-500`}>
                <button onClick={toggleSidebar} ><GoSidebarExpand className='text-2xl' /></button>
            </div>
            <div className="h-full bg-primary rounded-2xl p-5 pt-10 flex flex-col justify-between overflow-y-auto shadow-xl">
                <div className="">
                    <div className="flex justify-center items-center overflow-hidden mb-2">
                        {/* <img src={logo} alt="Logo" className="w-4/5" /> */}
                        <h1 className='text-white text-2xl font-bold' >NeoLand</h1>
                    </div>
                    <div className="flex flex-col gap-1 text-gray-400 text-base">
                        {sidebarPages.map((p, i) => (
                            <>
                                <NavLink key={p.name} className="px-4 py-2 rounded-xl flex items-center gap-2" to={p.path} ><div className="">{p.icon} </div>{p.title}</NavLink>
                            </>
                        ))}
                    </div>
                </div>
                <div className="flex flex-col">
                    <button onClick={handleLogout} disabled={loggingOut} className='bg-gray-400 flex justify-center items-center text-white p-2 rounded-xl mb-2 gap-2 disabled:cursor-not-allowed disabled:opacity-50 capitalize'>Logout <CiLogout className='text-2xl font-extrabold' /></button>
                    <div className="text-[10px] text-gray-400 text-center">
                        By <a href="https://www.linkedin.com/in/youssefshafek/" target='_blank' className='text-gray-200'>Youssef Shafek</a>
                    </div>
                </div>
            </div>
        </div>
    </>
}
