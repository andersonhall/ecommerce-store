import "./Register.css";
import { useState } from "react";

const Register = () => {
  const [userName, setUsername] = useState("");
  const [password1, setPassword1] = useState("");
  const [password2, setPassword2] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password1 !== password2) {
      console.log("passwords must match");
      return;
    }
    const user = {
      username: userName,
      password: password1,
      first_name: firstName,
      last_name: lastName,
    };
    const url = "http://localhost:3000/register";
    try {
      await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(user),
      })
        .then((res) => res.json())
        .then((data) => {
          console.log(data);
        });
    } catch (err) {
      console.log(err);
      return null;
    }
  };

  return (
    <>
      <h1>Register</h1>
      <form onSubmit={handleSubmit}>
        <label htmlFor="username">Username:</label>
        <input
          required
          type="text"
          id="username"
          name="username"
          onChange={(e) => setUsername(e.target.value)}
        />
        <label htmlFor="firstName">First Name:</label>
        <input
          required
          type="text"
          id="firstName"
          name="firstName"
          onChange={(e) => setFirstName(e.target.value)}
        />
        <label htmlFor="lastName">Last Name:</label>
        <input
          required
          type="text"
          id="lastName"
          name="lastName"
          onChange={(e) => setLastName(e.target.value)}
        />
        <label htmlFor="password1">Password:</label>
        <input
          required
          type="password"
          id="password1"
          name="password1"
          onChange={(e) => setPassword1(e.target.value)}
        />
        <label htmlFor="password2">Confirm Password:</label>
        <input
          required
          type="password"
          id="password2"
          name="password2"
          onChange={(e) => setPassword2(e.target.value)}
        />
        <input type="submit" />
      </form>
    </>
  );
};

export default Register;
