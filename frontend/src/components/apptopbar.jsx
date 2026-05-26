import { Navigate, useNavigate } from "react-router-dom"
import { Loginbtn } from "./loginbtn"
import { Logo } from "./logo"
import { Profile } from "./users/prifle"
export const TopBar = ({logged}) => {
    const navigate =useNavigate();
    return (
        <div className="w-full fixed flex justify-between 
                       items-center  h-20 px-8      ">
                        
            <div className="flex justify-start  ">
                {logged && <div>
                        <Profile/>
                    </div>}
                <Logo />
            </div>
            <div className="flex">
                <div className=" justify-between items-center hidden lg:flex">
                    <Tabs title={"Home"} />
                    <Tabs title={"About"} />
                    <Tabs title={"Services"} />
                    <Tabs title={"Team"} />
                    <Tabs title={"Contacts"} />
                </div>
                {logged == false &&
                <div id="login" className="pt-6 px-8 ">
                    <Loginbtn onClick={()=>{navigate('/login')}} />
                </div>
                }
            </div>
        </div>
    )
}

const Tabs = ({ title }) => {
    return (
        <span 
        className="px-5 pt-7  text-white cursor-pointer hover:text-amber-300
                            font-sans hover:text-xl transition-all duration-300 group-opacity-100">
            {title}
        </span>
    )
}
