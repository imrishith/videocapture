import React, { useEffect, useCallback, useState } from "react";
import ReactPlayer from "react-player";
import peer from "../service/peer";
import { useParams } from "react-router-dom";
import { useSocket } from "../context/SocketProvider";
import { Container, Button, Card, Row, Col } from "react-bootstrap";
import { FaMicrophone, FaMicrophoneSlash, FaVideo, FaVideoSlash, FaRecordVinyl, FaStopCircle } from "react-icons/fa";
import { ReactMic } from "react-mic";  // ✅ Import ReactMic


const RoomPage = () => {
  const socket = useSocket();
  const { appointment_id } = useParams(); // ✅ Extract `appointment_id` from URL
  const [remoteSocketId, setRemoteSocketId] = useState(null);
  const [myStream, setMyStream] = useState();
  const [remoteStream, setRemoteStream] = useState();
  const [isAudio, setIsAudio] = useState(true);
  const [isVideo, setIsVideo] = useState(true);
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);

  // ✅ Emit "room:join" when the component mounts
  useEffect(() => {
    if (socket && appointment_id) {
      console.log(`Joining Room: ${appointment_id}`);
      socket.emit("room:join", { room: appointment_id });
    }
  }, [socket, appointment_id]);
  // Handle user joining the room
  const handleUserJoined = useCallback(({ id }) => {
    console.log(`joined room`);
    setRemoteSocketId(id);
  }, []);

  // Handle calling a user
  const handleCallUser = useCallback(async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: true,
    });
    const offer = await peer.getOffer();
    socket.emit("user:call", { to: remoteSocketId, offer });
    setMyStream(stream);
    console.log("checking sendstream");
  }, [remoteSocketId, socket]);


  // Handle incoming call
  const handleIncomingCall = useCallback(
    async ({ from, offer }) => {
      setRemoteSocketId(from);
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true,
      });
      setMyStream(stream);
      console.log(`Incoming Call`, from, offer);
      const ans = await peer.getAnswer(offer);
      socket.emit("call:accepted", { to: from, ans });
    },
    [socket]
  );

  // Send local stream tracks to the remote peer
  const sendStreams = useCallback(() => {
    if (myStream) {
      for (const track of myStream.getTracks()) {
        peer.peer.addTrack(track, myStream);
      }
    }
  }, [myStream]);

  // Handle call accepted
  const handleCallAccepted = useCallback(
    ({ from, ans }) => {
      peer.setLocalDescription(ans);
      console.log("Call Accepted!");
      sendStreams();
    },
    [sendStreams]
  );

  // Handle negotiation needed
  const handleNegoNeeded = useCallback(async () => {
    const offer = await peer.getOffer();
    socket.emit("peer:nego:needed", { offer, to: remoteSocketId });
  }, [remoteSocketId, socket]);

  useEffect(() => {
    peer.peer.addEventListener("negotiationneeded", handleNegoNeeded);
    return () => {
      peer.peer.removeEventListener("negotiationneeded", handleNegoNeeded);
    };
  }, [handleNegoNeeded]);

  // Call user automatically when remoteSocketId is set
  useEffect(() => {
    if (remoteSocketId) {
      console.log("Remote user detected, starting call...");
      setTimeout(() => handleCallUser(), 1000); // Slight delay for stability
    }
  }, [remoteSocketId]);

  // Handle incoming negotiation
  const handleNegoNeedIncoming = useCallback(
    async ({ from, offer }) => {
      const ans = await peer.getAnswer(offer);
      socket.emit("peer:nego:done", { to: from, ans });
    },
    [socket]
  );

  // Handle final negotiation
  const handleNegoNeedFinal = useCallback(async ({ ans }) => {
    await peer.setLocalDescription(ans);
  }, []);

  // Toggle audio
  const toggleAudio = () => {
    if (myStream) {
      myStream.getAudioTracks().forEach((track) => (track.enabled = !isAudio));
      setIsAudio(!isAudio);
    }
  };

  // Toggle video
  const toggleVideo = () => {
    if (myStream) {
      myStream.getVideoTracks().forEach((track) => (track.enabled = !isVideo));
      setIsVideo(!isVideo);
    }
  };

  // ✅ Start Recording
  const startRecording = () => {
    setIsRecording(true);
  };

  // ✅ Stop Recording
  const stopRecording = () => {
    setIsRecording(false);
  };

  // ✅ Handle when recording stops
  const onStopRecording = (recordedBlob) => {
    setAudioBlob(recordedBlob.blobURL);
  };


  // Listen for remote tracks
  useEffect(() => {
    peer.peer.addEventListener("track", async (ev) => {
      const remoteStream = ev.streams;
      console.log("GOT TRACKS!!");
      setRemoteStream(remoteStream[0]);
    });
  }, [myStream]);

  // Socket event listeners
  useEffect(() => {
    socket.on("user:joined", handleUserJoined);
    socket.on("incomming:call", handleIncomingCall);
    socket.on("call:accepted", handleCallAccepted);
    socket.on("peer:nego:needed", handleNegoNeedIncoming);
    socket.on("peer:nego:final", handleNegoNeedFinal);

    return () => {
      socket.off("user:joined", handleUserJoined);
      socket.off("incomming:call", handleIncomingCall);
      socket.off("call:accepted", handleCallAccepted);
      socket.off("peer:nego:needed", handleNegoNeedIncoming);
      socket.off("peer:nego:final", handleNegoNeedFinal);
    };
  }, [
    socket,
    handleUserJoined,
    handleIncomingCall,
    handleCallAccepted,
    handleNegoNeedIncoming,
    handleNegoNeedFinal,
  ]);

  return (
    <Container fluid className="vh-100 d-flex flex-column justify-content-center align-items-center bg-dark text-white">
      <Card className="room-page-card p-4 bg-secondary text-white w-100 h-100">
        <h2 className="text-center mb-3 text-md-start">Room Page</h2>
        <h4 className="text-center text-sm-start">{remoteSocketId ? "Connected" : "No one in room"}</h4>
        <Row className="mb-3 text-center">
          <Col md={12}>
            {/* {remoteSocketId && (
              <Button variant="success" onClick={handleCallUser} className="me-2">Call</Button>
            )} */}
            {/* {myStream && (
              <Button variant="primary" onClick={sendStreams} className="me-2">Send Stream</Button>
            )} */}
            <Button variant="secondary" onClick={toggleAudio} className="me-2 mb-2 mb-md-0">
              {isAudio ? <FaMicrophone /> : <FaMicrophoneSlash />}
            </Button>
            <Button variant="secondary" onClick={toggleVideo} className="me-2 mb-2 mb-md-0">
              {isVideo ? <FaVideo /> : <FaVideoSlash />}
            </Button>
            {isRecording ? (
              <Button variant="danger" onClick={stopRecording} className="me-2">
                <FaStopCircle /> Stop Recording
              </Button>
            ) : (
              <Button variant="warning" onClick={startRecording} className="me-2">
                <FaRecordVinyl /> Start Recording
              </Button>
            )}
          </Col>
          {/* 🎤 React-Mic Recorder */}
          <Row className="text-center">
            <Col className="col-12">
              <ReactMic
                record={isRecording}
                onStop={onStopRecording}
                mimeType="audio/webm"
                strokeColor="#ffffff"
                backgroundColor="#282c34"
                width="100%"
              />
            </Col>
          </Row>

          {/* 🎧 Playback Recorded Audio */}
          {audioBlob && (
            <Row className="text-center mt-3">
              <Col>
                <h5>Recorded Audio</h5>
                <audio controls src={audioBlob}></audio>
                <br />
                <a href={audioBlob} download="recorded_audio.webm">
                  <Button variant="success">⬇ Download Audio</Button>
                </a>
              </Col>
            </Row>
          )}
        </Row>
        <Row>
          <Col className="col-12 col-md-6">
            {myStream && (
              <>
                <h5>My Stream</h5>
                <ReactPlayer
                  playing
                  url={myStream}
                  width="100%"
                  height="auto"
                  className="border rounded"
                />
              </>
            )}
          </Col>
          <Col className="col-12 col-md-6">
            {remoteStream && (
              <>
                <h5>Remote Stream</h5>
                <ReactPlayer
                  playing
                  url={remoteStream}
                  width="100%"
                  height="auto"
                  className="border rounded"
                />
              </>
            )}
          </Col>
        </Row>

      </Card>
    </Container>
  );
};

export default RoomPage;