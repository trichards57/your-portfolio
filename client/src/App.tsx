import { Route, BrowserRouter as Router, Switch } from "react-router-dom";
import { Auth0Provider } from "@auth0/auth0-react";
import React from "react";
import AddJob from "./add-job";
import AddShift from "./add-shift";
import EditShift from "./edit-shift";
import Home from "./home";
import Landing from "./landing";
import Shifts from "./shifts";

function App() {
  return (
    <Auth0Provider
      domain="tr-toolbox.eu.auth0.com"
      clientId="BaYjw4rJJQONsdFN7Vxd6Km9Z38rFUKR"
      redirectUri={`${window.location.origin}/home`}
    >
      <Router>
        <Switch>
          <Route path="/home">
            <Home />
          </Route>
          <Route path="/shifts">
            <Shifts />
          </Route>
          <Route path="/addShift">
            <AddShift />
          </Route>
          <Route path="/addJob">
            <AddJob />
          </Route>
          <Route path="/editShift/:id">
            <EditShift />
          </Route>
          <Route exact path="/">
            <Landing />
          </Route>
        </Switch>
      </Router>
    </Auth0Provider>
  );
}

export default App;
