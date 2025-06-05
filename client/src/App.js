import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import './App.css';
import AllRoutes from './routes/allroutes';
import { LoginProvider } from './LoginContext'; 

function App() {
  return (
    <BrowserRouter>
      <LoginProvider> 
        <AllRoutes />
      </LoginProvider>
    </BrowserRouter>
  );
}

export default App;
