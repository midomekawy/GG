import LogoImg from "../../assets/images/logo.png";
import "./logsign.css";
import { useNavigate } from "react-router-dom";
import FormBottomSec from "./FormBottomSec";
import { useState } from "react";
import Tooltip from "@mui/material/Tooltip";
import axios from "axios";
import Swal from 'sweetalert2';
const Signup = () =>{
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const [inputValues, setInputValues] = useState({
        firstName:'',
        lastName:'',
        email:'',
        password:'',
        confirmPassword:'',
    });
    const [openTooltips, setOpenTooltips] = useState({
        firstName: false,
        lastName:false,
        email: false,
        password: false,
        confirmPassword: false,
    });
    const [showPassword, setShowPassword] = useState(false);
    const nameRegex =/^[a-zA-Z\u0600-\u06FF\s-]{2,50}$/;
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    const [errors, setErrors] = useState({});
    const handleSignup = async (e)=>{
        console.log('clicked');
        // Validation
        e.preventDefault();
        let newErrors = {};
        if(!inputValues.firstName){
            newErrors.firstName = 'FirstName is required';
            setOpenTooltips(prev =>({...prev, firstName: true}));
        }
        else if(!nameRegex.test(String(inputValues.firstName))){
            newErrors.firstName= 'FirstName should only contain letters (2-50 chars)';
            setOpenTooltips(prev =>({...prev, firstName: true}));
        }
        if(!inputValues.lastName.trim()){
            newErrors.lastName = 'LastName is required';
            setOpenTooltips(prev =>({...prev, lastName: true}));
        }
        if(!inputValues.email){
            newErrors.email = 'Email is required';
            setOpenTooltips(prev =>({...prev, email:true}));
        }
        else if(!emailRegex.test(String(inputValues.email))){
            newErrors.email = 'Email must be like example@mail.com';
            setOpenTooltips(prev =>({...prev, email:true}));
        }
        if(!inputValues.password){
            newErrors.password = 'Password is required';
            setOpenTooltips(prev =>({...prev, password:true}));
        }
        else if(!passwordRegex.test(String(inputValues.password))){
            newErrors.password = 'Password must be 8+ characters with uppercase, lowercase, a number, and a special characters';
            setOpenTooltips(prev => ({...prev, password:true}));
        }
        if(!inputValues.confirmPassword){
            newErrors.confirmPassword = 'Confirm password is required';
            setOpenTooltips(prev =>({...prev, confirmPassword:true}));
        }
        else if(inputValues.confirmPassword !== inputValues.password){
            newErrors.confirmPassword = 'Do not match the password';
            setOpenTooltips(prev =>({...prev, confirmPassword:true}));
        }
        setErrors(newErrors);
        if(Object.keys(newErrors).length === 0){
            // integration
            setIsLoading(true);
            try{
             const url = 'https://aigendaweb.runasp.net/api/Auth/register';
             const response = await axios.post(url,{
                firstName: inputValues.firstName,
                lastName: inputValues.lastName,
                email: inputValues.email,
                password: inputValues.password,
                confirmPassword: inputValues.confirmPassword
             }); 
             const responseStatus = response.data.statusCode;
             if(responseStatus === 409){
                setErrors(prev => ({...prev, email: 'This email is already registered!'}));
                setOpenTooltips(prev => ({...prev, email:true}));
                setIsLoading(false);
                return;
             }
             if(responseStatus === 400){
                setErrors(prev =>({...prev, email:'Invalid email or password. Please try again', password:'Invalid email or password. Please try again'}));
                setOpenTooltips(prev => ({...prev, email:true, password:true}));
                setIsLoading(false);
                return;
             }
             const userId = response.data.id;
             console.log(response.data);
             console.log(response.data.id);
             localStorage.setItem('tempId',response.data.id);
             Swal.fire({
                title: "Success!",
                text: 'Now check your email for a verification code to complete registeration',
                icon: 'success',
                confirmButtonText: 'Let\'s confirm your account',
                confirmButtonColor:'#573385',
                background: 'rgba(255, 255, 255, 0.9)', 
                backdrop: 'rgba(0,0,0,0.4)'
             }).then((result) => {
            if (result.isConfirmed) {
             navigate('/Auth/confirm-email'); 
            }
            });
            }catch(error){
                console.error("Signup integration error:", error.response?.data);
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
    return(
        <div className="logsigncontainer">
           <img src={LogoImg} alt="Logo image"/>
           <div className="thebox">
            <div className="logsignformbox">
            <h2 style={{margin:'0'}}>Signup</h2>
            <p style={{margin:'0 0 5px'}}>Just some details to get you in.!</p>
            <form onSubmit={handleSignup}>   
                <Tooltip title={errors.firstName || ""} arrow open={Boolean(openTooltips.firstName)} placement="top-end">
                <input  type="text" placeholder="First name" value={inputValues.firstName} onChange={(e)=>{setInputValues({...inputValues, firstName: e.target.value}); setOpenTooltips(prev =>({...prev, firstName: false}))}}/>
                </Tooltip>
                 <Tooltip title={errors.lastName || ""} arrow open={Boolean(openTooltips.lastName)} placement="top-end">
                <input  type="text" placeholder="Last name" value={inputValues.lastName} onChange={(e)=>{setInputValues({...inputValues, lastName: e.target.value}); setOpenTooltips(prev =>({...prev, lastName: false}))}}/>
                </Tooltip>
                <Tooltip title={errors.email || ""} open={Boolean(openTooltips.email)} arrow placement='top-end'>
                <input  type="text" placeholder="Email" value={inputValues.email} onChange={(e)=>{setInputValues({...inputValues, email:e.target.value}); setOpenTooltips(prev =>({...prev, email:false}))}}/>
                </Tooltip>
                <Tooltip title={errors.password ||''} placement="top-end" open={Boolean(openTooltips.password)} arrow>
                <input  type={showPassword?'text':'password'} placeholder='Password' style={{position:"relative"}} value={inputValues.password} onChange={(e)=>{setInputValues({...inputValues, password:e.target.value}); setOpenTooltips(prev =>({...prev, password:false}))}}/>
                </Tooltip>
                <span className="signup-eye" onClick={()=>{setShowPassword(!showPassword)}}><i className="fa-solid fa-eye"></i></span>
                <Tooltip title={errors.confirmPassword || ''} placement="top-end" open={Boolean(openTooltips.confirmPassword)} arrow>
                <input  type="password" placeholder="Confirm Password" value={inputValues.confirmPassword} onChange={(e)=>{setInputValues({...inputValues, confirmPassword:e.target.value}); setOpenTooltips(prev =>({...prev, confirmPassword:false}))}}/>
                </Tooltip>
                <button type="submit" disabled={isLoading}>{isLoading?'Loading':'Signup'}</button>
            </form>
            <FormBottomSec show={true} title={"Already Registered ?"} theLink={'login'} theLinkTitle={"Login"}/>
            </div>
           </div>
        </div>
    )
} 
export default Signup;