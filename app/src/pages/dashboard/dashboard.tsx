import { Outlet } from "react-router";
import { Sidebar } from "../../components/ui/sidebar/sidebar";
import classes from "./dashboard.module.css";

export const Dashboard = () => {
  return (
    <div className={classes.container}>
      <Sidebar />
      <main className={classes.main}>
        <Outlet />
      </main>
    </div>
  );
};
