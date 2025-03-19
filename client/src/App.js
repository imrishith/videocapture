import { Routes, Route } from "react-router-dom";
import LobbyScreen from "./Screens/Loby";
import RoomPage from "./Screens/Room";
import {Doctors} from "./Screens/Doctors";
import { Patients } from "./Screens/Patients";
import Login from "./Pages/Login";
import Dashboard from "./Pages/Dashboard";

function App() {
  return (
    
      <Routes>
         <Route path="/" element={<Login />} />
        <Route path="/lobby" element={<LobbyScreen />} />
        <Route path="/room/:appointment_id" element={<RoomPage />} />
        <Route path="/doctors" element={<Doctors />} />
        <Route path="/patients" element={<Patients />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
  
  );
}

export default App;
