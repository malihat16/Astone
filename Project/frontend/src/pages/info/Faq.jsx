import { Accordion, AccordionDetails, AccordionSummary, Typography } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Link as RouterLink } from 'react-router-dom';
import InfoPage from './InfoPage';
import { tokens } from '../../theme';

const FAQS = [
  ['What is your return policy?', 'You can return any item within 30 days of receiving it, in its original condition with tags attached.', { to: '/returnPolicy', label: 'Read the full return policy' }],
  ['How long does delivery take?', 'Orders usually arrive in 3–5 working days anywhere in Malaysia.'],
  ['Can I track my order?', 'Yes. Open "Your orders" from the account menu to see whether each item is still being prepared or has shipped.'],
  ['How do points work?', 'Every order earns 10% of what you pay back as points. At checkout, each point takes RM 1 off your order.'],
  ['How do I reset my password?', 'Use "Forgot password?" on the login page. We will email you a link that works for 24 hours.', { to: '/ForgotPassword', label: 'Reset your password' }],
  ['What payment methods do you accept?', 'We currently accept bank transfers only.'],
  ['How do I start selling?', 'Create a seller account, add your products with photos, and manage orders from the Seller Centre.', { to: '/sell', label: 'Sell on Astoné' }],
];

export default function Faq() {
  return (
    <InfoPage title="Questions & answers" intro="Quick answers about orders, delivery, returns and your account.">
      {FAQS.map(([question, answer, link]) => (
        <Accordion
          key={question}
          disableGutters
          elevation={0}
          sx={{ bgcolor: 'transparent', borderTop: `1px solid ${tokens.line}`, '&:before': { display: 'none' }, '&:last-of-type': { borderBottom: `1px solid ${tokens.line}` } }}
        >
          <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ px: 0, py: 0.5 }}>
            <Typography sx={{ fontWeight: 700, fontSize: '1.05rem' }}>{question}</Typography>
          </AccordionSummary>
          <AccordionDetails sx={{ px: 0, pt: 0, pb: 2.5 }}>
            <Typography color="text.secondary">{answer}</Typography>
            {link && (
              <Typography component={RouterLink} to={link.to} sx={{ display: 'inline-block', mt: 1, color: tokens.plum, fontWeight: 600 }}>
                {link.label}
              </Typography>
            )}
          </AccordionDetails>
        </Accordion>
      ))}
    </InfoPage>
  );
}
