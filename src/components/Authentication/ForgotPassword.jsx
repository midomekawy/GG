import "./logsign.css";
import LogoImg from "../../assets/images/logo.png";
import FormBottomSec from "./FormBottomSec";
import { useState } from "react";
import Tooltip from "@mui/material/Tooltip";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Swal from 'sweetalert2';
const ForgotPassword = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState({});
  const [openTooltips, setOpenTooltips] = useState({email:false})
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  const handleSubmit = async (e) => {
    e.preventDefault();
    let newErrors = {};
    if (!email) {
      newErrors.email = "Email is required";
      setOpenTooltips(prev =>({...prev, email:true}));
    } else if (!emailRegex.test(email)) {
      newErrors.email = "Email must be like example@mail.com";
      setOpenTooltips(prev =>({...prev, email:true}));
    }
    setErrors(newErrors);
    if (Object.keys(newErrors).length === 0) {
      const url = 'https://aigendaweb.runasp.net/api/Auth/forget-password';
      setIsLoading(true);
      try{
        const response = await axios.post(url,{email:email});
        navigate('/Auth/reset-pss');
        Swal.fire({
          title: "Success!",
          text: 'Now check your email for a verification code to reset your password',
          icon: 'success',
          confirmButtonText: 'Let\'s reset your password',
          confirmButtonColor:'#573385',
          background: 'rgba(255, 255, 255, 0.9)', 
          backdrop: 'rgba(0,0,0,0.4)'
        }).then((result) => {
      if (result.isConfirmed) {
        navigate('/Auth/reset-pss'); 
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
  };
  return (
    <div className="logsigncontainer" style={{ marginTop: "110px" }}>
      <img src={LogoImg} alt="Logo image" />
      <div className="thebox">
        <div className="logsignformbox">
          <h2 style={{ margin: "0" }}>Forgot Password?</h2>
          <p style={{ margin: "0 0 5px" }}>Please enter your email</p>
          <form onSubmit={handleSubmit}>
            <Tooltip
              title={errors.email || ""}
              arrow
              open={Boolean(openTooltips.email)}
              placement="top-end"
            >
              <input
                placeholder="example@mail.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setOpenTooltips(prev =>({...prev, email:false}));
                }}
              />
            </Tooltip>
            <button type="submit" disabled={isLoading}>{isLoading? 'Loading':'Send Reset Code'}</button>
          </form>
          <FormBottomSec
            className="extra"
            show={false}
            title={"Don't have an account ?"}
            theLink={"signup"}
            theLinkTitle={"Signup"}
          />
        </div>
      </div>
    </div>
  );
};
export default ForgotPassword;
