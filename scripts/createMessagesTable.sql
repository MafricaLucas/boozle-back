CREATE TABLE Messages (
    Id INT AUTO_INCREMENT PRIMARY KEY,
    ConversationId INT,
    SenderId INT,
    Message TEXT,
    TimeStamp DATETIME,
    IsRead BOOLEAN DEFAULT 0,
    FOREIGN KEY (ConversationId) REFERENCES Conversations(Id),
    FOREIGN KEY (SenderId) REFERENCES Users(Id)
);
