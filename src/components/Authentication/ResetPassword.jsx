import "./logsign.css";
import LogoImg from "../../assets/images/logo.png";
import { useState } from "react";
import Tooltip from "@mui/material/Tooltip";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Swal from 'sweetalert2';
const RestPassword = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [inputValues, setInputValues] = useState({
    email:'',
    code:'',
    newPassword:'',
    confirmPassword:'',
  });
  const [openTooltips, setOpenTooltips] = useState({
    email:false,
    code:false,
    newPassword:false,
    confirmPassword:false,
  });
  const navigate = useNavigate();
  const [errors, setErrors] = useState({});
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
   const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    const handleResetPassword = async (e)=>{
    // validation
    e.preventDefault();
    let newErrors = {};
    if (!inputValues.email) {
      newErrors.email = "Email is required";
      setOpenTooltips(prev => ({...prev, email:true}));
    } else if (!emailRegex.test(String(inputValues.email))) {
      newErrors.email = "Email must be like example@mail.com";
      setOpenTooltips(prev => ({...prev, email:true}));
    }
    if(!inputValues.code){
      newErrors.code = "Code is required";
      setOpenTooltips(prev =>({...prev, code:true}));
    }
    if(!inputValues.newPassword){
      newErrors.newPassword = "New password is required";
      setOpenTooltips(prev =>({...prev, newPassword:true}));
    }else if(inputValues.newPassword.length < 8){
      newErrors.newPassword = "Password is too short at least 8 characters";
      setOpenTooltips(prev =>({...prev, newPassword:true}))
    }else if(!passwordRegex.test(String(inputValues.newPassword))){
      newErrors.newPassword = "Password must be 8+ characters with uppercase, lowercase, a number, and a special characters"; 
      setOpenTooltips(prev =>({...prev, newPassword:true}))
    }
    if(!inputValues.confirmPassword){
      newErrors.confirmPassword = "Confirm password is required";
      setOpenTooltips(prev =>({...prev, confirmPassword:true}));
    }else if(inputValues.confirmPassword !== inputValues.newPassword){
      newErrors.confirmPassword = "Do not match the password";
      setOpenTooltips(prev =>({...prev, confirmPassword:true}));
    }
     setErrors(newErrors);
     if(Object.keys(newErrors).length === 0){
        // integration
        const url = 'https://aigendaweb.runasp.net/api/Auth/reset-password';
        setIsLoading(true);
        try{
          const response = await axios.put(url,{
          email: inputValues.email,
          code: inputValues.code,
          newpassword : inputValues.newPassword
        });
        if(response.data.statusCode === 400 || response.data.statusCode === 401){
          const loginError = "Invalid email or password. Please try again";
          setErrors(prev =>({...prev, email: loginError, password:loginError}));
          setOpenTooltips(prev =>({...prev, email:true, newPassword:true}));
          setIsLoading(false);
          return;
        }
        Swal.fire({
          title: "Success!",
          text: 'Password reseted successfully now you are ready for login',
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
        }catch(error){
          console.error('integration error',error.response?.data);
          Swal.fire({
            title: 'Oops!',
            text:'Something went wrong',
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
    <div className="logsigncontainer" style={{ marginTop: "110px"}}>
      <img src={LogoImg} alt="Logo image" />
      <div className="thebox">
        <div className="logsignformbox" style={{marginBottom:'20px'}}>
          <h2 style={{ margin: "0" }}>Reset Password</h2>
          <p style={{ margin: "0 0 5px" }}>Please check your email for a code</p>
          <form onSubmit={handleResetPassword}>
            <Tooltip
              title={errors.email || ""}
              arrow
              open={Boolean(openTooltips.email)}
              placement="top-end">
              <input 
                placeholder="example@mail.com"
                value={inputValues.email}
                onChange={(e) => {setInputValues({...inputValues, email:e.target.value});setOpenTooltips(prev => ({...prev,email:false}));}}
              />
              </Tooltip>
              <Tooltip title={errors.code || ""} arrow open={Boolean(openTooltips.code)} placement="top-end">
              <input placeholder="Code" value={inputValues.code} onChange={(e)=>{setInputValues({...inputValues, code:e.target.value});setOpenTooltips(prev => ({...prev, code:false}));}}/>
              </Tooltip>
              <Tooltip title={errors.newPassword || ""} arrow open={Boolean(openTooltips.newPassword)} placement="top-end">
              <input type="password" placeholder="New Password" value={inputValues.newPassword} onChange={(e)=>{setInputValues({...inputValues, newPassword:e.target.value});setOpenTooltips(prev =>({...prev,newPassword:false}));}}/>
              </Tooltip>
              <Tooltip title={errors.confirmPassword || ""} arrow open={Boolean(openTooltips.confirmPassword)} placement="top-end">
              <input type="password" placeholder="Confirm new password" value={inputValues.confirmPassword} onChange={(e)=>{setInputValues({...inputValues, confirmPassword:e.target.value});setOpenTooltips(prev =>({...prev, confirmPassword:false}))}}/>
              </Tooltip>
            <button type="submit" disabled={isLoading}>{isLoading?'Loading':'Reset Password'}</button>
          </form>
          
        </div>
      </div>
    </div>
  );
};
export default RestPassword;