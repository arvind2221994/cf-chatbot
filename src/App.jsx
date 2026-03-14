import { useState } from 'react';
import { IoMdSend } from "react-icons/io";
import {
  TextField,
  Paper,
  Button,
  Typography,
  Container,
  Box,
  Stack,
  Snackbar,
  Alert,
  Skeleton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { useGetAIResponse } from './hooks/useGetAIResponse';
import { translations } from './translations';

function App() {
  const [open, setOpen] = useState(false);
  const [apiResponse, setApiResponse] = useState("");
  const [userPrompt, setUserPrompt] = useState("");
  const [showAlert, setShowAlert] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [language, setLanguage] = useState('kn');

  const t = translations[language] || translations['en'];

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
    if (userPrompt.length > 500) {
      setOpen(true);
      return;
    }
    if (!userPrompt.trim()) return;

    setIsLoading(true);
    setApiResponse("");
    setShowAlert(false);

    await useGetAIResponse(userPrompt, language, (text) => {
      setApiResponse(text);
    })
      .catch(() => {
        setShowAlert(true);
        return null;
      })
      .finally(() => {
        setIsLoading(false);
        setUserPrompt("");
      });
  }

  function handleInputChange(event) {
    if (event.target.value.length > 500) {
      setUserPrompt(event.target.value.slice(0, 499));
      setOpen(true);
      return;
    }
    setUserPrompt(event.target.value);
  }

  return (
    <>
      <Box
        sx={{
          position: 'fixed',
          top: { xs: 8, sm: 12 },
          left: { xs: 8, sm: 12 },
          zIndex: 2000,
          minWidth: { xs: 120, sm: 160 },
          maxWidth: { xs: 'calc(100vw - 16px)', sm: 220 },
          p: 0.5,
          borderRadius: 1,
          bgcolor: 'rgba(255, 255, 255, 0.85)',
          backdropFilter: 'blur(6px)',
          boxShadow: 1,
        }}
      >
        <FormControl size="small" fullWidth>
          <InputLabel id="language-select-label">Language</InputLabel>
          <Select
            labelId="language-select-label"
            id="language-select"
            value={language}
            label="Language"
            onChange={(e) => setLanguage(e.target.value)}
          >
            <MenuItem value="kn">ಕನ್ನಡ</MenuItem>
            <MenuItem value="en">English</MenuItem>
            <MenuItem value="te">Telugu</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <Container
        maxWidth={false}
        sx={{
          width: '100%',
          maxWidth: { xs: '100%', sm: 600, md: 720 },
          mx: 'auto',
          px: { xs: 1.5, sm: 2 },
          display: 'flex',
          flexDirection: 'column',
          minHeight: '100vh',
          pt: { xs: 9, sm: 2 },
          pb: 2,
        }}
      >
        <Box sx={{ mb: 2 }}>
          <Typography variant="h4" component="h1" align="center" gutterBottom sx={{
            fontWeight: 'bold',
            background: 'linear-gradient(45deg, #32CD32, #008000)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            display: 'block',
            maxWidth: '100%'
          }}>
            {t.title}
          </Typography>
          <Typography variant="body2" align="center" color="textSecondary" sx={{
            fontWeight: '700',
          }}>
            {t.subtitle}
          </Typography>
        </Box>
        <Paper
          elevation={apiResponse ? 1 : 0}
          sx={{
            p: 2,
            width: '100%',
            overflowY: 'auto',
            flexGrow: 0.5,
            minHeight: { xs: 150, sm: 250 },
            backgroundColor: '#9bcc73',
          }}
        >
          {isLoading && !apiResponse ? (
            <Box>
              <Skeleton variant="text" sx={{ fontSize: '1rem' }} />
              <Skeleton variant="text" sx={{ fontSize: '1rem' }} />
              <Skeleton variant="text" sx={{ fontSize: '1rem' }} />
              <Skeleton variant="text" sx={{ fontSize: '1rem', width: '80%' }} />
              <Skeleton variant="text" sx={{ fontSize: '1rem', width: '80%' }} />
            </Box>
          ) : (
            <Typography
              variant="body2"
              sx={{
                maxHeight: 'calc(100vh - 350px)',
                overflowY: 'auto',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
                fontWeight: '500',
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
              placeholder={t.placeholder}
              fullWidth
              value={userPrompt}
              onChange={(e) => handleInputChange(e)}
              onKeyDown={(e) => handleEnter(e)}
              disabled={isLoading}
            />
            <Button
              sx={{
                fontWeight: 'bold',
                fontSize: '20px',
              }}
              onClick={() => handleSend()}
              endIcon={<IoMdSend />}
              disabled={isLoading || !userPrompt.trim()}
            >
              {t.send}
            </Button>
          </Stack>
          <Snackbar
            open={open}
            autoHideDuration={2000}
            onClose={handleClose}
            message={t.promptLimitError}
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
              {userPrompt ? t.apiError : t.noInputError}
            </Alert>
          </Snackbar>

        </Box>
      </Container>
    </>
  );
}

export default App;
