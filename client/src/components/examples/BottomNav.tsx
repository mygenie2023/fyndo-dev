import BottomNav from "../BottomNav";
import { Route, Switch } from "wouter";

export default function BottomNavExample() {
  return (
    <div className="h-screen flex flex-col">
      <Switch>
        <Route path="/dashboard">
          <div className="flex-1 flex items-center justify-center">
            <p className="text-muted-foreground">Dashboard Content</p>
          </div>
        </Route>
        <Route path="/jobs">
          <div className="flex-1 flex items-center justify-center">
            <p className="text-muted-foreground">Jobs Content</p>
          </div>
        </Route>
        <Route path="/profile">
          <div className="flex-1 flex items-center justify-center">
            <p className="text-muted-foreground">Profile Content</p>
          </div>
        </Route>
        <Route path="/more">
          <div className="flex-1 flex items-center justify-center">
            <p className="text-muted-foreground">More Content</p>
          </div>
        </Route>
        <Route>
          <div className="flex-1 flex items-center justify-center">
            <p className="text-muted-foreground">Select a tab</p>
          </div>
        </Route>
      </Switch>
      <BottomNav userType="farmer" />
    </div>
  );
}
