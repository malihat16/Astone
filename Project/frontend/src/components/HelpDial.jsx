import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, IconButton, Paper, SpeedDial, SpeedDialAction, TextField, Typography } from '@mui/material';
import QuestionMarkIcon from '@mui/icons-material/QuestionMark';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import CloseIcon from '@mui/icons-material/Close';
import SendIcon from '@mui/icons-material/Send';
import { tokens } from '../theme';

const AUTO_REPLY =
  "Thanks for your message. Our team replies within one working day (Mon–Fri, 9am–6pm). For quick answers about delivery and returns, see the FAQ.";

function ChatBox({ onClose }) {
  const [messages, setMessages] = useState([{ from: 'astone', text: 'Hi! What can we help you with?' }]);
  const [draft, setDraft] = useState('');

  const send = (e) => {
    e.preventDefault();
    if (!draft.trim()) return;
    setMessages((m) => [...m, { from: 'you', text: draft.trim() }, { from: 'astone', text: AUTO_REPLY }]);
    setDraft('');
  };

  return (
    <Paper
      role="dialog"
      aria-label="Live chat"
      variant="outlined"
      sx={{ position: 'fixed', bottom: { xs: 0, sm: 96 }, right: { xs: 0, sm: 24 }, width: { xs: '100%', sm: 340 }, height: 420, display: 'flex', flexDirection: 'column', zIndex: 1300, boxShadow: '0 18px 50px rgba(29,23,38,0.18)' }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 2, py: 1.25, borderBottom: `1px solid ${tokens.line}` }}>
        <Typography sx={{ fontWeight: 700 }}>Chat with Astoné</Typography>
        <IconButton size="small" onClick={onClose} aria-label="Close chat">
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>
      <Box sx={{ flex: 1, overflowY: 'auto', p: 2, display: 'flex', flexDirection: 'column', gap: 1 }} aria-live="polite">
        {messages.map((m, i) => (
          <Box
            key={i}
            sx={{
              alignSelf: m.from === 'you' ? 'flex-end' : 'flex-start',
              maxWidth: '85%',
              px: 1.5,
              py: 1,
              borderRadius: 3,
              fontSize: 14,
              bgcolor: m.from === 'you' ? 'primary.main' : tokens.tile,
              color: m.from === 'you' ? '#fff' : 'text.primary',
            }}
          >
            {m.text}
          </Box>
        ))}
      </Box>
      <Box component="form" onSubmit={send} sx={{ display: 'flex', gap: 1, p: 1.5, borderTop: `1px solid ${tokens.line}` }}>
        <TextField size="small" fullWidth placeholder="Type a message" value={draft} onChange={(e) => setDraft(e.target.value)} inputProps={{ 'aria-label': 'Message' }} />
        <IconButton type="submit" color="primary" aria-label="Send message">
          <SendIcon />
        </IconButton>
      </Box>
    </Paper>
  );
}

export default function HelpDial() {
  const navigate = useNavigate();
  const [chatOpen, setChatOpen] = useState(false);
  const actions = [
    { icon: <HelpOutlineIcon />, name: 'FAQ', run: () => navigate('/faq') },
    { icon: <SupportAgentIcon />, name: 'Contact support', run: () => navigate('/support') },
    { icon: <ChatBubbleOutlineIcon />, name: 'Live chat', run: () => setChatOpen(true) },
  ];
  return (
    <>
      <SpeedDial
        ariaLabel="Help"
        icon={<QuestionMarkIcon />}
        sx={{ position: 'fixed', bottom: 24, right: 24 }}
        FabProps={{ size: 'medium', sx: { bgcolor: tokens.ink, '&:hover': { bgcolor: tokens.plum } } }}
      >
        {actions.map((a) => (
          <SpeedDialAction key={a.name} icon={a.icon} tooltipTitle={a.name} onClick={a.run} />
        ))}
      </SpeedDial>
      {chatOpen && <ChatBox onClose={() => setChatOpen(false)} />}
    </>
  );
}
