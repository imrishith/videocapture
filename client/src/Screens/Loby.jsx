import React, { useState, useEffect, useCallback } from "react";
import { useSocket } from "../context/SocketProvider";
import { useNavigate } from "react-router-dom";
import { Container, Form, Button, Card } from "react-bootstrap";

const LobbyScreen = () => {
  const [email, setEmail] = useState("");
  const [appointmentId, setAppointmentId] = useState(""); // Auto-generated or received from API
  const socket = useSocket();
  const navigate = useNavigate();

  // Simulating fetching `appointment_id` (in real case, fetch from API or localStorage)
  useEffect(() => {
    const storedAppointmentId = localStorage.getItem("appointment_id"); // Get appointment_id
    if (storedAppointmentId) {
      setAppointmentId(storedAppointmentId);
    }
  }, []);

  const handleSubmitForm = useCallback(
    (e) => {
      e.preventDefault();
      if (!appointmentId) {
        alert("No appointment ID found! Please refresh or check again.");
        return;
      }

      // Send data to the backend
      socket.emit("room:join", { email, appointment_id: appointmentId });

      // Redirect to RoomPage with `appointment_id`
      navigate(`/room/${appointmentId}`);
    },
    [email, appointmentId, socket, navigate]
  );

  useEffect(() => {
    socket.on("room:join", ({ appointment_id }) => {
      navigate(`/room/${appointment_id}`);
    });

    return () => {
      socket.off("room:join");
    };
  }, [socket, navigate]);

  return (
    <Container className="d-flex justify-content-center align-items-center vh-100 bg-dark">
      <Card className="p-4 bg-secondary text-white" style={{ width: "350px" }}>
        <Card.Title className="text-center mb-3">Join Appointment Room</Card.Title>
        <Form onSubmit={handleSubmitForm}>
          <Form.Group className="mb-3">
            <Form.Label>Email ID</Form.Label>
            <Form.Control
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Appointment ID</Form.Label>
            <Form.Control type="text" value={appointmentId} disabled />
          </Form.Group>
          <Button type="submit" variant="primary" className="w-100">Join Room</Button>
        </Form>
      </Card>
    </Container>
  );
};

export default LobbyScreen;
