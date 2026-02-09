import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: "https://582dd74b6778b7f10f02c28b071ad942@o4510702087307264.ingest.us.sentry.io/4510702093729792",
  
  sendDefaultPii: true,
 
  tracesSampleRate: 1.0,
   integrations: [
    Sentry.replayIntegration()
  ],

  replaysSessionSampleRate: 0.1, 
  replaysOnErrorSampleRate: 1.0 

});


const rootElement = document.getElementById('root');
if (rootElement) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <Sentry.ErrorBoundary fallback={"An error has occurred"}>
      <App />
      </Sentry.ErrorBoundary>
    </React.StrictMode>
  );
}