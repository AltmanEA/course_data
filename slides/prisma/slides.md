---
title: Prisma ORM
canvasWidth: 800
routerMode: hash
---

# Prisma ORM

---

# Зависимости для разработки

```json
"devDependencies": {
    "@prisma/client": "^6.19.0",
    "@types/node": "^24.10.0",
    "cross-env": "^10.1.0",
    "dotenv": "^17.2.3",
    "prisma": "^6.18.0",
    "tsx": "^4.20.6",
    "typescript": "~5.9.3",
    "vite": "^7.1.7"
}
"scripts": {
    "se": "cross-env PRISMA_ENGINES_MIRROR='https://binaries.prismacdn.com'
      PRISMA_BINARIES_MIRROR='https://npmmirror.com/mirrors/prisma' 
      RISMA_ENGINES_CHECKSUM_IGNORE_MISSING=1",
    ...
```

---

# Инициализация проекта

```ts
npm se prisma init
```
schema.prisma
```ts
...
generator client {
  provider = "prisma-client"
  output   = "../src/generated/prisma"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```


---

# Настройка базы данных

<div class="grid grid-cols-2 gap-4">
<div class="flex justify-center">
```yaml
services:
  postgres:
    image: postgres:18
    environment:
      POSTGRES_PASSWORD: postgres
      POSTGRES_USER: postgres
    ports:
      - 5432:5432
    volumes:
      - /var/lib/postgresql/18/docker
```
</div>
<div class="flex justify-center">
```yaml
  pgadmin:
    image: dpage/pgadmin4
    environment:
      PGADMIN_DEFAULT_EMAIL: admin@pgadmin.com
      PGADMIN_DEFAULT_PASSWORD: password
      PGADMIN_LISTEN_PORT: 80
    ports:
      - 15432:80
    volumes:
      - pgadmin:/var/lib/pgadmin
    depends_on:
      - postgres
volumes:
  postgres:
  pgadmin:
```
</div>
</div>
```yaml
# .env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/my_bd"
```

---

# Создаем модель

shema.prisma
```ts
generator client {
  provider = "prisma-client"
  output   = "../src/generated/prisma"
}
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
model Student {
  id        Int      @id @default(autoincrement())
  email     String   @unique
  name      String
  createdAt DateTime @default(now())
}
```

---

# Миграция

```bash
npx prisma migrate dev
Loaded Prisma config from prisma.config.ts.
Prisma config detected, skipping environment variable loading.
Prisma schema loaded from prisma\schema.prisma
Datasource "db": PostgreSQL database "my_db", schema "public" at "localhost:5432"
PostgreSQL database my_db created at localhost:5432
√ Enter a name for the new migration: ... first_model
Applying migration `20251107094946_first_model`
The following migration(s) have been created and applied from new schema changes:
prisma\migrations/
  └─ 20251107094946_first_model/
    └─ migration.sql
Your database is now in sync with your schema.
✔ Generated Prisma Client (6.18.0) to .\src\generated\prisma in 28ms
```


---

# SQL для модели

```sql
-- CreateTable
CREATE TABLE "Student" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Student_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Student_email_key" ON "Student"("email");
```

---

# PGAdmin

<img src="/pgadmin-connect.png" width="60%" style="display: block; margin: 0 auto;"/>


---

# PGAdmin

<img src="/pgadmin-server.png" width="80%" style="display: block; margin: 0 auto;"/>


---

# Подключение к базе данных

```ts
import { PrismaClient } from "./generated/prisma/client"
import dotenv from "dotenv"

dotenv.config()
const prisma = new PrismaClient()

async function main() {
  try {
    ...
  } catch (error) {
    console.error('❌ Ошибка:', error)
  } finally {
    await prisma.$disconnect()
  }
}

main()
```


---

# Данные о базе данных

```ts
const version = await prisma.$queryRaw`SELECT version() as version`
const dbInfo = await prisma.$queryRaw`SELECT 
    current_database() as name,
    current_user as user,
    inet_client_addr() as client_address`
const tables = await prisma.$queryRaw`SELECT 
    table_name as name,
    table_type as type
  FROM information_schema.tables 
  WHERE table_schema = 'public'
  ORDER BY table_name`
```
```
Версия PostgreSQL: PostgreSQL 18.0 (Debian 18.0-1.pgdg13+3) on x86_64-pc-linux-gnu...
{ name: 'my_db', user: 'postgres', client_address: '172.19.0.1' }
Таблицы в базе данных:
  - Student (BASE TABLE)
  - _prisma_migrations (BASE TABLE)
```


---

# Create

```ts
await prisma.student.deleteMany();
const newStudent = await prisma.student.create({
  data: 
    { email: "ivanov@example.com", name: "Иван Иванов"}
  });
const multipleStudents = await prisma.student.createMany({
  data: [
    { email: "petrov@example.com", name: "Петр Петров"},
    { email: "sidorova@example.ru", name: "Мария Сидорова"}
  ]});
const studentWithDate = await prisma.student.create({
  data: {
    email: "smirnov@example.ru",
    name: "Алексей Смирнов",
    createdAt: new Date("2023-01-15")}});
```

---

# Типизация создания

```ts
export type $StudentPayload<ExtArgs extends 
  runtime.Types.Extensions. InternalArgs = 
    runtime.Types.Extensions.DefaultArgs> = {
  create<T extends StudentCreateArgs>(
    args: Prisma.SelectSubset<T, StudentCreateArgs<ExtArgs>>    
  ): Prisma.Prisma__StudentClient<runtime.Types.Result.GetResult
    <Prisma.$StudentPayload<ExtArgs>, T, "create", GlobalOmitOptions>, 
    never, ExtArgs, GlobalOmitOptions>

export type StudentCreateInput = {
  email: string
  name: string
  createdAt?: Date | string
}
```

