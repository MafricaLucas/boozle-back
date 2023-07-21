CREATE TABLE PasswordResetToken (
    Id INT AUTO_INCREMENT PRIMARY KEY,
    Token VARCHAR(255) NOT NULL,
    UserId INT,
    TimeStamp DATETIME,
    FOREIGN KEY (UserId) REFERENCES Users(Id)
);