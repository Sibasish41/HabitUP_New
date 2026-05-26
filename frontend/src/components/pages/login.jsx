import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
export const Login = ({ setlogged, logged, userInfo, setUserInfo }) => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });

    const handleChange = (e) => {
        console.log(e.target);
        console.log(e);
        const { name, value } = e.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: value
        }));
    };
    //submit handler 
    const handleSubmit = (e) => {
        e.preventDefault();
        const fn = async () => {
            try {
                const response = await axios.post("http://localhost:3000/Signin",
                    formData);
                localStorage.setItem("token", response.data.token);
                const userdata = response.data.userdata;
                setUserInfo(userdata);
                setlogged(true);
                console.log("till now")
                navigate('/home');
                console.log("done");
            } catch (error) {
                console.log("error: ", error);
            }
        }
        fn();   

    }
    return (
        <div className="min-h-screen bg-black  text-white flex items-center justify-center p-4">

            <div id='SignInbox'
                className="w-full max-w-150 bg-zinc-900 rounded-xl p-8 shadow-2xl space-y-6">

                <div className="flex flex-col items-center space-y-2">
                    <div className="font-bold text-4xl text-white">
                        HabitUP.
                    </div>
                    <div className="text-xl font-semibold mt-4 text-white">
                        Create Your Account ✨
                    </div>
                    <p className="text-sm text-gray-400 text-center">
                        Start your journey to a more peaceful life today.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">

                    {/* Email */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300">
                            Email
                        </label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            className="mt-1 block w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500"
                            placeholder="Enter your email"
                            required
                        />
                    </div>

                    {/* Password */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300">
                            Password
                        </label>
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            className="mt-1 block w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500"
                            placeholder="Create a password"
                            required
                        />
                    </div>


                    {/* Submit Button */}
                    <button
                        type="submit"
                        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-full shadow-sm text-sm font-medium text-white bg-yellow-500 hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 transition-colors"
                    >
                        Log In
                    </button>
                </form>

                <h3>don't have an account click here to
                    <div
                        onClick={() => { navigate('/signup') }}
                        className="w-25 flex justify-center py-2 px-4 border border-transparent rounded-full shadow-sm text-sm font-medium text-white bg-yellow-400 hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 transition-colors">
                        signup
                    </div>
                </h3>
            </div>

        </div>
    )
}
