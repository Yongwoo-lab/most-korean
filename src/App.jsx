import { useEffect, useState } from "react";
import { currentProfile, useStore } from "./lib/store.js";
import { stop } from "./lib/speech.js";
import Profiles from "./screens/Profiles.jsx";
import Home from "./screens/Home.jsx";
import Unit from "./screens/Unit.jsx";
import Tutor from "./screens/Tutor.jsx";
import Words from "./screens/Words.jsx";
import Teacher from "./screens/Teacher.jsx";
import Login from "./screens/Login.jsx";
import Center from "./screens/Center.jsx";
import Parent from "./screens/Parent.jsx";
import { useCloud } from "./lib/cloud.js";

// Screens are kept in the URL hash so the browser back button works on
// tablets: #home, #unit/B4, #tutor ...
function parse() {
  const [screen, id] = (location.hash.slice(1) || "").split("/");
  return { screen: screen || "home", id };
}

export default function App() {
  const s = useStore();
  const cloud = useCloud();
  const [route, setRoute] = useState(parse);
  useEffect(() => {
    const on = () => {
      stop();
      setRoute(parse());
    };
    addEventListener("hashchange", on);
    return () => removeEventListener("hashchange", on);
  }, []);
  const go = (screen, params = {}) => {
    location.hash = params.id ? `${screen}/${params.id}` : screen;
  };
  const p = currentProfile(s);
  const role = cloud.account?.role;
  // Teachers and parents have their own screens. Without a student profile
  // the app asks to log in, or the local "try without login" profiles.
  let screen = route.screen;
  if (role === "teacher") screen = "center";
  else if (role === "guardian") screen = "parent";
  else if (!p && !["profiles", "teacher"].includes(screen)) screen = "login";

  if (!cloud.ready && !p) return <div className="app" />;

  return (
    <div className="app" key={p?.id || "none"}>
      {screen === "login" && <Login go={go} />}
      {screen === "center" && <Center go={go} />}
      {screen === "parent" && <Parent go={go} />}
      {screen === "profiles" && <Profiles go={go} />}
      {screen === "home" && <Home go={go} />}
      {screen === "unit" && <Unit key={route.id} id={route.id} go={go} />}
      {screen === "tutor" && <Tutor go={go} />}
      {screen === "words" && <Words go={go} />}
      {screen === "teacher" && <Teacher go={go} />}
    </div>
  );
}
