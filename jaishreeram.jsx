
import axios from "axios";
import { useEffect, useState } from "react";
export const Register = () => {

    const [formData, setFormData] = useState({ name: "", password: "" });
    const [message, setMessage] = useState("");
    const [addData, setAddData]=useState(false);
    const [responseData , setResponseData]=useState();

    const handleChange = (e) => {
        
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };
    const handleSubmit=()=>{
        e.preventDefault();
        setAddData(true);
    }

    useEffect(()=>{
        if(addData){
                const fn =async()=>{
                    try{
                        const response = await axios.post("http://localhost:3000/postdata",formData);
                        setResponseData(response);
                }catch(err){
                        console.log("error occurred",err);
                }
            }
            fn();
        }
    },[addData])
        return (
            <div className="flex justify-center items-center h-screen ">
               { addData === false?<form
                    onSubmit={handleSubmit}
                    className="bg-gray-800 p-8 rounded-lg shadow-lg w-96"
                >
                    <h2 className="text-2xl font-bold mb-6 text-center">Login</h2>

                    <input
                        type="text"
                        name="name"
                        placeholder="Username"
                        value={formData.name}
                        onChange={handleChange}
                        className="w-full mb-4 px-4 py-2 border rounded-lg focus:outline-none"
                    />

                    <input
                        type="password"
                        name="password"
                        placeholder="Password"
                        value={formData.password}
                        onChange={handleChange}
                        className="w-full mb-4 px-4 py-2 border rounded-lg focus:outline-none"
                    />

                    <button
                        type="submit"
                        className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600"
                    >
                        Login
                    </button>

                    {message && <p className="mt-4 text-center">{message}</p>}
                </form>:
                <div>
                    {JSON.stringify(responseData)}
                    </div>}
            </div>
        )
    }