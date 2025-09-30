export const fetchUsers = async () => {
  try {
    const response = await fetch("https://jsonplaceholder.typicode.com/users");
    const data = await response.json();

    // Add fake "type" for demo
    return data.map((u: any) => ({
      id: String(u.id),
      name: u.name,
      username: u.username,
      email: u.email,
      phone: u.phone,
      company: u.company.name,
      type: u.id % 3 === 0 ? "admin" : u.id % 3 === 1 ? "member" : "guest", // fake types
    }));
  } catch (error) {
    console.error("Error fetching users:", error);
    return [];
  }
};
