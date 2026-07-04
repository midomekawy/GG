import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';

const PROVIDER_LABELS = {
  github: 'GitHub',
  google: 'Google',
};

const ConnectedAppsCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const status = searchParams.get('status');
    const provider = (searchParams.get('provider') || '').toLowerCase();
    const error = searchParams.get('error');
    const message = searchParams.get('message');

    if (status === 'success') {
      const providerLabel = PROVIDER_LABELS[provider] || provider || 'the app';
      toast.success(`Successfully connected to ${providerLabel}.`);
      navigate('/settings/integrations', { replace: true });
      return;
    }

    if (status === 'error' || error) {
      const fallbackMessage = message || error || 'Unable to complete the connection.';
      toast.error(`Connection failed: ${fallbackMessage}`);
      navigate('/settings/integrations', { replace: true });
      return;
    }

    navigate('/settings/integrations', { replace: true });
  }, [navigate, searchParams]);

  return <div style={{ padding: '2rem', color: '#64748b' }}>Processing integration handshake...</div>;
};

export default ConnectedAppsCallback;
