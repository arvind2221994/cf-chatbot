import { useState, useEffect } from 'react';
import { IoMdSend } from "react-icons/io";
import { TextField, Paper, Button, Typography, Container, Box, Stack, Snackbar, Alert, Skeleton } from '@mui/material';
import { useGetAIResponse } from './hooks/useGetAIResponse';

function App() {
  const [open, setOpen] = useState(false);
  const [apiResponse, setApiResponse] = useState("");
  const [userPrompt, setUserPrompt] = useState("");
  const [showAlert, setShowAlert] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  function handleClose() {
    setOpen(false);
  }
  function handleErrorClose() {
    setShowAlert(false);
  }
  async function handleEnter(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      await handleSend();
    }
  }
  async function handleSend() {
    if(userPrompt.length > 500){
        setOpen(true);
        return;
    }
    if (!userPrompt.trim()) return;
    
    setIsLoading(true);
    setApiResponse(""); // Clear previous response
    setShowAlert(false);
    
    const response = await useGetAIResponse(userPrompt, (text) => {
      setApiResponse(text); // Update UI as chunks arrive
    }).then((res) => {
      return res;
    }).catch((err) => {
      setShowAlert(true);
      return null;
    }).finally(() => {
      setIsLoading(false);
      setUserPrompt("");
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
                  SPK chatbot (ನೈಸರ್ಗಿಕ ಕೃಷಿ ಮಾರ್ಗದರ್ಶಿ)
              </Typography>
                <Typography variant="body2" align="center" color="textSecondary">
                    ನೈಸರ್ಗಿಕ ಕೃಷಿಯ ಬಗ್ಗೆ ನಿಮ್ಮ ಪ್ರಶ್ನೆಯನ್ನು ಕೇಳಿ
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
              {isLoading && !apiResponse ? (
                <Box>
                  <Skeleton variant="text" sx={{ fontSize: '1rem' }} />
                  <Skeleton variant="text" sx={{ fontSize: '1rem' }} />
                  <Skeleton variant="text" sx={{ fontSize: '1rem', width: '80%' }} />
                </Box>
              ) : (
                <Typography 
                  variant="body2"
                  sx={{
                    maxHeight: 'calc(100vh - 350px)',
                    overflowY: 'auto',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word'
                  }}
                >
                  {apiResponse}
                </Typography>
              )}
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
                      onKeyDown={(e) => handleEnter(e)}
                      disabled={isLoading}
                  />
                  <Button 
                      sx={{ fontWeight: 'bold' }} 
                      onClick={()=>handleSend()} 
                      endIcon={<IoMdSend />}
                      disabled={isLoading || !userPrompt.trim()}
                  >
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
