import { useState, useEffect } from 'react';
import { IoMdSend } from "react-icons/io";
import { TextField, Paper, Button, Typography, Container, Box, Stack, Snackbar } from '@mui/material';

function App() {
  const [open, setOpen] = useState(false);
  const [apiResponse, setApiResponse] = useState("");
  const [userPrompt, setUserPrompt] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setApiResponse('The AI says: "Here is the information you requested..."');
    }, 500); // 500ms delay
    return () => clearTimeout(timer);
  }, []);

  function handleClose() {
    setOpen(false);
  }

  function handleInputChange(event) {
    if(event.target.value.length > 500){
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
                  <Button endIcon={<IoMdSend />}>
                      Send
                  </Button>
              </Stack>
              <Snackbar
                open={open}
                autoHideDuration={2000}
                onClose={handleClose}
                message="Prompt exceeds 500 character limit."
                />
          </Box>
      </Container>
  )
}

export default App
