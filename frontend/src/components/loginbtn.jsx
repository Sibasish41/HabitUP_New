import { Navigate,useNavigate } from "react-router-dom"
export const Loginbtn=({toggleLoginForm})=>{
    const navigate= useNavigate()
    return(
        <div onClick={() => navigate("/login")}
            className=" px-8 py-1 rounded-4xl 
                        border-2 border-amber-400  hover:bg-amber-400 text-white 
                        font-sans transition-colors duration-300 cursor-pointer "
        >
        Login/SignUp
        </div>
    )
}