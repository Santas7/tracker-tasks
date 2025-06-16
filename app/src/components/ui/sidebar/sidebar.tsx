import { useState, useEffect } from "react";
import { IconLogout } from "@tabler/icons-react";
import { Code, Group } from "@mantine/core";
import { MantineLogo } from "@mantinex/mantine-logo";
import { NavLink, useLocation } from "react-router";
import classes from "./sidebar.module.css";
import { data } from "../../../core/utils/sidebar/data";
import { useAppDispatch } from "../../../core/store/hooks";
import { useNavigate } from "react-router";
import { logout } from "../../../core/store/slices/auth-slice";

export const Sidebar = () => {
  const location = useLocation();
  const [active, setActive] = useState("Главная");
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    const currentItem = data.find((item) => item.link === location.pathname);
    setActive(currentItem ? currentItem.label : "Главная");
  }, [location.pathname]);

  const links = data.map((item) => (
    <NavLink
      to={item.link}
      className={({ isActive }) =>
        `${classes.link} ${isActive ? classes.active : ""}`
      }
      key={item.label}
      onClick={() => setActive(item.label)}
      data-active={item.label === active || undefined}
    >
      <item.icon className={classes.linkIcon} stroke={1.5} />
      <span>{item.label}</span>
    </NavLink>
  ));

  const handleLogout = () => {
    dispatch(logout());
    navigate("/");
  };

  return (
    <nav className={classes.navbar}>
      <div className={classes.navbarMain}>
        <Group className={classes.header} justify="space-between">
          <MantineLogo size={28} />
          <Code fw={700}>v1.0</Code>
        </Group>

        {links}
      </div>
      <div className={classes.footer}>
        <a
          href="#"
          className={classes.link}
          onClick={(event) => {
            event.preventDefault();
            handleLogout();
          }}
        >
          <IconLogout className={classes.linkIcon} stroke={1.5} />
          <span>Выйти</span>
        </a>
      </div>
    </nav>
  );
};
