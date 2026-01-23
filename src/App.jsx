import { useState, useEffect } from 'react';
import { IoMdSend } from "react-icons/io";
import { TextField, Paper, Button, Typography, Container, Box, Stack, Snackbar, Alert } from '@mui/material';
import { useGetAIResponse } from './hooks/useGetAIResponse';

function App() {
  const [open, setOpen] = useState(false);
  const [apiResponse, setApiResponse] = useState("");
  const [userPrompt, setUserPrompt] = useState("");
  const [showAlert, setShowAlert] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setApiResponse('The AI says: "Here is the information you requested..."');
    }, 500); // 500ms delay
    return () => clearTimeout(timer);
  }, []);

  function handleClose() {
    setOpen(false);
  }
  function handleErrorClose() {
    setShowAlert(false);
  }
  function handleSend() {
    if(userPrompt.length > 500){
        setOpen(true);
        return;
    }
    useGetAIResponse(userPrompt).then(response => {
        if(!response){
            setShowAlert(true);
            return;
        }
        setApiResponse(response);
    });
  }

  function handleInputChange(event) {
    if(event.target.value.length > 500){
        setUserPrompt(event.target.value.slice(0, 499));
        setOpen(true);
        return;
    }
    setUserPrompt(event.target.value);
  }

  return (
      <Container
          maxWidth="sm"
          sx={{
              display: 'flex',
              flexDirection: 'column',
              minHeight: '100vh',
              py: 2
          }}
      >
          <Box sx={{ mb: 2 }}>
              <Typography variant="h4" component="h1" align="center" gutterBottom>
                  Sample chatbot UI
              </Typography>
          </Box>
          <Paper
              elevation={apiResponse ? 1 : 0}
              sx={{
                  p: 2,
                  width: '100%',
                  flexGrow: 1,
                  overflowY: 'auto',
                  minHeight: { xs: 100, sm: 150 }
              }}
          >
              <Typography variant="body2" sx={{ opacity: apiResponse ? 1 : 0, transition: 'opacity 0.5s ease-in-out' }}>
                  {apiResponse}
              </Typography>
          </Paper>
          <Box sx={{ mt: 2 }}>
              <Stack direction="row" spacing={1} sx={{ width: '100%' }}>
                  <TextField
                      id="outlined-multiline-static"
                      multiline
                      rows={2}
                      placeholder="Type your prompt here..."
                      fullWidth
                      value={userPrompt}
                      onChange={(e) => handleInputChange(e)}
                  />
                  <Button sx={{ fontWeight: 'bold' }} onClick={()=>handleSend()} endIcon={<IoMdSend />}>
                      Send
                  </Button>
              </Stack>
              <Snackbar
                open={open}
                autoHideDuration={2000}
                onClose={handleClose}
                message="Prompt exceeds 500 character limit."
                />
                <Snackbar
                open={showAlert}
                autoHideDuration={2000}
                onClose={handleErrorClose}
                >
                    <Alert
                        onClose={handleErrorClose}
                        severity={userPrompt ? "error" : "info"}
                        sx={{ width: '100%' }}
                    >
                        {userPrompt ? "Failed to get a response from the AI. Please try again." : "No input detected. Please enter a prompt."}
                    </Alert>
                </Snackbar>
                
          </Box>
      </Container>
  )
}

export default App
