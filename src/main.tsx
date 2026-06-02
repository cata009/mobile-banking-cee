import React from 'react';
import ReactDOM from 'react-dom/client';
import '@/styles/index.css';

const rootElement = document.getElementById('root');

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function renderBootError(error: unknown) {
  const message = error instanceof Error ? `${error.name}: ${error.message}` : String(error);
  const stack = error instanceof Error && error.stack ? error.stack : "";

  if (!rootElement) return;

  rootElement.innerHTML = `
    <div style="font-family: monospace; padding: 24px; color: #262626; background: #fff;">
      <h1 style="font-size: 18px; margin: 0 0 12px;">App boot error</h1>
      <pre style="white-space: pre-wrap; font-size: 13px;">${escapeHtml(message)}\n\n${escapeHtml(stack)}</pre>
    </div>
  `;
}

window.addEventListener('error', (event) => renderBootError(event.error ?? event.message));
window.addEventListener('unhandledrejection', (event) => renderBootError(event.reason));

if (!rootElement) {
  renderBootError(new Error('Root element #root was not found.'));
} else {
  import('@/app/App')
    .then(({ default: App }) => {
      ReactDOM.createRoot(rootElement).render(
        <React.StrictMode>
          <App />
        </React.StrictMode>
      );
    })
    .catch(renderBootError);
}
