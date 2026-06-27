import { ImageIcon, Mic, Palette, TextCursorIcon } from "lucide-react";
import { Link } from "react-router-dom";
const CreateNote = ({openCreateNote, setOpenCreateNote, setOpenNoteType, openNoteType}) =>{
    return(
        <div className="overlay" onClick={()=>{setOpenCreateNote(false)}}>
            <div className="create-container">
            <h2 style={{color:'#5900ca'}}>Create New Note</h2>
            <div className="form">
            <form>
            <div className="text">
                <label style={{color:'#917bff'}}>Note title</label>
                <input placeholder="Choose a title..."/>
            </div>
            <div className="note-type">
                <h5 style={{color:'#917bff'}}>CHOOSE NOTE TYPE</h5>
                <div className="boxes">
                <Link to={'/textnote'} style={{flex:'1'}}>
                <div className="box" onClick={()=>{setOpenCreateNote(false)}}>
                <span><TextCursorIcon/></span>
                <p>TEXT</p>
                </div>
                </Link>
                <Link to={'/drawnote'} style={{flex:'1'}}>
                <div className="box" onClick={()=>{setOpenCreateNote(false) }}>
                <span><Palette/></span>
                <p>HAND DRAW</p>
                </div>
                </Link>
                <div className="box" onClick={()=>{setOpenCreateNote(false); setOpenNoteType({...openNoteType, voice:true})}}>
                    <span><Mic/></span>
                    <p>VOICE</p>
                </div>
                <div className="box" onClick={()=>{setOpenCreateNote(false);setOpenNoteType({...openNoteType, image:true})}}>
                    <span><ImageIcon/></span>
                    <p>IMAGE</p>
                </div>
                </div>
            </div>
                <div className="buttons">
                <button type="button" onClick={()=>{setOpenCreateNote(false)}}>Cancel</button>
                </div>
            </form>
            </div>
            </div>
        </div>
    )
};
export default CreateNote;