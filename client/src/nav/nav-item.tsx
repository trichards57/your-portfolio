import { ListItem, ListItemIcon, ListItemText } from "@material-ui/core";
import { Link } from "react-router-dom";
import React from "react";

function NavItem(props: { href: string; icon: React.ReactNode; name: string }) {
  const { icon, href, name } = props;

  return (
    <ListItem button component={Link} to={href}>
      <ListItemIcon>{icon}</ListItemIcon>
      <ListItemText primary={name} />
    </ListItem>
  );
}

export default NavItem;
