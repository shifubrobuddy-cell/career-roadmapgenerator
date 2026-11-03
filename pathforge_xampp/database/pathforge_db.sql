-- ==========================================================
-- PATHFORGE: CAREER ROADMAP GENERATOR & SKILL BENCHMARK
-- Technology Stack: PHP 8.x (PDO) + MySQL 8.0 / MariaDB + HTML5 + CSS3 + Vanilla JS
-- Target Environment: XAMPP (Apache + MySQL) / phpMyAdmin
-- Database Name: pathforge_db
-- ==========================================================

CREATE DATABASE IF NOT EXISTS `pathforge_db`
CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE `pathforge_db`;

-- Drop existing tables in reverse dependency order if recreating
SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS `user_bookmarks`;
DROP TABLE IF EXISTS `learning_resources`;
DROP TABLE IF EXISTS `diagnostic_quizzes`;
DROP TABLE IF EXISTS `user_progress`;
DROP TABLE IF EXISTS `skill_paths`;
DROP TABLE IF EXISTS `careers`;
DROP TABLE IF EXISTS `users`;
SET FOREIGN_KEY_CHECKS = 1;

-- --------------------------------------------------------
-- Table 1: users
-- --------------------------------------------------------
CREATE TABLE `users` (
  `user_id` INT AUTO_INCREMENT PRIMARY KEY,
  `username` VARCHAR(50) NOT NULL UNIQUE,
  `email` VARCHAR(100) NOT NULL UNIQUE,
  `password_hash` VARCHAR(255) NOT NULL,
  `full_name` VARCHAR(100) NOT NULL,
  `role` ENUM('student', 'instructor', 'admin') DEFAULT 'student',
  `avatar_url` VARCHAR(255) DEFAULT 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
  `target_goal` VARCHAR(255) DEFAULT 'Land Junior Full-Stack Developer Role',
  `study_streak_days` INT DEFAULT 5,
  `active_career_id` INT DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table 2: careers
-- --------------------------------------------------------
CREATE TABLE `careers` (
  `career_id` INT AUTO_INCREMENT PRIMARY KEY,
  `career_slug` VARCHAR(100) NOT NULL UNIQUE,
  `career_name` VARCHAR(100) NOT NULL,
  `description` TEXT NOT NULL,
  `icon_key` VARCHAR(50) DEFAULT 'Globe',
  `avg_salary` VARCHAR(100) DEFAULT '$85,000 - $130,000 / yr',
  `difficulty_level` VARCHAR(50) DEFAULT 'Moderate',
  `total_duration_weeks` INT DEFAULT 24,
  `tagline` VARCHAR(255) NOT NULL,
  `badge_color` VARCHAR(50) DEFAULT 'emerald',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table 3: skill_paths
-- --------------------------------------------------------
CREATE TABLE `skill_paths` (
  `skill_id` INT AUTO_INCREMENT PRIMARY KEY,
  `career_id` INT NOT NULL,
  `step_order` INT NOT NULL,
  `stage_label` ENUM('Fundamentals', 'Intermediate', 'Advanced') NOT NULL DEFAULT 'Fundamentals',
  `skill_name` VARCHAR(150) NOT NULL,
  `description` TEXT NOT NULL,
  `resource_link` VARCHAR(255) DEFAULT '',
  `resource_title` VARCHAR(200) DEFAULT '',
  `resource_type` VARCHAR(50) DEFAULT 'Documentation',
  `estimated_hours` INT DEFAULT 20,
  `difficulty` VARCHAR(50) DEFAULT 'Beginner',
  `key_topics` TEXT,
  `checklist_json` TEXT,
  `mini_project_title` VARCHAR(200) DEFAULT NULL,
  `mini_project_desc` TEXT DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`career_id`) REFERENCES `careers`(`career_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table 4: user_progress
-- --------------------------------------------------------
CREATE TABLE `user_progress` (
  `progress_id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL,
  `career_id` INT NOT NULL,
  `skill_id` INT NOT NULL,
  `status` ENUM('not_started', 'in_progress', 'completed') DEFAULT 'not_started',
  `confidence_rating` INT DEFAULT 3,
  `notes` TEXT,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`user_id`) ON DELETE CASCADE,
  FOREIGN KEY (`career_id`) REFERENCES `careers`(`career_id`) ON DELETE CASCADE,
  FOREIGN KEY (`skill_id`) REFERENCES `skill_paths`(`skill_id`) ON DELETE CASCADE,
  UNIQUE KEY `uq_user_career_skill` (`user_id`, `career_id`, `skill_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table 5: diagnostic_quizzes
-- --------------------------------------------------------
CREATE TABLE `diagnostic_quizzes` (
  `quiz_id` INT AUTO_INCREMENT PRIMARY KEY,
  `career_id` INT NOT NULL,
  `question` TEXT NOT NULL,
  `options_json` TEXT NOT NULL,
  `correct_index` INT NOT NULL,
  `explanation` TEXT NOT NULL,
  `associated_skill_id` INT DEFAULT NULL,
  `skill_name` VARCHAR(150) DEFAULT NULL,
  `topic` VARCHAR(100) DEFAULT NULL,
  FOREIGN KEY (`career_id`) REFERENCES `careers`(`career_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table 6: learning_resources
-- --------------------------------------------------------
CREATE TABLE `learning_resources` (
  `resource_id` INT AUTO_INCREMENT PRIMARY KEY,
  `career_id` INT NOT NULL,
  `skill_id` INT DEFAULT NULL,
  `title` VARCHAR(200) NOT NULL,
  `resource_type` VARCHAR(50) NOT NULL,
  `url` VARCHAR(255) NOT NULL,
  `estimated_hours` INT DEFAULT 10,
  `is_free` TINYINT(1) DEFAULT 1,
  `description` TEXT,
  FOREIGN KEY (`career_id`) REFERENCES `careers`(`career_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table 7: user_bookmarks
-- --------------------------------------------------------
CREATE TABLE `user_bookmarks` (
  `bookmark_id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL,
  `resource_id` INT NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`user_id`) ON DELETE CASCADE,
  FOREIGN KEY (`resource_id`) REFERENCES `learning_resources`(`resource_id`) ON DELETE CASCADE,
  UNIQUE KEY `uq_user_resource` (`user_id`, `resource_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==========================================================
-- SEED DATA INSERTIONS
-- ==========================================================

-- 1. Users
INSERT INTO `users` (`user_id`, `username`, `email`, `password_hash`, `full_name`, `role`, `target_goal`, `study_streak_days`, `active_career_id`) VALUES
(1, 'alex_student', 'alex@pathforge.edu', '$2y$10$w8T9V.p47s9aRk0rFhXvQO8x1sUuB1D7xK6b1Y5hJ4k3L2m1N0P9O', 'Alex Rivera', 'student', 'Junior Full-Stack Web Developer', 5, 1),
(2, 'priya_sharma', 'priya@pathforge.edu', '$2y$10$w8T9V.p47s9aRk0rFhXvQO8x1sUuB1D7xK6b1Y5hJ4k3L2m1N0P9O', 'Priya Sharma', 'student', 'FinTech Data Analyst', 12, 2),
(3, 'david_kim', 'david@pathforge.edu', '$2y$10$w8T9V.p47s9aRk0rFhXvQO8x1sUuB1D7xK6b1Y5hJ4k3L2m1N0P9O', 'David Kim', 'student', 'Product UI/UX Designer', 3, 3),
(4, 'admin', 'admin@pathforge.edu', '$2y$10$w8T9V.p47s9aRk0rFhXvQO8x1sUuB1D7xK6b1Y5hJ4k3L2m1N0P9O', 'System Administrator', 'admin', 'Curriculum Management & Academic Defense', 24, 1);

-- 2. Careers
INSERT INTO `careers` (`career_id`, `career_slug`, `career_name`, `description`, `icon_key`, `avg_salary`, `difficulty_level`, `total_duration_weeks`, `tagline`, `badge_color`) VALUES
(1, 'web-developer', 'Web Developer', 'Build modern responsive websites, scalable web applications, REST APIs, and full-stack cloud platforms.', 'Globe', '$85,000 - $130,000 / yr', 'Moderate', 24, 'Craft interactive digital experiences from client to server', 'indigo'),
(2, 'data-analyst', 'Data Analyst', 'Transform raw data into business intelligence, actionable statistical insights, predictive trends, and executive dashboards.', 'BarChart3', '$75,000 - $115,000 / yr', 'Moderate', 20, 'Uncover patterns and empower data-driven business decisions', 'emerald'),
(3, 'ui-ux-designer', 'UI/UX Designer', 'Design intuitive digital products, conduct user research, master Figma design systems, and craft seamless user journeys.', 'Palette', '$80,000 - $125,000 / yr', 'Creative / Analytical', 18, 'Bridge empathy and aesthetics to build products people love', 'violet'),
(4, 'android-developer', 'Android App Developer', 'Engineer native Android mobile applications with Kotlin, Jetpack Compose, Room database, Coroutines, and modern architecture.', 'Smartphone', '$90,000 - $140,000 / yr', 'Challenging', 22, 'Deliver fluid mobile applications to billions of Google Play users', 'teal'),
(5, 'digital-marketing', 'Digital Marketing Specialist', 'Drive customer acquisition, SEO optimization, high-converting ad campaigns, GA4 analytics, and automated growth funnels.', 'TrendingUp', '$65,000 - $105,000 / yr', 'Strategic / Creative', 16, 'Scale brand visibility, search rankings, and conversion ROI', 'amber');

-- 3. Skills for Career 1: Web Developer
INSERT INTO `skill_paths` (`skill_id`, `career_id`, `step_order`, `stage_label`, `skill_name`, `description`, `resource_link`, `resource_title`, `resource_type`, `estimated_hours`, `difficulty`, `key_topics`, `checklist_json`, `mini_project_title`, `mini_project_desc`) VALUES
(101, 1, 1, 'Fundamentals', 'HTML5 & Semantic Markup', 'Master document structure, accessibility (WCAG/ARIA), forms, inputs, and semantic document outlines.', 'https://developer.mozilla.org/en-US/docs/Learn/HTML', 'MDN Web Docs: HTML Learning Journey', 'Documentation', 15, 'Beginner', 'Semantic Elements, Forms & Validations, Accessibility ARIA, SEO Head Tags', '["Mastered HTML5 doctype and head metadata","Built accessible form with field validation","Understood semantic document outline"]', 'Accessible Portfolio Page', 'Build a fully semantic personal portfolio with accessible contact form.'),
(102, 1, 2, 'Fundamentals', 'CSS3, Flexbox & Grid Systems', 'Build responsive mobile-first layouts using CSS Flexbox, Grid, custom properties, and transitions.', 'https://css-tricks.com/snippets/css/a-guide-to-flexbox/', 'CSS-Tricks: Complete Guide to Flexbox & Grid', 'Article', 25, 'Beginner', 'Flexbox Axes, CSS Grid Areas, CSS Variables, Responsive Breakpoints', '["Built 12-column responsive grid","Created dark/light CSS variables theme","Applied flexbox alignment for navbars"]', 'Bento Dashboard Grid', 'Multi-device dashboard with CSS Grid bento layout and dynamic theming.'),
(103, 1, 3, 'Fundamentals', 'JavaScript Core & DOM Manipulation', 'Master ES6+ syntax, scope, closures, event listeners, DOM querying, async/await, and browser fetch API.', 'https://javascript.info/', 'The Modern JavaScript Tutorial', 'Interactive', 45, 'Beginner', 'ES6 Syntax, DOM Manipulation, Event Loop & Promises, Fetch API & JSON', '["Handled DOM events dynamically","Managed async data with async/await","Built modular ES6 classes/functions"]', 'Interactive Task Manager', 'CRUD todo app with local storage and filtering.'),
(104, 1, 4, 'Fundamentals', 'Git & GitHub Version Control', 'Understand branching, pull requests, merge conflict resolution, conventional commits, and team collaboration.', 'https://git-scm.com/book/en/v2', 'Pro Git Official Book & Interactive Guides', 'Book', 15, 'Beginner', 'Git Init/Commit/Push, Branching & Merging, Pull Requests & Review, Rebase & Stash', '["Initialized Git repos and branches","Resolved a manual merge conflict","Created GitHub Pull Requests with reviews"]', 'Open Source Feature PR', 'Collaborate on a repository using feature branches and pull requests.'),
(105, 1, 5, 'Intermediate', 'React.js & Component Architecture', 'Build single-page apps using React components, hooks (useState, useEffect, useMemo), and state lifting.', 'https://react.dev/learn', 'Official React 19 Documentation', 'Interactive', 50, 'Intermediate', 'JSX & Virtual DOM, Custom Hooks, Props & State Management, Component Composition', '["Created modular reusable components","Handled lifecycle with useEffect hooks","Lifted state across multiple sibling components"]', 'E-Commerce Storefront', 'Product catalog with cart state, filters, and checkout simulation.'),
(106, 1, 6, 'Intermediate', 'Node.js & Express RESTful APIs', 'Create server-side HTTP microservices, route handling, middleware integration, and request validations.', 'https://expressjs.com/en/starter/installing.html', 'Express.js Official Documentation & REST Patterns', 'Documentation', 35, 'Intermediate', 'Express Routing, Middleware Pipeline, RESTful Conventions, CORS & Body Parsing', '["Built REST endpoints with GET/POST/PUT/DELETE","Implemented auth middleware validation","Structured MVC controller layers"]', 'Restful Book Review API', 'Full REST service with parameter validations and error handlers.'),
(107, 1, 7, 'Intermediate', 'Relational Databases (MySQL / PostgreSQL)', 'Design normalized relational schemas, write parameterized SQL queries, indexing, and joins.', 'https://www.mysqltutorial.org/', 'MySQL Tutorial & Schema Design Best Practices', 'Documentation', 30, 'Intermediate', 'Third Normal Form (3NF), Inner & Left Joins, Foreign Keys & Cascades, Query Indexing', '["Constructed 3NF normalized schema","Wrote complex JOIN aggregations","Configured foreign key constraints & indexes"]', 'University Portal Database', 'Normalized schema modeling students, courses, grades, and instructors.'),
(108, 1, 8, 'Intermediate', 'Authentication, JWT & Web Security', 'Implement secure user registration, bcrypt password hashing, session tokens, JWTs, and OWASP defenses.', 'https://cheatsheetseries.owasp.org/', 'OWASP Cheat Sheet Series: Web Security & Auth', 'Documentation', 25, 'Intermediate', 'Bcrypt Hashing, JWT Tokens & Cookies, CORS & CSRF Defenses, SQL Injection Prevention', '["Used bcrypt for password salting","Implemented JWT refresh & access tokens","Protected routes from unauthorized requests"]', 'Secure Auth Microservice', 'Auth flow with email verification and token refresh cycles.'),
(109, 1, 9, 'Advanced', 'TypeScript & Type-Safe Engineering', 'Strengthen codebases with interfaces, generics, union types, and strict static type checks.', 'https://www.typescriptlang.org/docs/', 'TypeScript Official Handbook & Type Playground', 'Documentation', 30, 'Advanced', 'Type Annotations & Interfaces, Generics & Utility Types, Union & Intersection Types, Strict Mode', '["Typed complex API payloads","Used generics for reusable utility functions","Eliminated any types in strict mode"]', 'Type-Safe Data Grid', 'Reusable table component supporting custom sorters and filters.'),
(110, 1, 10, 'Advanced', 'Full-Stack Performance & Core Web Vitals', 'Optimize bundle size, code splitting, lazy loading, database caching, and Core Web Vitals.', 'https://web.dev/learn/performance', 'web.dev: Learn Performance by Google Chrome', 'Documentation', 20, 'Advanced', 'Lighthouse 100/100, Image Compression & WebP, Code Splitting & Dynamic Imports, Redis Caching', '["Achieved >90 Lighthouse score","Implemented asset lazy loading","Configured response caching"]', 'High-Speed Blog Platform', 'Sub-second page load blog featuring optimized assets and edge caching.'),
(111, 1, 11, 'Advanced', 'Docker, CI/CD & Cloud Deployment', 'Containerize applications, configure Dockerfiles, set up GitHub Actions CI/CD pipelines, and deploy.', 'https://docs.docker.com/get-started/', 'Docker Getting Started Guide', 'Documentation', 25, 'Advanced', 'Dockerfile & Docker Compose, GitHub Actions Pipelines, Reverse Proxy Nginx, Cloud Hosting', '["Wrote multi-stage production Dockerfile","Automated testing in GitHub Actions","Deployed containerized service to cloud"]', 'Automated Deployment Pipeline', 'CI/CD pipeline deploying Dockerized app on commit to main.'),
(112, 1, 12, 'Advanced', 'System Design & Scalable Architecture', 'Design distributed systems, load balancing, horizontal scaling, caching layers, and message queues.', 'https://github.com/donnemartin/system-design-primer', 'System Design Primer by Donne Martin', 'Book', 35, 'Advanced', 'Load Balancers & Proxies, Database Sharding & Read Replicas, Caching with Redis, Message Queues', '["Architected distributed system diagram","Selected right caching strategy","Calculated throughput and storage limits"]', 'URL Shortener Architecture', 'High-throughput URL shortener with caching and horizontal scaling.');

-- 3. Skills for Career 2: Data Analyst
INSERT INTO `skill_paths` (`skill_id`, `career_id`, `step_order`, `stage_label`, `skill_name`, `description`, `resource_link`, `resource_title`, `resource_type`, `estimated_hours`, `difficulty`, `key_topics`) VALUES
(201, 2, 1, 'Fundamentals', 'Advanced Excel & Google Sheets Analytics', 'Master XLOOKUP, INDEX/MATCH, Pivot Tables, and dynamic data cleansing.', 'https://support.microsoft.com/en-us/excel', 'Microsoft Excel Official Training', 'Interactive', 20, 'Beginner', 'XLOOKUP, Pivot Tables, Conditional Formatting, Data Cleansing'),
(202, 2, 2, 'Fundamentals', 'SQL Querying & Relational Databases', 'Write complex SELECT queries, WHERE filters, GROUP BY aggregations, and JOINs.', 'https://mode.com/sql-tutorial/', 'Mode Analytics SQL Tutorial', 'Interactive', 30, 'Beginner', 'SELECT & WHERE, GROUP BY & HAVING, INNER/LEFT JOINs, Window Functions'),
(203, 2, 3, 'Fundamentals', 'Descriptive Statistics & Probability', 'Understand mean, variance, normal distribution, z-scores, and probability.', 'https://www.khanacademy.org/math/statistics-probability', 'Khan Academy: Statistics & Probability', 'Video Course', 25, 'Beginner', 'Mean/Median/Mode, Standard Deviation, Probability Distributions, Hypothesis Testing'),
(204, 2, 4, 'Fundamentals', 'Python Foundations for Data Analysis', 'Learn Python data structures, list comprehensions, functions, and file I/O.', 'https://www.learnpython.org/', 'Interactive Python Tutorial', 'Interactive', 30, 'Beginner', 'Python Syntax, Dictionaries & Lists, Functions, File Handling & JSON'),
(205, 2, 5, 'Intermediate', 'Data Manipulation with Pandas & NumPy', 'Master DataFrames, missing value handling, group-by logic, and vectorization.', 'https://pandas.pydata.org/docs/', 'Pandas Documentation', 'Documentation', 40, 'Intermediate', 'DataFrames, Handling Nulls, GroupBy Aggregations, Merging & Concatenation'),
(206, 2, 6, 'Intermediate', 'Exploratory Data Analysis (EDA)', 'Identify outliers, calculate correlations, and formulate hypothesis tests.', 'https://towardsdatascience.com/', 'EDA Best Practices & Guides', 'Article', 25, 'Intermediate', 'Correlation Matrices, Boxplot Outliers, Feature Engineering, Data Normalization'),
(207, 2, 7, 'Intermediate', 'Data Visualization (Matplotlib & Seaborn)', 'Craft publication-ready statistical plots, heatmaps, and pairplots.', 'https://seaborn.pydata.org/', 'Seaborn Statistical Data Visualization', 'Documentation', 25, 'Intermediate', 'Bar Charts, Scatter Plots, Heatmaps, Custom Color Palettes'),
(208, 2, 8, 'Intermediate', 'Business Intelligence Dashboards (Power BI / Tableau)', 'Connect disparate sources, design interactive executive dashboards, and DAX measures.', 'https://learn.microsoft.com/en-us/power-bi/', 'Microsoft Power BI Learning Path', 'Interactive', 35, 'Intermediate', 'DAX Measures, Star Schema Modeling, Interactive Filters, KPI Cards'),
(209, 2, 9, 'Advanced', 'Time Series Forecasting & Trend Analysis', 'Decompose seasonal trends, moving averages, and forecast metrics.', 'https://otexts.com/fpp3/', 'Forecasting: Principles and Practice', 'Book', 30, 'Advanced', 'Moving Averages, Seasonality Decomposition, ARIMA Foundations, Trend Projection'),
(210, 2, 10, 'Advanced', 'Data Storytelling & Executive Presentation', 'Translate complex numbers into clear business recommendations.', 'https://www.storytellingwithdata.com/', 'Storytelling with Data', 'Book', 20, 'Advanced', 'Clutter Reduction, Color Focus, Audience Framing, Actionable Takeaways');

-- 3. Skills for Career 3: UI/UX Designer
INSERT INTO `skill_paths` (`skill_id`, `career_id`, `step_order`, `stage_label`, `skill_name`, `description`, `resource_link`, `resource_title`, `resource_type`, `estimated_hours`, `difficulty`, `key_topics`) VALUES
(301, 3, 1, 'Fundamentals', 'Design Thinking & Human-Centered UX', 'Learn empathy mapping, user personas, problem definition, and iterative discovery.', 'https://www.interaction-design.org/', 'Interaction Design Foundation: Design Thinking', 'Article', 20, 'Beginner', 'Empathy Maps, User Personas, Problem Statements, Ideation Methods'),
(302, 3, 2, 'Fundamentals', 'Information Architecture & Wireframing', 'Structure site trees, user flows, and low-fidelity wireframes.', 'https://balsamiq.com/learn/articles/wireframing-starter-guide/', 'Balsamiq Wireframing Starter Guide', 'Article', 25, 'Beginner', 'Card Sorting, Site Maps, User Flow Diagrams, Low-Fidelity Wireframes'),
(303, 3, 3, 'Fundamentals', 'Figma Mastery: Auto Layout & Components', 'Harness Figma components, variants, Auto Layout, constraints, and styles.', 'https://help.figma.com/hc/en-us', 'Figma Official Video Tutorials', 'Video Course', 35, 'Beginner', 'Auto Layout, Component Variants, Constraints, Design Tokens'),
(304, 3, 4, 'Fundamentals', 'Visual Design Principles & Typography', 'Master contrast, typographic hierarchy, 8pt spatial grid, and color harmony.', 'https://refactoringui.com/', 'Refactoring UI by Adam Wathan & Steve Schoger', 'Book', 25, 'Beginner', '8pt Grid, Typographic Scale, Contrast Ratios, Color Palettes'),
(305, 3, 5, 'Intermediate', 'Interactive Prototyping & Micro-Interactions', 'Craft clickable prototypes with smart animations, overlays, and gesture flows.', 'https://help.figma.com/hc/en-us/articles/360040314193', 'Figma Smart Animate Deep Dive', 'Documentation', 30, 'Intermediate', 'Smart Animate, State Transitions, Overlay Menus, Mobile Gestures'),
(306, 3, 6, 'Intermediate', 'Scalable Design Systems Architecture', 'Build tokenized design systems with buttons, modals, badges, and guidelines.', 'https://designsystemsrepo.com/', 'Design Systems Repo', 'Documentation', 35, 'Intermediate', 'Atomic Design, Color Tokens, Spacing Tokens, Component Documentation'),
(307, 3, 7, 'Intermediate', 'User Research & Usability Testing', 'Conduct moderated testing, SUS scoring, heatmaps, and feedback synthesis.', 'https://www.nngroup.com/articles/usability-testing-101/', 'Nielsen Norman Group Usability 101', 'Article', 25, 'Intermediate', 'Test Scripting, System Usability Scale (SUS), Heatmap Analysis, Affinity Mapping'),
(308, 3, 8, 'Advanced', 'Accessibility (WCAG 2.2) Compliance', 'Ensure AAA/AA contrast compliance, focus outlines, and screen reader design.', 'https://www.w3.org/WAI/standards-guidelines/wcag/', 'W3C Web Accessibility Initiative Guidelines', 'Documentation', 20, 'Advanced', 'Contrast Compliance, Focus States, Screen Reader Annotations, Touch Target Size'),
(309, 3, 9, 'Advanced', 'Design-to-Engineering Handoff', 'Annotate tokens, inspect CSS properties, and review build implementations.', 'https://uxdesign.cc/design-handoff-guide', 'UX Collective Handoff Guide', 'Article', 15, 'Advanced', 'Design Tokens, CSS Inspection, Edge Case Specs, QA Review');

-- 3. Skills for Career 4: Android App Developer
INSERT INTO `skill_paths` (`skill_id`, `career_id`, `step_order`, `stage_label`, `skill_name`, `description`, `resource_link`, `resource_title`, `resource_type`, `estimated_hours`, `difficulty`, `key_topics`) VALUES
(401, 4, 1, 'Fundamentals', 'Kotlin Programming Foundations', 'Master Kotlin syntax, null safety, data classes, lambdas, and extension functions.', 'https://kotlinlang.org/docs/home.html', 'Kotlin Official Documentation', 'Documentation', 30, 'Beginner', 'Null Safety, Data Classes, Lambdas & Higher-Order Functions, Extensions'),
(402, 4, 2, 'Fundamentals', 'Android Studio & Project Structure', 'Navigate Android Studio, Gradle dependencies, manifests, and activity lifecycles.', 'https://developer.android.com/studio/intro', 'Android Developer Guides', 'Documentation', 20, 'Beginner', 'Gradle Build System, Manifest XML, Activity Lifecycle, Resources'),
(403, 4, 3, 'Fundamentals', 'Modern UI with Jetpack Compose', 'Build declarative reactive UI layouts with Compose Composables and state.', 'https://developer.android.com/jetpack/compose', 'Jetpack Compose Tutorial', 'Interactive', 40, 'Beginner', 'Composables, State Hoisting, Modifiers, LazyColumns & Lists'),
(404, 4, 4, 'Intermediate', 'Kotlin Coroutines & Flow for Asynchronous Code', 'Handle background threads, network calls, and reactive state streams with Flow.', 'https://kotlinlang.org/docs/coroutines-overview.html', 'Coroutines Official Guide', 'Documentation', 35, 'Intermediate', 'Suspend Functions, Coroutine Scopes, Dispatchers, StateFlow & SharedFlow'),
(405, 4, 5, 'Intermediate', 'Local Persistence with Room Database', 'Store structured offline data using Room ORM entities, DAOs, and migrations.', 'https://developer.android.com/training/data-storage/room', 'Room Database Training Guide', 'Documentation', 30, 'Intermediate', 'Room Entities, DAO Queries, Foreign Keys, Type Converters'),
(406, 4, 6, 'Intermediate', 'Networking with Retrofit & OkHttp', 'Consume REST APIs, serialize JSON with Moshi/Kotlinx, and handle network errors.', 'https://square.github.io/retrofit/', 'Retrofit by Square', 'Documentation', 25, 'Intermediate', 'Retrofit Interfaces, OkHttp Interceptors, JSON Deserialization, Error Handling'),
(407, 4, 7, 'Advanced', 'Modern MVVM Architecture & Clean Architecture', 'Organize apps into Domain, Data, and Presentation layers with ViewModels.', 'https://developer.android.com/topic/architecture', 'Guide to App Architecture by Google', 'Documentation', 35, 'Advanced', 'MVVM Pattern, Repository Pattern, ViewModels, Dependency Injection with Hilt'),
(408, 4, 8, 'Advanced', 'Android Background Work & WorkManager', 'Schedule background tasks, sync local DB with cloud, and post notifications.', 'https://developer.android.com/topic/libraries/architecture/workmanager', 'WorkManager Documentation', 'Documentation', 25, 'Advanced', 'OneTimeWorkRequest, PeriodicWork, Constraints, Local Notifications'),
(409, 4, 9, 'Advanced', 'Google Play Store Release & CI/CD', 'Generate signed App Bundles (AAB), set up Fastlane, and deploy to Play Store.', 'https://developer.android.com/distribute/best-practices/launch', 'Google Play Launch Checklist', 'Documentation', 20, 'Advanced', 'Keystores & Signing, Android App Bundles, Fastlane Automation, Release Tracks');

-- 3. Skills for Career 5: Digital Marketing Specialist
INSERT INTO `skill_paths` (`skill_id`, `career_id`, `step_order`, `stage_label`, `skill_name`, `description`, `resource_link`, `resource_title`, `resource_type`, `estimated_hours`, `difficulty`, `key_topics`) VALUES
(501, 5, 1, 'Fundamentals', 'Marketing Fundamentals & Customer Funnels', 'Understand TOFU/MOFU/BOFU funnels, buyer personas, value propositions, and customer journeys.', 'https://www.hubspot.com/marketing-statistics', 'HubSpot Marketing Academy', 'Interactive', 15, 'Beginner', 'Inbound Funnels, Customer Persona Mapping, Value Props, CAC & LTV'),
(502, 5, 2, 'Fundamentals', 'Search Engine Optimization (SEO)', 'Master on-page SEO, technical audits, keyword research, meta tags, and internal linking.', 'https://moz.com/beginners-guide-to-seo', 'Moz Beginner Guide to SEO', 'Book', 30, 'Beginner', 'Keyword Research, On-Page SEO, Core Web Vitals, XML Sitemaps'),
(503, 5, 3, 'Fundamentals', 'Content Strategy & Copywriting', 'Write high-converting headlines, email sequences, blog strategies, and persuasive CTAs.', 'https://copyblogger.com/', 'Copyblogger Content Masterclass', 'Article', 20, 'Beginner', 'AIDA Framework, Headline Formats, Email Sequences, Content Calendars'),
(504, 5, 4, 'Intermediate', 'Google Analytics 4 (GA4) & Tracking', 'Set up GA4 events, conversion funnels, custom dimensions, and Google Tag Manager.', 'https://analytics.google.com/analytics/academy/', 'Google Analytics Academy', 'Interactive', 30, 'Intermediate', 'GA4 Events, Custom Conversions, Tag Manager Triggers, Retention Cohorts'),
(505, 5, 5, 'Intermediate', 'Paid Advertising: Google Search & Display Ads', 'Build high-ROI Google Search campaigns, negative keywords, quality score optimization.', 'https://skillshop.exceedlms.com/', 'Google Skillshop Ads Certification', 'Interactive', 35, 'Intermediate', 'Search Ad Copy, Match Types, Quality Score, Bidding Strategies'),
(506, 5, 6, 'Intermediate', 'Social Media Ads (Meta Ads Manager)', 'Target custom audiences, configure Meta Pixel, run A/B creatives, and track ROAS.', 'https://www.facebook.com/business/learn', 'Meta Blueprint Certification', 'Interactive', 30, 'Intermediate', 'Lookalike Audiences, Pixel Tracking, Creative Testing, ROAS Metrics'),
(507, 5, 7, 'Advanced', 'Email Marketing Automation & CRM', 'Build drip automation campaigns, segmentation logic, lead scoring, and churn prevention.', 'https://mailchimp.com/resources/', 'Mailchimp Marketing Automation Hub', 'Documentation', 25, 'Advanced', 'Drip Campaigns, Dynamic Tags, Churn Win-Backs, Lead Scoring'),
(508, 5, 8, 'Advanced', 'Growth Marketing & Conversion Rate Optimization (CRO)', 'Execute landing page A/B tests, form optimization, heatmaps, and virality loops.', 'https://cxl.com/blog/', 'CXL Conversion Optimization Guides', 'Article', 25, 'Advanced', 'A/B Testing Methodology, Heatmap Diagnostics, Micro-Conversions, Viral Loops');

-- 4. Initial User Progress (Simulating Alex Rivera on Web Developer)
INSERT INTO `user_progress` (`user_id`, `career_id`, `skill_id`, `status`, `confidence_rating`, `notes`) VALUES
(1, 1, 101, 'completed', 5, 'Finished HTML5 foundations, built semantic landing page with accessible inputs.'),
(1, 1, 102, 'completed', 4, 'Completed CSS Flexbox & Grid bento dashboard with custom dark theme.'),
(1, 1, 103, 'in_progress', 3, 'Currently practicing ES6 closures, async/await, and fetch API.'),
(1, 1, 104, 'not_started', 3, 'Plan to start Git branching and GitHub pull request workflows next week.'),
(1, 1, 105, 'not_started', 2, 'React components and hooks exploration.');

-- 5. Diagnostic Quizzes (Career 1: Web Developer)
INSERT INTO `diagnostic_quizzes` (`career_id`, `question`, `options_json`, `correct_index`, `explanation`, `associated_skill_id`, `skill_name`, `topic`) VALUES
(1, 'Which HTML5 element is most semantically appropriate for self-contained, independently distributable content like a blog post or news item?', '["<div>", "<article>", "<section>", "<aside>"]', 1, '<article> represents a self-contained composition intended to be independently reusable or distributable.', 101, 'HTML5 & Semantic Markup', 'Semantic HTML'),
(1, 'In modern CSS Flexbox, which property aligns flex items along the cross axis (perpendicular to flex-direction)?', '["justify-content", "align-items", "flex-wrap", "place-content"]', 1, 'align-items controls cross-axis alignment, while justify-content aligns items along the main axis.', 102, 'CSS3, Flexbox & Grid Systems', 'CSS Flexbox'),
(1, 'What is the key advantage of JavaScript `async/await` over raw nested Promise chains?', '["It makes code synchronous on the main thread", "It allows writing async logic with sequential try/catch readability", "It eliminates the event loop", "It automatically caches network requests"]', 1, 'async/await provides clean sequential syntax over Promises with standard try/catch error handling.', 103, 'JavaScript Core & DOM Manipulation', 'Asynchronous JS'),
(1, 'In a React functional component, what happens when an empty dependency array `[]` is passed to `useEffect`?', '["The effect runs on every render", "The effect runs only once after initial mount", "The effect never executes", "It throws a runtime error"]', 1, 'An empty array tells React the effect does not depend on any state or props, running once upon mount.', 105, 'React.js & Component Architecture', 'React Hooks'),
(1, 'Which HTTP method and status code are standard for creating a new resource in a RESTful API?', '["GET with 200 OK", "POST with 201 Created", "PUT with 204 No Content", "PATCH with 301 Moved"]', 1, 'POST requests submit new entity payloads, and servers respond with HTTP 201 Created.', 106, 'Node.js & Express RESTful APIs', 'REST Architecture');

-- 5. Diagnostic Quizzes (Career 2: Data Analyst)
INSERT INTO `diagnostic_quizzes` (`career_id`, `question`, `options_json`, `correct_index`, `explanation`, `associated_skill_id`, `skill_name`, `topic`) VALUES
(2, 'Why is XLOOKUP preferred over legacy VLOOKUP in modern Excel and Google Sheets?', '["It only works for numbers", "It searches in any direction, defaults to exact match, and does not require column indexes", "It runs 100x slower", "It requires third-party plugins"]', 1, 'XLOOKUP handles left-to-right and right-to-left lookups and defaults to exact matching without breaking when columns move.', 201, 'Advanced Excel & Google Sheets Analytics', 'Spreadsheet Analytics'),
(2, 'In SQL, which clause filters aggregated results produced by a `GROUP BY` statement?', '["WHERE", "HAVING", "ORDER BY", "FILTER"]', 1, 'HAVING filters aggregated grouped records; WHERE filters individual rows before grouping.', 202, 'SQL Querying & Relational Databases', 'SQL Aggregations'),
(2, 'In Python Pandas, which method is most effective for replacing NaN values with the column mean?', '["df.drop()", "df.fillna(df.mean())", "df.replace_nulls()", "df.clean()"]', 1, 'df.fillna(df.mean()) imputes missing numerical values using each column statistical mean.', 205, 'Data Manipulation with Pandas & NumPy', 'Data Cleansing');

-- 6. Learning Resources
INSERT INTO `learning_resources` (`career_id`, `skill_id`, `title`, `resource_type`, `url`, `estimated_hours`, `is_free`, `description`) VALUES
(1, 101, 'MDN Web Docs: HTML Elements Reference', 'Documentation', 'https://developer.mozilla.org/en-US/docs/Web/HTML/Element', 10, 1, 'Official standard specification for semantic HTML5 elements.'),
(1, 102, 'CSS-Tricks: A Complete Guide to Flexbox', 'Article', 'https://css-tricks.com/snippets/css/a-guide-to-flexbox/', 6, 1, 'Visual reference for all CSS Flexbox parent and child properties.'),
(1, 103, 'JavaScript.info: The Modern JavaScript Tutorial', 'Interactive', 'https://javascript.info/', 35, 1, 'Deep dive from core language syntax to advanced closures and event loop.'),
(1, 105, 'React.dev: Quick Start & Interactive Sandbox', 'Interactive', 'https://react.dev/learn', 25, 1, 'Official React 19 documentation and hands-on component exercises.'),
(1, 106, 'Express.js: Routing & Middleware Guide', 'Documentation', 'https://expressjs.com/en/guide/routing.html', 15, 1, 'Core patterns for writing Express REST services and handling middleware.'),
(1, 107, 'MySQL Tutorial: Relational Database Design & Normalization', 'Documentation', 'https://www.mysqltutorial.org/', 20, 1, 'Comprehensive tutorials on 1NF, 2NF, 3NF and SQL query optimization.'),
(2, 202, 'Mode Analytics: The SQL Tutorial for Data Analysis', 'Interactive', 'https://mode.com/sql-tutorial/', 20, 1, 'Hands-on browser SQL editor with real datasets for data analysts.'),
(2, 205, 'Pandas Official 10-Minute Guide', 'Documentation', 'https://pandas.pydata.org/docs/user_guide/10min.html', 8, 1, 'Quick introduction to Pandas series, DataFrames, and operations.');
