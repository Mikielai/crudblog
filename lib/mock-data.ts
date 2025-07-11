export const posts = [
  {
    id: "post_1",
    title: "Welcome to My Blog",
    content: "<h1>Hello World!</h1><p>This is my first post.</p>",
    authorId: "user_1",
    author: {
      id: "user_1",
      email: "jane.doe@example.com",
      firstName: "Jane",
      lastName: "Doe",
      profileImage: "https://example.com/jane.jpg",
      createdAt: new Date("2024-01-01T10:00:00Z"),
      updatedAt: new Date("2024-01-01T10:00:00Z"),
    },
    createdAt: new Date("2024-03-01T12:00:00Z"),
    updatedAt: new Date("2024-03-01T12:00:00Z"),
  },
  {
    id: "post_2",
    title: "Thoughts on Learning",
    content:
      "<h2>Never Stop Learning</h2><p>Learning is a continuous journey. Embrace it!</p>",
    authorId: "user_2",
    author:   {
      id: "user_2",
      email: "john.smith@example.com",
      firstName: "John",
      lastName: "Smith",
      profileImage: "https://example.com/john.jpg",
      createdAt: new Date("2024-02-01T10:00:00Z"),
      updatedAt: new Date("2024-02-01T10:00:00Z"),
    },
    createdAt: new Date("2024-03-05T14:30:00Z"),
    updatedAt: new Date("2024-03-05T14:30:00Z"),
  },
];