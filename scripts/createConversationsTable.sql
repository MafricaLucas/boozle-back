CREATE TABLE conversations (
    Id INT AUTO_INCREMENT PRIMARY KEY,
    User1Id INT,
    User2Id INT,
    FOREIGN KEY (User1Id) REFERENCES users(Id),
    FOREIGN KEY (User2Id) REFERENCES users(Id)
);
