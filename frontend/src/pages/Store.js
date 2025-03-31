const Store = () => {
  const handleLogout = async (e) => {
    e.preventDefault();
    await fetch("http://localhost:3000/logout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    })
      .then((res) => res.json())
      .then((data) => console.log(data));
  };

  return (
    <>
      <h1>Store</h1>
      <a href="/" onClick={handleLogout} alt="logout">
        Logout
      </a>
    </>
  );
};

export default Store;
