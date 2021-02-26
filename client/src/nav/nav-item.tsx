import { ListItem, ListItemIcon, ListItemText } from "@material-ui/core";
import { Link } from "react-router-dom";
import React from "react";

function NavItem(props: { name: string; href: string; icon: React.ReactNode }) {
  const { icon, href, name } = props;

  return (
    <ListItem button component={Link} to={href}>
      <ListItemIcon>{icon}</ListItemIcon>
      <ListItemText primary={name} />
    </ListItem>
  );
}

export default NavItem;
