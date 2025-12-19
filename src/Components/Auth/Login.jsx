import React, { useState } from 'react'
import logo from '../../assets/images/Logo.png'
import { object, string } from 'yup'
import { useFormik } from 'formik'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

export default function Login() {
    const navigate = useNavigate()
    const [loading, setloading] = useState(false)

    async function login(values) {
        setloading(true)
        try {
            let {data} = await axios.post('https://localhost:7086/api/v1/User/login', values)
            
            setloading(false)
            toast.success('logged in successfully', {
                duration: 2000,
            })
            localStorage.setItem('userToken', data.token)
            navigate('/')

        } catch (error) {
            console.log(error);
            
            toast.error(error?.response?.data?.message, {
                duration: 5000,
            })
            setloading(false)
        }
    }

    let validationSchema = object({
        userName: string().required('username is required'),
        userPassword: string().min(9, 'userPassword must be at least 9 length').required('userPassword is required')
    })

    let formik = useFormik({
        initialValues: {
            userName: '',
            userPassword: ''
        }, validationSchema, onSubmit: login
    })



    return <>
        <div className="h-screen w-screen bg-gradient-to-tl from-primary/70 to-white flex flex-col justify-center items-center">
            <div className="lg:w-1/3 w-full bg-primary text-white rounded-xl shadow-xl p-8 space-y-5
            ">
                {/* <img className="lg:w-1/3 w-1/2 m-auto" src={logo} alt="logo" /> */}
                <h1 className="text-3xl font-bold text-center">Login</h1>
                <form className='flex flex-col gap-5' onSubmit={formik.handleSubmit}>
                    <div className="relative z-0 w-full group mb-4">
                        <input type="text" name="userName" id="userName" onBlur={formik.handleBlur} onChange={formik.handleChange} className="block py-2.5 px-0 w-full text-sm text-white bg-transparent border-0 border-b-2 border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-darkTeal peer" placeholder=" " />
                        <label htmlFor="userName" className="peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto peer-focus:text-darkTeal peer-focus:dark:text-darkTeal peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">username</label>
                        {formik.errors.userName && formik.touched.userName &&
                            <div className=" text-sm text-red-800 rounded-lg bg-transparent dark:text-red-600 " role="alert">
                                {formik.errors.userName}
                            </div>
                        }
                    </div>
                    <div className="relative z-0 w-full group">
                        <input type="password" name="userPassword" id="userPassword" onBlur={formik.handleBlur} onChange={formik.handleChange} className="block py-2.5 px-0 w-full text-sm text-white bg-transparent border-0 border-b-2 border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-darkTeal peer" placeholder=" " />
                        <label htmlFor="userPassword" className="peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto peer-focus:text-darkTeal peer-focus:dark:text-darkTeal peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">password</label>
                        {formik.errors.userPassword && formik.touched.userPassword &&
                            <div className=" text-sm text-red-800 rounded-lg bg-transparent dark:text-red-600" role="alert">
                                {formik.errors.userPassword}
                            </div>
                        }
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className='w-full h-12 rounded-xl bg-gradient-to-r from-white  to-primary/5 text-primary text-xl font-bold hover:shadow-md'
                        style={{ transition: 'background-position 0.4s ease', backgroundSize: '110%' }}
                        onMouseEnter={(e) => e.target.style.backgroundPosition = 'right'}
                        onMouseLeave={(e) => e.target.style.backgroundPosition = 'left'}
                    >
                        {loading ? (
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-100 m-auto"></div>
                        ) : "login"}
                    </button>
                </form>
            </div>
        </div>
    </>
}
