import { useSearchParams } from "react-router-dom"
import { Userphoto } from "../../../public/icons/userphoto"
import { useState } from "react"

export const Profile = () => {
    const [sideBar, setSidebar] = useState(false);


    return <div>
        <div onClick={() => { setSidebar(!sideBar) }}
            className=" rounded-full bg-amber-50 mt-8 ml-4 cursor-pointer ">
            <Userphoto />
        </div>
            </div>

}