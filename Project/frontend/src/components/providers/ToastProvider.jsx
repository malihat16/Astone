import { useCallback, useMemo, useState } from 'react';
import { Alert, Snackbar } from '@mui/material';
import { ToastContext } from '../../lib/contexts';

export default function ToastProvider({ children }) {
  const [toast, setToast] = useState(null);

  const show = useCallback((message, severity = 'success') => {
    setToast({ message, severity, key: Date.now() });
  }, []);

  const value = useMemo(
    () => ({
      success: (message) => show(message, 'success'),
      error: (message) => show(message, 'error'),
      info: (message) => show(message, 'info'),
    }),
    [show],
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <Snackbar
        key={toast?.key}
        open={Boolean(toast)}
        autoHideDuration={4000}
        onClose={(_, reason) => reason !== 'clickaway' && setToast(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        {toast ? (
          <Alert severity={toast.severity} variant="filled" onClose={() => setToast(null)} sx={{ minWidth: 280 }}>
            {toast.message}
          </Alert>
        ) : undefined}
      </Snackbar>
    </ToastContext.Provider>
  );
}
