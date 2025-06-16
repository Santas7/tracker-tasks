### Данные.

#### User:

- id
- username
- email
- phone
- password
- country
- city
- role (например, admin, user)
- created_at
- updated_at

#### Group:
- id
- name
- description
- admin_user_id (ссылка на User)
- tasks (список задач)
- users (список пользователей)

#### Task:
- id
- title
- description
- skills
- users (список пользователей, назначенных на задачу)
- group_id (ссылка на Group)
- status (например, new, in_progress, completed)
- dt_start
- dt_end
- priority (например, low, medium, high)
- created_at
- updated_at

### Инициализация БД (создание таблиц, и прочее)

_(postgres)_

Проверка версии Постгреса
```sql
psql --version
```
psql (PostgreSQL) 14.17 (Homebrew)

Подключение к постгресу.
```
psql -U postgres
```

Создание базы данных + подключение
```sql
CREATE DATABASE task_tracker
    WITH 
    OWNER = your_user
    ENCODING = 'UTF8'
    LC_COLLATE = 'en_US.UTF-8'
    LC_CTYPE = 'en_US.UTF-8'
    TEMPLATE = template0;
```

```sql
\c task_tracker
```

Создание таблиц Users, Groups, Tasks
```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    phone VARCHAR(20),
    password VARCHAR(255) NOT NULL,
    country VARCHAR(50),
    city VARCHAR(50),
    role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('admin', 'user')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

```sql
CREATE TABLE groups (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    admin_user_id INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

```sql
CREATE TABLE tasks (
    id SERIAL PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    description TEXT,
    skills TEXT[],
    status VARCHAR(20) DEFAULT 'new' CHECK (status IN ('new', 'in_progress', 'completed')),
    group_id INTEGER REFERENCES groups(id),
    dt_start TIMESTAMP,
    dt_end TIMESTAMP,
    priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

-- Создание таблицы для связи пользователей и групп (many-to-many), для связи пользователей и задач 
```sql
CREATE TABLE group_users (
    group_id INTEGER REFERENCES groups(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    PRIMARY KEY (group_id, user_id)
);
```

```sql
CREATE TABLE task_users (
    task_id INTEGER REFERENCES tasks(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    PRIMARY KEY (task_id, user_id)
);
```

Создание триггера для обновления updated_at
```sql
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';
```

Применение триггера к таблицам
```sql
CREATE TRIGGER update_users_timestamp
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_groups_timestamp
    BEFORE UPDATE ON groups
    FOR EACH ROW
    EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_tasks_timestamp
    BEFORE UPDATE ON tasks
    FOR EACH ROW
    EXECUTE FUNCTION update_timestamp();
```
```
task_tracker=# \dt
           List of relations
 Schema |    Name     | Type  | Owner  
--------+-------------+-------+--------
 public | group_users | table | andrey
 public | groups      | table | andrey
 public | task_users  | table | andrey
 public | tasks       | table | andrey
 public | users       | table | andrey
(5 rows)

task_tracker=# 
```