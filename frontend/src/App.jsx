import React from 'react';
import { AuthProvider } from './controllers/auth.controller';
import { AppRouter } from './routers/AppRouter';

export function App() {
  return (
    <AuthProvider>
      <AppRouter />
    </AuthProvider>
  );
}

export default App;
