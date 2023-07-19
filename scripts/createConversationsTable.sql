CREATE TABLE conversations (
    Id INT AUTO_INCREMENT PRIMARY KEY,
    User1Id INT,
    User2Id INT,
    FOREIGN KEY (User1Id) REFERENCES Users(Id),
    FOREIGN KEY (User2Id) REFERENCES Users(Id)
);
