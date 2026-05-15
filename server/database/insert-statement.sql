INSERT INTO boards (title) VALUES 
('Platform Launch'),
('Marketing Plan'),
('Roadmap');

INSERT INTO columns (title, "order", board_id) VALUES 
-- Platform Launch (Board 1)
('Todo', 0, 1), ('Doing', 1, 1), ('Done', 2, 1),
-- Marketing Plan (Board 2)
('Todo', 0, 2), ('Doing', 1, 2), ('Done', 2, 2),
-- Roadmap (Board 3)
('Now', 0, 3), ('Next', 1, 3), ('Later', 2, 3);

-- إضافة عينة من المهام للوحة الأولى (Platform Launch)
INSERT INTO tasks (id, title, description, "order", column_id) VALUES 
(1, 'Build UI for onboarding flow', '', 0, 1),
(2, 'Build UI for search', '', 1, 1),
(3, 'Build settings UI', '', 2, 1),
(4, 'Design settings and search pages', '', 0, 2),
(5, 'Add account management endpoints', '', 1, 2),

-- مهام عمود Doing في لوحة Platform Launch (Column ID: 2)
(6,'Design settings and search pages', '', 0, 2),
(7,'Add account management endpoints', '', 1, 2),
(8,'Design onboarding flow', '', 2, 2),

-- مهام عمود Done في لوحة Platform Launch (Column ID: 3)
(9,'Conduct 5 wireframe tests', 'Ensure the layout continues to make sense...', 0, 3),
(10,'Market discovery', 'We need to define and refine our core product...', 1, 3);

-- إضافة المهام الفرعية وربطها بالمهام عبر الـ taskId
INSERT INTO subtasks (id,title, is_completed, task_id) VALUES 
-- للمهمة رقم 1
(1,'Sign up page', true, 1),
(2,'Sign in page', false, 1),
(3,'Welcome page', false, 1),
-- للمهمة رقم 4
(4,'Settings - Account page', true, 4),
(5,'Settings - Billing page', true, 4),
(6,'Search page', false, 4);