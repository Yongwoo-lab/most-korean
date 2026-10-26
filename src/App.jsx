import { useEffect, useState } from "react";
import { currentProfile, useStore } from "./lib/store.js";
import { stop } from "./lib/speech.js";
import Profiles from "./screens/Profiles.jsx";
import Home from "./screens/Home.jsx";
import Unit from "./screens/Unit.jsx";
import Tutor from "./screens/Tutor.jsx";
import Words from "./screens/Words.jsx";
import Teacher from "./screens/Teacher.jsx";

// Screens are kept in the URL hash so the browser back button works on
// tablets: #home, #unit/B4, #tutor ...
function parse() {
  const [screen, id] = (location.hash.slice(1) || "").split("/");
  return { screen: screen || "home", id };
}

export default function App() {
  const s = useStore();
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
  const screen = !p && route.screen !== "teacher" ? "profiles" : route.screen;

  return (
    <div className="app" key={p?.id || "none"}>
      {screen === "profiles" && <Profiles go={go} />}
      {screen === "home" && <Home go={go} />}
      {screen === "unit" && <Unit key={route.id} id={route.id} go={go} />}
      {screen === "tutor" && <Tutor go={go} />}
      {screen === "words" && <Words go={go} />}
      {screen === "teacher" && <Teacher go={go} />}
    </div>
  );
}
