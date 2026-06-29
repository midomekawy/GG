import "./logsign.css";
import LogoImg from "../../assets/images/logo.png";
import { useState } from "react";
import Tooltip from "@mui/material/Tooltip";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import Swal from 'sweetalert2';
const SignConfirmEmail = () => {
    const navigate = useNavigate();
    // const location = useLocation();
    // const userId = location.state?.uid;
    const userId = localStorage.getItem('tempId');
    const [isLoading, setIsLoading]= useState(false);
    const [inputValues, setInputValues] = useState({
        // userId: '',
        code: ''
    });
    const [errors, setErrors] = useState({});
    const [openTooltips, setOpenTooltips] = useState({
        // userId : false,
        code: false
    });
    const handleConfirmEmail = async (e)=>{
        e.preventDefault();
        let newErrors = {};
        // if(!inputValues.userId){
        //     newErrors.userId = "User id is required";
        //     setOpenTooltips(prev => ({...prev, userId: true}));
        // }
        if(!inputValues.code){
            newErrors.code = "Code is required";
            setOpenTooltips(prev =>({...prev, code: true}));
        }
        setErrors(newErrors);
        if(Object.keys(newErrors).length === 0){
            const url = 'https://aigendaweb.runasp.net/api/Auth/confirm-email';
            setIsLoading(true);
            try{
              const response = await axios.post(url,{
              userId: userId,
              code: inputValues.code
            });
             const responseStatus = response.data.statusCode;
             if( responseStatus === 400){
              setErrors(prev =>({...prev, code:'The provided code is not valid'}));
              setOpenTooltips(prev =>({...prev, code:true}));
              setIsLoading(false);
              return;
             }
             Swal.fire({
              title: "Success!",
              text: 'Account activated successfully now you are ready for login',
              icon: 'success',
              confirmButtonText: 'Let\'s Login',
              confirmButtonColor:'#573385',
              background: 'rgba(255, 255, 255, 0.9)', 
              backdrop: 'rgba(0,0,0,0.4)'
          }).then((result) => {
          if (result.isConfirmed) {
          navigate('/login'); 
          }
          });
            }
            catch(error){
              console.error("Confirm email error:", error.response?.data);
              Swal.fire({
                title: 'Oops!',
                text:'Something went wrong please try again',
                icon:'error',
                confirmButtonText:'Try again'
              });
            }
            finally{
              setIsLoading(false);
            }
            
        }
    }
  return (
    <div className="logsigncontainer" style={{marginTop:'110px'}}>
      <img src={LogoImg} alt="Logo image" />
      <div className="thebox">
        <div className="logsignformbox" style={{marginBottom:'20px'}}>
            <h2 style={{ margin: "0" }}>Confirm your account</h2>
          <p style={{ margin: "0 0 5px" }}>Please check your email for a user id & code</p>
           <form onSubmit={handleConfirmEmail}>
                        {/* <Tooltip title={errors.userId || ""} arrow open={Boolean(openTooltips.userId)} placement="top-end">
                        <input placeholder="User ID" value={inputValues.userId} onChange={(e)=>{setInputValues({...inputValues, userId:e.target.value});setOpenTooltips(prev => ({...prev, userId:false}));}}/>
                        </Tooltip> */}
                        <Tooltip title={errors.userId || ""} arrow open={Boolean(openTooltips.userId)} placement="top-end">
                        <input placeholder="Code" value={inputValues.code} onChange={(e)=>{setInputValues({...inputValues, code:e.target.value});setOpenTooltips(prev =>({...prev, code:false}));}}/>
                        </Tooltip>
                      <button type="submit" disabled={isLoading}>{isLoading? "Loading" :'Submit'}</button>
                    </form>
        </div>
      </div>
    </div>
  );
};
export default SignConfirmEmail;
