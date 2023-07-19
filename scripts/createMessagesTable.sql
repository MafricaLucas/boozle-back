CREATE TABLE messages (
    Id INT AUTO_INCREMENT PRIMARY KEY,
    ConversationId INT,
    SenderId INT,
    Message TEXT,
    TimeStamp DATETIME,
    IsRead BOOLEAN DEFAULT 0,
    FOREIGN KEY (ConversationId) REFERENCES conversations(Id),
    FOREIGN KEY (SenderId) REFERENCES users(Id)
);
