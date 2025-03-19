import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Container, Card, Form, Button, Alert, ToggleButtonGroup, ToggleButton } from "react-bootstrap";
import { FaUserMd, FaLock, FaUser, FaUserShield } from "react-icons/fa";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [userType, setUserType] = useState("doctor"); // Default to doctor login
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Username and password are required");
      return;
    }

    let requestData;
    let headers;
    let userIdKey;
    
    if (userType === "admin") {
      const formData = new URLSearchParams();
      formData.append("username", email);
      formData.append("password", password);
      requestData = formData.toString();
      headers = { "Content-Type": "application/x-www-form-urlencoded" };
    } else {
      requestData = JSON.stringify({ email, password });
      headers = { "Content-Type": "application/json" };
      userIdKey = userType === "doctor" ? "doctor_id" : "patient_id";
    }
    // Define API endpoints for Doctor, Patient, and Admin login
    const apiUrl = userType === "doctor"
      ? "http://10.1.5.211:8000/api/v1/doctors/doctors/login"
      : userType === "patient"
      ? "http://10.1.5.211:8000/api/v1/patients/login"
      : "http://10.1.5.211:8000/api/v1/auth/login";

    
      try {
        const { data } = await axios.post(apiUrl, requestData, { headers });

        console.log("ur respo", data)
  
        if (userType === "admin" && data.access_token) {
          localStorage.setItem("token", data.access_token);
        } else if ((userType === "doctor" || userType === "patient") && data[userIdKey]) {
          localStorage.setItem("token", data[userIdKey]);
        } else {
          setError("Invalid login response");
          return;
        }
  
        navigate(userType === "doctor" ? "/doctors" : userType === "patient" ? "/patients" : "/admin"); // Redirect to respective dashboard
      } catch (error) {
      console.log("hi response",  error)
      if (error.response) {
        if (error.response.status === 422) {
          const usernameError = error.response.data.detail[0].loc[1];
          const fieldError = error.response.data.detail[0].msg;
          setError(`${usernameError} ${fieldError}`);
        } else {
          setError(error.response.data.detail);
        }
      } else {
        setError("Network error. Please try again later.");
      }
    }
  };

  return (
    <Container className="d-flex justify-content-center align-items-center vh-100 bg-light">
      <Card className="p-4 shadow-lg" style={{ width: "400px", borderRadius: "15px" }}>
        <Card.Body>
          <h3 className="text-center mb-4 text-primary">
            {userType === "doctor" ? <FaUserMd className="me-2" /> : userType === "patient" ? <FaUser className="me-2" /> : <FaUserShield className="me-2" />} 
            {userType.charAt(0).toUpperCase() + userType.slice(1)} Login
          </h3>

          {/* Toggle for User Type */}
          <ToggleButtonGroup
            type="radio"
            name="userType"
            value={userType}
            onChange={(value) => setUserType(value)}
            className="d-flex mb-3"
          >
            <ToggleButton id="doctor" value="doctor" variant="outline-primary">
              Doctor
            </ToggleButton>
            <ToggleButton id="patient" value="patient" variant="outline-secondary">
              Patient
            </ToggleButton>
            <ToggleButton id="admin" value="admin" variant="outline-danger">
              Admin
            </ToggleButton>
          </ToggleButtonGroup>

          {error && <Alert variant="danger">{error}</Alert>}
          <Form onSubmit={handleLogin}>
            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <div className="input-group">
                <span className="input-group-text bg-primary text-white">
                  <FaUserMd />
                </span>
                <Form.Control
                  type="email"
                  placeholder="Enter email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Password</Form.Label>
              <div className="input-group">
                <span className="input-group-text bg-primary text-white">
                  <FaLock />
                </span>
                <Form.Control
                  type="password"
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </Form.Group>
            <Button type="submit" variant="primary" className="w-100">
              Login
            </Button>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default Login;
