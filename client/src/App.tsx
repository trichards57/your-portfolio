import { Auth0Provider } from "@auth0/auth0-react";
import React from "react";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import Landing from "./landing";

function App() {
  return (
    <Auth0Provider
      domain="tr-toolbox.eu.auth0.com"
      clientId="BaYjw4rJJQONsdFN7Vxd6Km9Z38rFUKR"
      redirectUri={window.location.origin}
    >
      <Router>
        <Switch>
          <Route exact path="/">
            <Landing />
          </Route>
        </Switch>
      </Router>
    </Auth0Provider>
  );
}

export default App;
