import { useState, useEffect } from 'react';
import { IoMdSend } from "react-icons/io";
import { TextField, Paper } from '@mui/material';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';

function App() {
  const [count, setCount] = useState(0);
  const [apiResponse, setApiResponse] = useState("");
  const [userPrompt, setUserPrompt] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setApiResponse('The AI says: "Here is the information you requested..."');
    }, 500); // 500ms delay
    return () => clearTimeout(timer);
  }, []);

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
                      onChange={(e) => setUserPrompt(e.target.value)}
                  />
                  <Button endIcon={<IoMdSend />}>
                      Send
                  </Button>
              </Stack>
          </Box>
      </Container>
  )
}

export default App
