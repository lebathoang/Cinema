import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { clearStoredUser } from "@/lib/userStorage";

// Force a fresh login every time the app is opened or reloaded.
localStorage.removeItem("token");
clearStoredUser();

createRoot(document.getElementById("root")!).render(<App />);