---

# Read

```ts
const allStudents = await prisma.student.findMany();
console.log("👨‍🎓 Все студенты:", allStudents);
const studentIvan = await prisma.student.findFirst({
  where: { name: "Иван Иванов", },});
console.log("👨‍🎓 Студент с именем 'Иван Иванов':", studentIvan);
```
```
Все студенты: [
  { id: 5, email: 'ivanov@example.com', name: 'Иван Иванов',
    createdAt: 2025-11-08T09:37:47.255Z },
  { id: 6, email: 'petrov@example.com', name: 'Петр Петров',
    createdAt: 2025-11-08T09:37:47.258Z},
  { id: 7, email: 'sidorova@example.ru', name: 'Мария Сидорова',
    createdAt: 2025-11-08T09:37:47.258Z},
  { id: 8, email: 'smirnov@example.ru', name: 'Алексей Смирнов',
    createdAt: 2023-01-15T00:00:00.000Z}]
Студент с именем 'Иван Иванов':   
  { id: 5, email: 'ivanov@example.com', name: 'Иван Иванов',
    createdAt: 2025-11-08T09:37:47.255Z }   
```

---

# Read, фильтрация

```ts
const studentsByName = await prisma.student.findMany({
  where: { name: { contains: "Иван" } }});
const studentByEmail = await prisma.student.findMany({
  where: { email: { endsWith: "@example.com" }}});
const studentsByDate = await prisma.student.findMany({
  where: { createdAt: { gte: new Date("2024-01-01") } } });
```
```
Студенты с именем 'Иван': [
  { id: 5, email: 'ivanov@example.com', name: 'Иван Иванов', createdAt: ... }]
Студенты с email 'example.com': [
  { id: 5, email: 'ivanov@example.com', name: 'Иван Иванов', createdAt: ... },
  { id: 6, email: 'petrov@example.com', name: 'Петр Петров', createdAt: ... },
Студенты, созданные после 2024-01-01: [
  { id: 5, email: 'ivanov@example.com', name: 'Иван Иванов', createdAt: ... },
  { id: 6, email: 'petrov@example.com', name: 'Петр Петров', createdAt: ... },
  { id: 7, email: 'sidorova@example.ru', name: 'Мария Сидорова', createdAt: ... }] 
```

---

# Read, пагинация

```ts
const firstPage = await prisma.student.findMany({
  skip: 0,
  take: 3,
  orderBy: { createdAt: "desc" } });
const secondPage = await prisma.student.findMany({
  skip: 3,
  take: 3,
  orderBy: { name: "asc" },
    });
```
```
Первая страница: [
  { id: 6, email: 'petrov@example.com', name: 'Петр Петров', createdAt: ... },
  { id: 7, email: 'sidorova@example.ru', name: 'Мария Сидорова', createdAt: ... },
  { id: 5, email: 'ivanov@example.com', name: 'Иван Иванов', createdAt: ... } ]
Вторая страница: [
  { id: 6, email: 'petrov@example.com', name: 'Петр Петров', createdAt: ... } ]
```

---

# Read, сложный пример

```ts
const filteredPaginated = await prisma.student.findMany({
  where: { name: { not: { contains: "ова" } }, },
  skip: 0,
  take: 2,
  orderBy: [
    { name: "asc" },
    { createdAt: "desc"}],
});
```
```
[ 
  { id: 8 email: 'smirnov@example.ru', name: 'Алексей Смирнов', createdAt: ... }
  { id: 5, email: 'ivanov@example.com', name: 'Иван Иванов', createdAt: ... }, 
]
```

---

# Update и Delete

```ts
const updatedStudent = await prisma.student.update({
  where: { email: "ivanov@example.com"},
  data: { name: "Иван Иванов-Петров" },});
const updatedStudents = await prisma.student.updateMany({
  where: { email: { endsWith: ".ru" } },
  data: { name: "Обновленное Имя" }});
const deletedStudent = await prisma.student.delete({
  where: { email: "smirnov@example.ru"}});
const deletedStudents = await prisma.student.deleteMany({
  where: { createdAt: { lt: new Date("2024-01-01")}}});
```

---

# Update

```ts
const updatedByName = await prisma.student.updateMany({
  where: { 
    name: { contains: "Петр"}},
  data: { name: "Петр Николаев"}});
const updatedByPattern = await prisma.student.updateMany({
  where: {
    name: { startsWith: "Мария" }},
  data: { email: "maria-new@example.com"}});
```
```
Итоговый список студентов: [
  { id: 7, email: 'sidorova@example.ru', 
    name: 'Обновленное Имя', createdAt: 2025-11-09T08:38:16.052Z },
  { id: 6, email: 'petrov@example.com',
    name: 'Петр Николаев', createdAt: 2025-11-09T08:38:16.052Z },
  { id: 5, email: 'ivanov@example.com',
    name: 'Петр Николаев', createdAt: 2025-11-09T08:38:16.049Z }
]
```

---

# Модели с несколькими классами

<img src="/model1.png" width="70%" style="display: block; margin: 0 auto;"/>

---

# Модели с несколькими классами

<img src="/model2.png" width="70%" style="display: block; margin: 0 auto;"/>