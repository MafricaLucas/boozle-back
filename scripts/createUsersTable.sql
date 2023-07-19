CREATE TABLE Users (
    Id INT AUTO_INCREMENT PRIMARY KEY,
    Email VARCHAR(255) NOT NULL,
    Password VARCHAR(255) NOT NULL,
    Pseudo VARCHAR(255) NOT NULL,
    UNIQUE (Email)
);