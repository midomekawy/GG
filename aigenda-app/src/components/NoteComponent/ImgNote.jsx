import { CameraIcon, Upload, XCircle } from 'lucide-react';
import '../WorkspacesComponent/workSpaceStyle.css';
import '../WorkspacesComponent/workspace.css';
const ImgNote = ({setOpenNoteType, openNoteType}) =>{
    return(
        <div className="overlay">
            <div className="create-container img-note" style={{width:'300px'}}>
                <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',width:'100%'}}>
                    <h3 style={{color:'#6918cf',marginTop:'0'}}>NEW IMAGE NOTE</h3>
                    <span onClick={()=>{setOpenNoteType({...openNoteType, image:false})}} style={{color:'#6918cf',cursor:'pointer'}}><XCircle/></span>
                </div>
                <form>
                    <label style={{color:'#8770fc'}}>Note Title</label>
                    <input placeholder='Choose a title'/>
                </form>
                <div style={{display:'flex',alignItems:'center',justifyContent:"center",flexDirection:'column',width:'100%'}}>
                    <div style={{display:'flex',flexDirection:'column',alignItems:'center'}}>
                        <div style={{display:'flex',alignItems:'center',justifyContent:'center',backgroundColor:'#6918cf',width:'50px',height:'50px',color:'white',borderRadius:'50%',cursor:'pointer'}}>
                            <CameraIcon/>
                        </div>
                        <p style={{color:'#8770fc'}}>Take image</p>
                    </div>
                      <div style={{display:'flex',flexDirection:'column',alignItems:'center'}}>
                        <div style={{display:'flex',alignItems:'center',justifyContent:'center',backgroundColor:'#6918cf',width:'50px',height:'50px',color:'white',borderRadius:'50%',cursor:'pointer'}}>
                            <Upload/>
                        </div>
                        <p style={{color:'#8770fc'}}>Upload image</p>
                    </div>
                </div>
            </div>
        </div>
    )
};
export default ImgNote;