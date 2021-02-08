import { ListItem, ListItemIcon, ListItemText } from "@material-ui/core";
import React from "react";

function NavItem(props: { name: string; href: string; icon: React.ReactNode }) {
  const { icon, href, name } = props;

  return (
    <ListItem button component="a" href={href}>
      <ListItemIcon>{icon}</ListItemIcon>
      <ListItemText primary={name} />
    </ListItem>
  );
}

export default NavItem;
