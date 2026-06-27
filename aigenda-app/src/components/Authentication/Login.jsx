import "./logsign.css";
import LogoImg from "../../assets/images/logo.png";
import { useState } from "react";
import { data, Link } from "react-router-dom";
import FormBottomSec from "./FormBottomSec";
import { useNavigate } from 'react-router-dom';
import Tooltip from "@mui/material/Tooltip";
import axios from 'axios';
import Swal from 'sweetalert2';
const Login = () => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const loading = useState(false);
  const [inputValues, setInputValues] = useState({
    email: "",
    password: "",
  });
  const [openTooltips, setOpenTooltips] = useState({
    email: false,
    password: false,
  });
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  const [errors, setErrors] = useState({});
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    let newErrors = {};
    // Validation
    if (!inputValues.email) {
      newErrors.email = "Email is required";
      setOpenTooltips(prev =>({ ...prev, email: true }));
    } else if (!emailRegex.test(String(inputValues.email))) {
      newErrors.email = "Email must be like this example@mail.com";
      setOpenTooltips(prev =>({ ...prev, email: true }));
    }
    if (!inputValues.password) {
      newErrors.password = "Password is required";
      setOpenTooltips(prev =>({ ...prev, password: true }));
    } else if (inputValues.password.length < 8) {
      newErrors.password = "Password is too short at least 8 characters";
      setOpenTooltips(prev =>({ ...prev, password: true }));
    } else if (!passwordRegex.test(String(inputValues.password))) {
      newErrors.password ="Password must be 8+ characters with uppercase, lowercase, a number, and a special characters";
      setOpenTooltips(prev =>({ ...prev, password: true }));
    }
    setErrors(newErrors);
     // integration
    if (Object.keys(newErrors).length === 0) {
      setIsLoading(true);
      const url = "https://aigendaweb.runasp.net/api/Auth";
      try{
        const response = await axios.post(url,{
          email: inputValues.email,
          password: inputValues.password
        });
        const responseStatus = response.data.statusCode;
        if(responseStatus === 401){
          const loginError = "Invalid email or password. Please try again";
          setErrors({email: loginError, password:loginError});
          setOpenTooltips({email: true, password:true});
          setIsLoading(false);
          return;
        }
        if(responseStatus === 404){
          setErrors(prev =>({...prev, email:'This email is not registered'}));
          setOpenTooltips(prev =>({...prev, email:true}));
          setIsLoading(false);
          return;
        }
        const token = response.data.token;
        localStorage.setItem('userToken',token);
        console.log('successful login');
        console.log("Full Response from Server:", response);
        navigate('/home');
      }catch(error){
        console.error('integration error', error);
        // Handle network errors gracefully (e.g., ERR_CERT_DATE_INVALID)
        if (!error.response) {
          Swal.fire({
            title: 'Network Error',
            text: 'Unable to connect to server. Please check your internet connection or try again later.',
            icon: 'error',
            confirmButtonText: 'Try again'
          });
        } else {
          console.error('API error response:', error.response?.data);
          Swal.fire({
            title: 'Oops!',
            text: error.response?.data?.message || 'Login data is not right',
            icon: 'error',
            confirmButtonText: 'Try again'
          });
        }
      }finally{
        setIsLoading(false);
      }
    }
  };
  
  return (
    <div className="logsigncontainer">
      <img src={LogoImg} alt="logo image" />
      <div className="thebox">
        <div className="logsignformbox">
          <h2 style={{ margin: "0" }}>Login</h2>
          <p style={{ margin: "0 0 5px" }}>Glade you're back.! </p>
          <form onSubmit={handleSubmit}>
            <Tooltip
              title={errors.email || ""}
              open={Boolean(openTooltips.email)}
              placement="top-end"
              arrow
            >
              <input
                type="text"
                placeholder="Email"
                value={inputValues.email}
                onChange={(e) => {
                  setInputValues({ ...inputValues, email: e.target.value });
                  setOpenTooltips(prev =>({ ...prev, email: false }));
                }}
              />
            </Tooltip>
            <Tooltip
              title={errors.password || ""}
              open={Boolean(openTooltips.password)}
              placement="top-end"
              arrow
            >
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={inputValues.password}
                onChange={(e) => {
                  setInputValues({ ...inputValues, password: e.target.value });
                  setOpenTooltips(prev =>({ ...prev, password: false }));
                }}
              />
            </Tooltip>
            <span className="login-eye"
              onClick={() => {
                setShowPassword(!showPassword);
              }}
            >
              <i className="fa-solid fa-eye"></i>
            </span>    
            {/* <div className="checkbox">
              <input
                id="rememberme"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => {
                  setRememberMe(e.target.checked);
                }}
              />
              <label htmlFor="rememberme">Remember me</label>
            </div>  */}
            <button type="submit" disabled={isLoading}>{isLoading ? 'loading':'Login'}</button>
            <Link to={"/forgotpassword"}>
              <p>Forgot password?</p>
            </Link>
          </form>
          <FormBottomSec
            show={true}
            title={"Don't have an account ?"}
            theLink={"signup"}
            theLinkTitle={"Signup"}
          />
        </div>
      </div>
    </div>
  );
};
export default Login;




// https://aigendaweb.runasp.net/api/Auth