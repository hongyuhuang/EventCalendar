-- lets go chatgpt

-- Inserting data into the USER table
INSERT INTO USER (firstName, lastName, isAdmin, email, password) VALUES
('John', 'Doe', true, 'johndoe@email.com', 'password123'),
('Jane', 'Smith', false, 'janesmith@email.com', 'password456'),
('Mark', 'Johnson', true, 'markjohnson@email.com', 'password789');

-- Inserting data into the EVENT table
INSERT INTO EVENT (title, location, startDate, endDate, description) VALUES
('Company Picnic', 'Central Park', '2023-07-15', '2023-07-15', 'Annual company picnic for all employees.'),
('Sales Conference', 'New York Marriott Marquis', '2023-09-12', '2023-09-14', 'Sales conference for all regional managers.'),
('Product Launch', 'Jacob K. Javits Convention Center', '2024-03-01', '2024-03-02', 'Launch of new product line at the convention center.');

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
(1, '2023-07-15', '2023-07-15', 'Lunch', 'Enjoy food and drinks with colleagues.'),
(1, '2023-07-15', '2023-07-15', 'Games', 'Play games and participate in team-building activities.'),
(2, '2023-09-12', '2023-09-12', 'Keynote Speech', 'Hear from the CEO about the company vision.'),
(2, '2023-09-13', '2023-09-13', 'Breakout Sessions', 'Participate in workshops and networking sessions.'),
(3, '2024-03-01', '2024-03-01', 'Product Demo', 'Get a firsthand look at the new product line.'),
(3, '2024-03-02', '2024-03-02', 'Q&A Session', 'Ask questions and provide feedback to the product development team.');