import React, { useState } from "react";

function Login({ onLogin, userType ,setUsernameForResults}) {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    const handleLogin = () => {
        // Determine the login endpoint based on the user type
        const loginEndpoint = userType === 'teacher' ? '/login_teacher' : '/login_student';
        setUsernameForResults(username);
        // Handle login logic
        fetch(loginEndpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password }),
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                onLogin();
            } else {
                alert("Login failed. Please try again.");
            }
        });
    };

    return (
        <div className="login-container">
            <h1>Login</h1>
            <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
            />
            <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
            />
            <button onClick={handleLogin}>Login</button>
        </div>
    );
}
 
export default Login;
