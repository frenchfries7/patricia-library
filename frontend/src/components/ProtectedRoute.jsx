import { Navigate } from "react-router-dom";
import { STORAGE } from "../config/api";

export default function ProtectedRoute({ children }) {
  return localStorage.getItem(STORAGE.token) ? (
    children
  ) : (
    <Navigate to="/login" replace />
  );
}
