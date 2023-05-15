CREATE TABLE RECURRING_EVENT_SUFFIX(
    recurringEventSuffixId INT NOT NULL AUTO_INCREMENT,
    eventId INT NOT NULL,
    type VARCHAR(20) NOT NULL,
    endRecurringDate DATETIME NOT NULL,
    PRIMARY KEY (recurringEventSuffixId),
    FOREIGN KEY (eventId) REFERENCES EVENT(eventId)
);

CREATE TABLE RECURRING_EVENT(
    recurringEventId INT NOT NULL AUTO_INCREMENT,
    recurringEventSuffixId INT NOT NULL,
    startDate DATETIME NOT NULL,
    endDate DATETIME NOT NULL,
    PRIMARY KEY (recurringEventId),
    FOREIGN KEY (recurringEventSuffixId) REFERENCES RECURRING_EVENT_SUFFIX(recurringEventSuffixId)
);