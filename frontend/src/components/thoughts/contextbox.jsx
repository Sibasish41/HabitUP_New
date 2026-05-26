export const Thought =({thought,signature,photo})=>{
    return(
        <div className=" m-20 flex flex-col w-60 items-center  bg-blue-100 mx-10 py-5">
            <img 
            className="rounded-full h-25"
            src={photo} alt=" photo" />
            <div id="thought"
             className="test-xl">
                {thought}
            </div>
            <img className="h-12" 
            src={signature}>
            </img>
        </div>
    )
}