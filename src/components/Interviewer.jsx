import { useState, useEffect, useRef } from 'react';
import {
    Box,
    Button,
    Container,
    Paper,
    Typography,
    Grid,
    Card,
    CardActionArea,
    CardContent,
    TextField,
    Stack,
    Skeleton,
    Chip,
    LinearProgress,
    FormControl,
    InputLabel,
    Select,
    MenuItem
} from '@mui/material';
import { IoMdSend } from "react-icons/io";
import { useGetAIResponse } from '../hooks/useGetAIResponse';

const TOPICS = [
    "JavaScript Programming",
    "React.js and State Management",
    "Frontend, Performance, Optimization",
    "Node.js and Express.js",
    "Backend, Cloud and DevOps",
    "System Design",
    "Full Stack and AI (Application oriented)",
    "Data Structures & Algorithms"
];

const TOTAL_QUESTIONS = 20;

function Interviewer() {
    const [phase, setPhase] = useState('selection'); // 'selection' | 'interviewing' | 'completed'
    const [selectedTopic, setSelectedTopic] = useState('');
    const [difficulty, setDifficulty] = useState('Mid');
    const [conversation, setConversation] = useState([]);
    const [userAnswer, setUserAnswer] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [questionCount, setQuestionCount] = useState(0);
    const [score, setScore] = useState({ correct: 0, partial: 0, incorrect: 0 });
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [conversation]);

    const startInterview = async (topic) => {
        setSelectedTopic(topic);
        setPhase('interviewing');
        setQuestionCount(1);

        // Let the AI use its system instruction directly to structure the session
        const prompt = `Begin the interview. Topic: "${topic}". Difficulty: "${difficulty}". Total Questions: ${TOTAL_QUESTIONS}. Start by giving me the first question.`;
        
        const initialConv = [{ role: 'user', content: prompt, isHidden: true }];
        setConversation(initialConv);

        await sendToAI(prompt, true, initialConv);
    };

    const handleSendAnswer = async () => {
        if (!userAnswer.trim()) return;

        const currentAnswer = userAnswer;
        setUserAnswer("");

        // Add user's answer to the conversation UI synchronously for sendToAI to reference
        const currentConv = [
            ...conversation,
            { role: 'user', content: currentAnswer }
        ];
        
        setConversation(currentConv);

        await sendToAI(currentAnswer, false, currentConv);
    };

    const sendToAI = async (promptText, isInitial = false, currentConv = []) => {
        setIsLoading(true);
        let evalCounted = false;

        // Add empty assistant message for streaming
        setConversation(prev => [...prev, { role: 'assistant', content: '' }]);

        // Exclude the current prompt from history since the API injects it directly
        const historyToSend = currentConv.length > 0 ? currentConv.slice(0, currentConv.length - 1) : [];

        try {
            await useGetAIResponse(promptText, 'en', (text) => {
                setConversation(prev => {
                    const newHistory = [...prev];
                    newHistory[newHistory.length - 1] = { role: 'assistant', content: text };
                    return newHistory;
                });

                // Auto-sync UI state based on AI's output stream
                if (!evalCounted) {
                    const evalMatch = text.match(/Evaluation:\s*\[?(Correct|Partial|Incorrect)\b/i);
                    if (evalMatch) {
                        evalCounted = true;
                        const status = evalMatch[1].toLowerCase();
                        setScore(prev => ({ ...prev, [status]: prev[status] + 1 }));
                    }
                }

                const match = text.match(/Question\s*\[?\s*(\d+)/i);
                if (match) {
                    const count = parseInt(match[1], 10);
                    if (!isNaN(count)) setQuestionCount(count);
                }
                
                if (text.toLowerCase().includes("performance summary")) {
                    setPhase('completed');
                }
            }, '/api/interview', historyToSend);
        } catch (error) {
            console.error("AI Error:", error);
            setConversation(prev => {
                const newHistory = [...prev];
                newHistory[newHistory.length - 1] = { role: 'assistant', content: "Sorry, I encountered an error. Could you try answering again?" };
                return newHistory;
            });
        } finally {
            setIsLoading(false);
        }
    };

    const resetInterview = () => {
        setPhase('selection');
        setSelectedTopic('');
        setConversation([]);
        setQuestionCount(0);
        setScore({ correct: 0, partial: 0, incorrect: 0 });
        setUserAnswer('');
    };

    if (phase === 'selection') {
        return (
            <Container maxWidth="md" sx={{ pt: 10, pb: 4 }}>
                <Typography variant="h4" fontWeight="bold" align="center" gutterBottom>
                    Technical Interview Practice
                </Typography>
                <Typography variant="body1" align="center" color="textSecondary" sx={{ mb: 4 }}>
                    Select your difficulty level and a topic below to begin a {TOTAL_QUESTIONS}-question mock interview.
                </Typography>

                <Box sx={{ mb: 6, display: 'flex', justifyContent: 'center' }}>
                    <FormControl sx={{ minWidth: 260 }} size="large">
                        <InputLabel id="difficulty-select-label">Select Difficulty</InputLabel>
                        <Select
                            labelId="difficulty-select-label"
                            id="difficulty-select"
                            value={difficulty}
                            label="Select Difficulty"
                            onChange={(e) => setDifficulty(e.target.value)}
                            sx={{ borderRadius: 2, bgcolor: '#ffffff' }}
                        >
                            <MenuItem value="Entry">Entry Level</MenuItem>
                            <MenuItem value="Mid">Mid Level</MenuItem>
                            <MenuItem value="Senior">Senior Level</MenuItem>
                            <MenuItem value="Research">Research / Expert</MenuItem>
                        </Select>
                    </FormControl>
                </Box>

                <Grid container spacing={3}>
                    {TOPICS.map((topic, idx) => (
                        <Grid item xs={12} sm={6} md={4} key={idx}>
                            <Card
                                sx={{
                                    height: '100%',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    transition: '0.3s',
                                    border: '1px solid #e0e0e0',
                                    borderRadius: 2,
                                    '&:hover': { transform: 'translateY(-5px)', boxShadow: '0 8px 16px rgba(0,0,0,0.1)', borderColor: '#1976d2' }
                                }}
                            >
                                <CardActionArea
                                    sx={{ flexGrow: 1, p: 3 }}
                                    onClick={() => startInterview(topic)}
                                >
                                    <CardContent sx={{ textAlign: 'center', p: 0 }}>
                                        <Typography variant="h6" fontWeight="bold" color="primary">
                                            {topic}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                            20 Questions
                                        </Typography>
                                    </CardContent>
                                </CardActionArea>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            </Container>
        );
    }

    return (
        <Container maxWidth="md" sx={{ display: 'flex', flexDirection: 'column', height: '100vh', pt: { xs: 8, sm: 4 }, pb: 4 }}>
            <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                    <Typography variant="h5" fontWeight="bold">
                        {selectedTopic} Interview
                    </Typography>
                    <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                        <Chip
                            label={phase === 'completed' ? "Interview Finished" : `Question ${Math.min(questionCount, TOTAL_QUESTIONS)} of ${TOTAL_QUESTIONS}`}
                            color={phase === 'completed' ? "success" : "primary"}
                            size="small"
                        />
                        {phase === 'interviewing' && (
                            <Chip label="In Progress" color="warning" size="small" variant="outlined" />
                        )}
                        {phase !== 'selection' && (
                            <>
                                <Chip label={`Correct: ${score.correct}`} color="success" size="small" variant="outlined" />
                                <Chip label={`Partial: ${score.partial}`} color="warning" size="small" variant="outlined" />
                                <Chip label={`Incorrect: ${score.incorrect}`} color="error" size="small" variant="outlined" />
                            </>
                        )}
                    </Stack>
                </Box>
                <Button variant="outlined" color="error" size="small" onClick={resetInterview}>
                    Exit Interview
                </Button>
            </Box>

            {phase !== 'completed' && (
                <Box sx={{ mb: 2, width: '100%' }}>
                    <LinearProgress variant="determinate" value={(questionCount / TOTAL_QUESTIONS) * 100} sx={{ height: 8, borderRadius: 4 }} />
                </Box>
            )}

            <Paper
                elevation={0}
                sx={{
                    p: 2,
                    flexGrow: 1,
                    overflowY: 'auto',
                    backgroundColor: '#f8f9fa',
                    border: '1px solid #e0e0e0',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 2,
                    borderRadius: 3
                }}
            >
                {conversation.map((msg, index) => {
                    if (msg.isHidden) return null;
                    return (
                    <Box key={index} sx={{
                        display: 'flex',
                        justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start'
                    }}>
                        <Box sx={{
                            maxWidth: '85%',
                            p: 2,
                            borderRadius: 3,
                            borderTopRightRadius: msg.role === 'user' ? 4 : 24,
                            borderTopLeftRadius: msg.role === 'user' ? 24 : 4,
                            bgcolor: msg.role === 'user' ? '#1976d2' : '#ffffff',
                            color: msg.role === 'user' ? '#ffffff' : '#333333',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                            border: msg.role === 'user' ? 'none' : '1px solid #e0e0e0'
                        }}>
                            <Typography
                                variant="body1"
                                sx={{
                                    whiteSpace: 'pre-wrap',
                                    wordBreak: 'break-word',
                                    lineHeight: 1.6
                                }}
                            >
                                {msg.content}
                            </Typography>
                            {isLoading && index === conversation.length - 1 && msg.role === 'assistant' && !msg.content && (
                                <Box sx={{ width: { xs: 200, sm: 300 } }}>
                                    <Skeleton variant="text" sx={{ fontSize: '1rem' }} />
                                    <Skeleton variant="text" sx={{ fontSize: '1rem', width: '80%' }} />
                                    <Skeleton variant="text" sx={{ fontSize: '1rem', width: '60%' }} />
                                </Box>
                            )}
                        </Box>
                    </Box>
                    );
                })}
                <div ref={messagesEndRef} />
            </Paper>

            {phase !== 'completed' && (
                <Box sx={{ mt: 3 }}>
                    <Stack direction="row" spacing={2} alignItems="flex-end">
                        <TextField
                            multiline
                            minRows={1}
                            maxRows={4}
                            placeholder="Type your answer here..."
                            fullWidth
                            variant="outlined"
                            value={userAnswer}
                            onChange={(e) => setUserAnswer(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSendAnswer();
                                }
                            }}
                            disabled={isLoading}
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: 3,
                                    backgroundColor: '#ffffff'
                                }
                            }}
                        />
                        <Button
                            variant="contained"
                            size="large"
                            color="primary"
                            sx={{
                                minWidth: 120,
                                height: 56,
                                fontWeight: 'bold',
                                borderRadius: 3,
                                boxShadow: '0 4px 12px rgba(25, 118, 210, 0.3)'
                            }}
                            onClick={handleSendAnswer}
                            endIcon={<IoMdSend />}
                            disabled={isLoading || !userAnswer.trim()}
                        >
                            Send
                        </Button>
                    </Stack>
                </Box>
            )}
        </Container>
    );
}

export default Interviewer;
