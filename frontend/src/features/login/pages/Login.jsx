import React from "react";

export function Login() {
  return (
    <div>
      <h1>Login</h1>
      <a
        href="http://localhost:3000/auth/google_oauth2"
        style={{
          padding: "10px 20px",
          backgroundColor: "#4285F4",
          color: "white",
          borderRadius: "5px",
          textDecoration: "none"
        }}
      >
        Login with Google
      </a>
    </div>
  );
}

