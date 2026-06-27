import { MicIcon, PauseIcon, Pointer, Trash2Icon } from 'lucide-react';
import '../WorkspacesComponent/workSpaceStyle.css';
import '../WorkspacesComponent/workspace.css';
const VoiceNote = ({openNoteType, setOpenNoteType})=>{
    return(
        <div className="overlay">
            <div className="create-container" style={{width:'376px'}}>
            <h3 style={{color:'#6918cf',marginTop:'0'}}>Record New Note</h3>
            <div style={{display:'flex',alignItems:'center',justifyContent:'center',flexDirection:'column',margin:'10px'}}>
            <div style={{width:'109px',height:'109px',borderRadius:'50%',backgroundColor:'#6918cf',color:'white',display:'flex',alignItems:'center',justifyContent:'center'}}>
            <MicIcon size={50}/>
            </div>
            <div style={{marginTop:'30px',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',width:'100%',alignSelf:'flex-end'}}>
            <div style={{cursor:'pointer',backgroundColor:'red',width:'50px',height:'50px',borderRadius:'50%',display:'flex',alignSelf:'center',justifyContent:'center',alignItems:'center'}}>
                <div style={{backgroundColor:'white',width:'15px',height:'15px'}}></div>
            </div>
            <div style={{display:'flex',alignItems:'center',justifyContent:'center',gap:'25px',marginTop:'15px'}}>
            <div style={{display:'flex',alignItems:'center',justifyContent:'center',flexDirection:'column'}}>
            <div style={{cursor:'pointer',backgroundColor:'#d9d9d9',width:'50px',height:'50px',borderRadius:'50%',display:'flex',alignSelf:'center',justifyContent:'center',alignItems:'center'}}>
            <PauseIcon size={20}/>
            </div>  
            <p style={{color:'#9f9f9f'}}>Discard</p>
            </div>
            <div style={{display:'flex',alignItems:'center',justifyContent:'center',flexDirection:'column'}}>
            <div onClick={()=>{setOpenNoteType({...openNoteType, voice:false})}} style={{cursor:'pointer',backgroundColor:'#d9d9d9',width:'50px',height:'50px',borderRadius:'50%',display:'flex',alignSelf:'center',justifyContent:'center',alignItems:'center'}}>
            <Trash2Icon size={20}/>
            </div>  
            <p style={{color:'#9f9f9f'}}>Cancel</p>
            </div>
            </div>
            </div>
            </div>
           
            </div>
        </div>
    )
};
export default VoiceNote;