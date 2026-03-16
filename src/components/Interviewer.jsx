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
    LinearProgress
} from '@mui/material';
import { IoMdSend } from "react-icons/io";
import { useGetAIResponse } from '../hooks/useGetAIResponse';

const TOPICS = [
    "JavaScript Fundamentals",
    "React.js & Front-End",
    "Node.js & Backend",
    "System Design",
    "Data Structures & Algorithms"
];

const TOTAL_QUESTIONS = 20;

function Interviewer() {
    const [phase, setPhase] = useState('selection'); // 'selection' | 'interviewing' | 'completed'
    const [selectedTopic, setSelectedTopic] = useState('');
    const [conversation, setConversation] = useState([]);
    const [userAnswer, setUserAnswer] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [questionCount, setQuestionCount] = useState(0);
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

        // Initial prompt to start the interview
        const prompt = `We are starting a mock technical interview. The topic is "${topic}". You are the interviewer. I am the candidate.
This will be a ${TOTAL_QUESTIONS}-question interview.
Please ask me the first question about ${topic}. Limit your response to just the question itself. Wait for my response before proceeding.`;

        await sendToAI(prompt, true);
    };

    const handleSendAnswer = async () => {
        if (!userAnswer.trim()) return;

        const currentAnswer = userAnswer;
        setUserAnswer("");
        const nextCount = questionCount + 1;

        // Add user's answer to the conversation UI
        setConversation(prev => [
            ...prev,
            { role: 'user', content: currentAnswer }
        ]);

        let prompt = "";
        if (nextCount > TOTAL_QUESTIONS) {
            prompt = `Here is my answer to the final question: "${currentAnswer}". 
Please evaluate my final answer briefly, and then provide a comprehensive summary of how I did in this interview overall since we have reached the ${TOTAL_QUESTIONS} question limit.`;
            setPhase('completed');
        } else {
            prompt = `Here is my answer: "${currentAnswer}". 
Please briefly evaluate my answer in 1-2 sentences. Then, explicitly state "Question ${nextCount} of ${TOTAL_QUESTIONS}:" and ask the next question about ${selectedTopic}.`;
            setQuestionCount(nextCount);
        }

        await sendToAI(prompt, false);
    };

    const sendToAI = async (promptText, isInitial = false) => {
        setIsLoading(true);

        if (!isInitial) {
            // Add empty assistant message for streaming
            setConversation(prev => [...prev, { role: 'assistant', content: '' }]);
        } else {
            setConversation([{ role: 'assistant', content: '' }]);
        }

        try {
            // Reusing the existing hook - assuming it accepts text streams back
            // Using English by default for technical interviews
            await useGetAIResponse(promptText, 'en', (text) => {
                setConversation(prev => {
                    const newHistory = [...prev];
                    newHistory[newHistory.length - 1] = { role: 'assistant', content: text };
                    return newHistory;
                });
            }, '/api/interview');
        } catch (error) {
            console.error("AI Error:", error);
            setConversation(prev => {
                const newHistory = [...prev];
                newHistory[newHistory.length - 1] = { role: 'assistant', content: "Sorry, I encountered an error. Could you try answering again?" };
                return newHistory;
            });
            // Rollback question count if it failed
            if (!isInitial && questionCount <= TOTAL_QUESTIONS) {
                setQuestionCount(prev => prev - 1);
            }
        } finally {
            setIsLoading(false);
        }
    };

    const resetInterview = () => {
        setPhase('selection');
        setSelectedTopic('');
        setConversation([]);
        setQuestionCount(0);
        setUserAnswer('');
    };

    if (phase === 'selection') {
        return (
            <Container maxWidth="md" sx={{ pt: 10, pb: 4 }}>
                <Typography variant="h4" fontWeight="bold" align="center" gutterBottom>
                    Technical Interview Practice
                </Typography>
                <Typography variant="body1" align="center" color="textSecondary" sx={{ mb: 6 }}>
                    Select a topic below to begin a {TOTAL_QUESTIONS}-question mock interview.
                </Typography>

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
                {conversation.map((msg, index) => (
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
                ))}
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
