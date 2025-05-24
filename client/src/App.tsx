import { BrowserRouter } from 'react-router-dom';
import QueryProvider from "./context/query-provider";
import { AuthProvider } from './context/auth-provider';
import Routes from './routes';

function App() {
  return (
    <QueryProvider>
      <BrowserRouter>
        <AuthProvider>
          <Routes />
        </AuthProvider>
      </BrowserRouter>
    </QueryProvider>
  );
}

export default App;
