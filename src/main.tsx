import React from 'react';
import ReactDOM from 'react-dom/client';
import AccessGate from '@/app/components/security/AccessGate';
import '@/styles/index.css';
import { installRuntimeErrorHandlers, renderBootError } from '@/app/platform/runtimeErrors';

const rootElement = document.getElementById('root');

const showBootError = (error: unknown) => renderBootError(rootElement, error);
const runtime = installRuntimeErrorHandlers(window, showBootError);
import.meta.hot?.dispose(() => runtime.dispose());

function RuntimeMounted({ children }: React.PropsWithChildren) {
  React.useLayoutEffect(() => runtime.markMounted(), []);
  return <>{children}</>;
}

if (!rootElement) {
  showBootError(new Error('Root element #root was not found.'));
} else {
  import('@/app/App')
    .then(({ default: App }) => {
      ReactDOM.createRoot(rootElement).render(
        <React.StrictMode>
          <RuntimeMounted><AccessGate><App /></AccessGate></RuntimeMounted>
        </React.StrictMode>
      );
    })
    .catch(showBootError);
}
