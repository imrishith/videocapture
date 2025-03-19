import React from "react";
import { Container, Card, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { FaUserMd, FaUser, FaVideo } from "react-icons/fa";

const Dashboard = () => {
  const navigate = useNavigate();
  const userRole = localStorage.getItem("role"); // Assuming role is stored in localStorage

  return (
    <Container className="d-flex justify-content-center align-items-center vh-100 bg-light">
      <Card className="p-4 shadow-lg text-center" style={{ width: "400px", borderRadius: "15px" }}>
        <Card.Body>
          <h3 className="text-primary mb-4">
            {userRole === "doctor" ? <FaUserMd className="me-2" /> : <FaUser className="me-2" />}
            Welcome {userRole === "doctor" ? "Doctor" : "Patient"}
          </h3>
          <p className="mb-4">Manage your appointments and join video consultations.</p>
          {userRole === "doctor" ? (
            <Button variant="primary" className="w-100 mb-3" onClick={() => navigate("/doctors")}>
              <FaUserMd className="me-2" /> View Appointments
            </Button>
          ) : (
            <Button variant="primary" className="w-100 mb-3" onClick={() => navigate("/patients")}>
              <FaUser className="me-2" /> View Appointments
            </Button>
          )}
          <Button variant="success" className="w-100" onClick={() => navigate("/lobby")}> 
            <FaVideo className="me-2" /> Join a Room
          </Button>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default Dashboard;