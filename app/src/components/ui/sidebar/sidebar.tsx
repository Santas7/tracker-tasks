import { useState } from 'react';
import { IconLogout } from '@tabler/icons-react';
import { Code, Group } from '@mantine/core';
import { MantineLogo } from '@mantinex/mantine-logo';
import classes from './sidebar.module.css';

import { data } from '../../../core/utils/sidebar/data';
import { useAppDispatch } from '../../../core/store/hooks';
import { useNavigate } from 'react-router';
import { logout } from '../../../core/store/slices/auth-slice';

export const Sidebar = () => {
  const [active, setActive] = useState('Billing');
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const links = data.map((item) => (
    <a
      className={classes.link}
      data-active={item.label === active || undefined}
      href={item.link}
      key={item.label}
      onClick={(event) => {
        event.preventDefault();
        setActive(item.label);
      }}
    >
      <item.icon className={classes.linkIcon} stroke={1.5} />
      <span>{item.label}</span>
    </a>
  ));

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  }

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
        <a href="#" className={classes.link} onClick={(event) => {
          event.preventDefault();
          handleLogout();
        }}>
          <IconLogout className={classes.linkIcon} stroke={1.5} />
          <span>Выйти</span>
        </a>
      </div>
    </nav>
  );
}