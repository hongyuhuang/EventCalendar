-- Inserting data into the USER table
INSERT INTO USER (firstName, lastName, isAdmin, email, password) VALUES
('John', 'Doe', true, 'johndoe@email.com', 'password123'),
('Jane', 'Smith', false, 'janesmith@email.com', 'password456'),
('Mark', 'Johnson', true, 'markjohnson@email.com', 'password789');

-- Inserting data into the EVENT table
INSERT INTO EVENT (title, location, startDate, endDate, description) VALUES
('Company Picnic', 'Central Park', '2023-04-15 11:00:00', '2023-04-15 17:00:00', 'Annual company picnic for all employees.'),
('Sales Conference', 'New York Marriott Marquis', '2023-04-12 09:00:00', '2023-04-14 11:00:00', 'Sales conference for all regional managers.'),
('Product Launch', 'Jacob K. Javits Convention Center', '2024-04-01 05:00:00', '2024-04-02 07:00:00', 'Launch of new product line at the convention center.');

-- Inserting data into the ATTENDANCE_RECORD table
INSERT INTO ATTENDANCE_RECORD (userId, eventId) VALUES
(1, 1),
(2, 1),
(3, 1),
(1, 2),
(2, 2),
(3, 3);

-- Inserting data into the EVENT_SCHEDULE_ITEM table
INSERT INTO EVENT_SCHEDULE_ITEM (eventId, startDate, endDate, activity, description) VALUES
(1, '2023-07-15T11:00:00.000Z', '2023-07-15T12:00:00.000Z', 'Lunch', 'Enjoy food and drinks with colleagues.'),
(1, '2023-07-15T12:00:00.000Z', '2023-07-15T13:00:00.000Z', 'Games', 'Play games and participate in team-building activities.'),
(2, '2023-09-12T09:00:00.000Z', '2023-09-12T10:30:00.000Z', 'Keynote Speech', 'Hear from the CEO about the company vision.'),
(2, '2023-09-12T10:30:00.000Z', '2023-09-12T12:00:00.000Z', 'Breakout Sessions', 'Participate in workshops and networking sessions.'),
(2, '2023-09-13T09:00:00.000Z', '2023-09-13T10:30:00.000Z', 'Keynote Speech', 'Hear from industry experts about the latest trends.'),
(2, '2023-09-13T10:30:00.000Z', '2023-09-13T12:00:00.000Z', 'Breakout Sessions', 'Participate in workshops and networking sessions.'),
(3, '2024-03-01T09:00:00.000Z', '2024-03-01T10:30:00.000Z', 'Product Demo', 'Get a firsthand look at the new product line.')