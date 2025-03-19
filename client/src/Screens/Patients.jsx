import React, { useEffect, useState } from "react";
import { Container, Card, Button, Table, Spinner } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useSocket } from "../context/SocketProvider"; // Import socket context

export const Patients = () => {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
   const socket = useSocket();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAppointments = async () => {
      const patientId = localStorage.getItem("token"); // Retrieve patient_id from localStorage
      if (!patientId) {
        setError("Unauthorized: No patient ID found");
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get(`http://10.1.5.211:8000/api/v1/patients/patients/${patientId}/appointments`);
        setAppointments(response.data.appointments);
      } catch (err) {
        setError("Failed to fetch patient appointments");
      } finally {
        setLoading(false);
      }
    };
    fetchAppointments();
  }, []);

  if (loading) {
    return (
      <Container className="mt-5 text-center">
        <Spinner animation="border" />
        <p>Loading appointments...</p>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="mt-5 text-center text-danger">
        <p>{error}</p>
      </Container>
    );
  }


  const handleJoinRoom = (appointmentId) => {
    socket.emit("room:join", { room: appointmentId });
    navigate(`/room/${appointmentId}`); // Navigate to video call page
  };
  
  return (
    <Container className="mt-5">
      <Card className="p-4 bg-secondary text-white">
        <h3 className="text-center">Patient's Appointments</h3>
        <Table striped bordered hover variant="dark" className="mt-3">
          <thead>
            <tr>
              <th>Appointment ID</th>
              <th>Doctor Name</th>
              <th>Appointment Date</th>
              <th>Slot Time</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {appointments.map((appointment) => (
              <tr key={appointment.appointment_id}>
                <td>{appointment.appointment_id}</td>
                <td>{appointment.doctor_name || "N/A"}</td>
                <td>{new Date(appointment.appointment_date).toLocaleDateString()}</td>
                <td>{`${appointment.slot_start_time} - ${appointment.slot_end_time}`}</td>
                <td>
                <Button variant="success" onClick={() => handleJoinRoom(appointment.appointment_id)}>Join Video Call</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Card>
    </Container>
  );
};
