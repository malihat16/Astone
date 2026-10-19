import { useState } from 'react';
import { IconButton, InputAdornment, TextField } from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

export default function PasswordField(props) {
  const [show, setShow] = useState(false);
  return (
    <TextField
      type={show ? 'text' : 'password'}
      fullWidth
      {...props}
      InputProps={{
        endAdornment: (
          <InputAdornment position="end">
            <IconButton aria-label={show ? 'Hide password' : 'Show password'} onClick={() => setShow((s) => !s)} edge="end">
              {show ? <VisibilityOff /> : <Visibility />}
            </IconButton>
          </InputAdornment>
        ),
      }}
    />
  );
}
