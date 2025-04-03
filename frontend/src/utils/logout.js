export const logout = async (e) => {
  e.preventDefault();
  await fetch("http://localhost:3000/logout", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  })
    .then((res) => res.json())
    .then((data) => {
      console.log(data);
    });
};
