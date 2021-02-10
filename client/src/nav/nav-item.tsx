import { ListItem, ListItemIcon, ListItemText } from "@material-ui/core";
import React from "react";
import { Link } from "react-router-dom";

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
