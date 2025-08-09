CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE todo (
    id INT PRIMARY KEY,
    title TEXT NOT NULL,
    user_id UUID UNIQUE,
    Foreign Key (user_id) REFERENCES users(id)
);

CREATE TABLE tasks (
    id INT PRIMARY KEY,
    todo_id INT UNIQUE NOT NULL,
    description TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    Foreign Key (todo_id) REFERENCES todo(id)
);
