import './App.css';

import { SignIn } from './pages/signin/signin';
import { SignUp } from './pages/signup/signup';
import { Dashboard } from './pages/dashboard/dashboard';
import { PrivateRoute } from './routes/private-route';
import { Route, Routes } from 'react-router';

export const App = () => {
  return (
    <Routes>
      <Route path="/" element={<SignIn />} />
      <Route path="/signup" element={<SignUp />} />
      <Route element={<PrivateRoute />}>
        <Route path="/dashboard" element={<Dashboard />} />
      </Route>
    </Routes>
  );
};