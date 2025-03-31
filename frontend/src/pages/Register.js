import "./Register.css";
import { useState } from "react";
import { useNavigate } from "react-router";
import Navbar from "../components/Navbar";

const Register = () => {
  const [userName, setUsername] = useState("");
  const [password1, setPassword1] = useState("");
  const [password2, setPassword2] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const navigate = useNavigate();

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
    try {
      const registerUrl = "http://localhost:3000/register";
      await fetch(registerUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(user),
      })
        .then((res) => res.json())
        .then((data) => console.log(data));
    } catch (err) {
      return err;
    }
    try {
      const loginUrl = "http://localhost:3000/login";
      await fetch(loginUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: userName,
          password: password1,
        }),
      }).then((res) => {
        if (!res.ok) {
          throw Error("Error logging in.");
        }
        navigate("/store");
      });
    } catch (err) {
      console.log(err);
      return null;
    }
  };

  return (
    <>
      <Navbar />
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
