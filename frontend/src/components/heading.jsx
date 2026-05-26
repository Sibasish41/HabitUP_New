export const Heading = ({ userInfo ,logged }) => {
    return (

        <div className=" text-gray-300 py-25 px-22 lg:block hidden">
            <h1 className="text-5xl font-bold font-Stawix " >
                Habit build
            </h1>
            {logged ?
                <h1 className="text-5xl font-bold font-sans">
                    welocome mr. {userInfo.name} 
                </h1>
                :
                <div>
                    <h1 className="text-5xl font-bold font-sans">transformation</h1>

                    <h1 className="text-5xl font-bold font-sans">
                        Program
                    </h1>
                </div>
            }
            <br></br>
            <h2>
                ( A unit of Sadhana Mandira Charitable Trust )
            </h2>
            <br></br>
            <h2>
                Daily simple habits, create a life with more time and peace
            </h2>
            <div>
                <Btn />
            </div>
        </div>
    )
}
const Btn = () => {
    return (
        <div className="flex  rounded-full w-40 mt-7 py-2 px-4 bg-amber-400 text-[#223b51] 
                        font-sans cursor-pointer ">
            Get Started
            <img
                className="h-6 px-2"
                src="/assets/6127266_multimedia_music_play_player_song_icon.png"
            ></img>
        </div>
    )
}



