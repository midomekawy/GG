import BookImg from '../../assets/images/BookOpenText.png';
import FlaskImg from '../../assets/images/Flask.png';
import BagImg from '../../assets/images/Briefcase.png';
import LightImg from '../../assets/images/Lightbulb.png';
import GuitarImg from '../../assets/images/Guitar.png';
import "../WorkspacesComponent/workspace.css";
import "../WorkspacesComponent/workSpaceStyle.css";
const CreateNewSpace = ({openCreateSpace, setOpenCreateSpace}) => {
  const handleSubmit = () => {};
  return (
    <div className="overlay">
      <div className="create-container">
        <h2 style={{ color: "#5900ca" }}>Create New Space</h2>
        <div className="form-box">
          <form onSubmit={handleSubmit}>
            <div className="text">
            <label>Space Name</label>
            <input placeholder="ex.marketing"/>
            <label>Description</label>
            <textarea placeholder="What is this space for??"/>
            </div>
            <div className="icons">
                <label>Select space icon</label>
                <div className="boxes">
                    <div className="box"><img src={BookImg}/></div>
                    <div className="box"><img src={FlaskImg}/></div>
                    <div className="box"><img src={BagImg}/></div>
                    <div className="box"><img src={LightImg}/></div>
                    <div className="box"><img src={GuitarImg}/></div>
                </div>
            </div>
            <div className="privacy">
                <label>Privacy</label>
                <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',gap:'15px',marginTop:'10px'}}>
                    <div className="box">
                        <p>Public</p>
                        <p>anyone can see this space</p>
                    </div>
                    <div className="box">
                        <p>Private</p>
                        <p>this space is only visible to you</p>
                    </div>
                </div>
            </div>
            <div className="buttons">
                <button type="button" onClick={()=>setOpenCreateSpace(false)}>Cancel</button>
                <button type="submit" style={{backgroundColor:'#5a0fbd',color:'white'}}>Create space</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
export default CreateNewSpace;
