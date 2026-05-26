import { useSearchParams } from 'react-router-dom'
import { TopBar } from '../apptopbar'
import { Heading } from '../heading'
import { ImageLogo } from '../image'
import { Thought } from '../thoughts/contextbox'
import { useState } from 'react'


export const Home=({logged, setlogged,userinfo})=>{


    return(

    <div className='realtive'>
    <div className={` transition-all duration-300  bg-[url("/assets/image.png")] h-167 `}>
      <TopBar logged={logged} setlogged={setlogged}/>
      <div className='flex'>
            <div className='pt-20'>
                <Heading logged={logged} userInfo={userinfo}/>
            </div>
            <div>
                <ImageLogo />
            </div>
      </div>
      <div className='flex bg-black mt-14'>
        <Thought
          thought={"Each good habit is a step closer to your higher self — plant them with faith, grow them with effort, and watch your spirit evolve."}
          signature={"./src/assets/profilephoto.jpg"}
          photo={"./src/assets/profilephoto.jpg"}
        />
         <Thought
          thought={"Each good habit is a step closer to your higher self — plant them with faith, grow them with effort, and watch your spirit evolve."}
          signature={"./src/assets/profilephoto.jpg"}
          photo={"./src/assets/profilephoto.jpg"}
        />
         <Thought
          thought={"Each good habit is a step closer to your higher self — plant them with faith, grow them with effort, and watch your spirit evolve."}
          signature={"./src/assets/profilephoto.jpg"}
          photo={"./src/assets/profilephoto.jpg"}
        />
         <Thought
          thought={"Each good habit is a step closer to your higher self — plant them with faith, grow them with effort, and watch your spirit evolve."}
          signature={"./src/assets/profilephoto.jpg"}
          photo={"./src/assets/profilephoto.jpg"}
        />

      </div>
    </div>
    </div>
  
    )
}