CREATE DATABASE hotel;
USE hotel;

CREATE TABLE admin (
  username VARCHAR(20) PRIMARY KEY,
  password VARCHAR(20) NOT NULL
);

INSERT INTO admin VALUES ('admin', 'admin123');

CREATE TABLE food (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(40),
  price INT,
  image VARCHAR(255)
);
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(50),
  email VARCHAR(50) UNIQUE,
  password VARCHAR(50)
);

