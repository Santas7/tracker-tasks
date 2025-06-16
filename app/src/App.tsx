import './App.css';

import { SignIn } from './pages/signin/signin';
import { SignUp } from './pages/signup/signup';
import { Dashboard } from './pages/dashboard/dashboard';
import { PrivateRoute } from './routes/private-route';
import { Route, Routes } from 'react-router';
import { Tasks } from './components/ui/tasks/tasks';
import { Groups } from './components/ui/groups/groups';
import { Profile } from './components/ui/profile/profile';

export const App = () => (
  <Routes>
    <Route path="/" element={<SignIn />} />
    <Route path="/signup" element={<SignUp />} />
    <Route element={<PrivateRoute />}>
      <Route path="/dashboard" element={<Dashboard />}>
        <Route path="tasks" element={<Tasks />} />
        <Route path="groups" element={<Groups />} />
        {/* <Route path="users" element={<Users />} /> */}
        <Route path="profile" element={<Profile />} />
        <Route index element={<Tasks />} />
      </Route>
    </Route>
  </Routes>
);