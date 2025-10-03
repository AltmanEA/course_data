---
title: MongoDB
canvasWidth: 800
routerMode: hash
---

# MongoDB

---

# Что рассматривается

- Подключение и работа с MongoDB из typescript

# Что не рассматривается

- Проектирование и администрирование MongoDB

---

# Установка

```yaml
services:
  mongo:
    image: mongo
    restart: always
    ports:
      - "27017:27017"
    environment:
      MONGO_INITDB_ROOT_USERNAME: root
      MONGO_INITDB_ROOT_PASSWORD: example
  mongo-express:
    image: mongo-express
    restart: always
    ports:
      - 8081:8081
    environment:
      ME_CONFIG_MONGODB_ADMINUSERNAME: root
      ME_CONFIG_MONGODB_ADMINPASSWORD: example
      ME_CONFIG_MONGODB_URL: mongodb://root:example@mongo:27017/
```
 
---
 
# Mongo Express

<img src="/mongo_express.png" width="90%" style="display: block; margin: 0 auto;"/>

---
 
# База данных Mongo

<img src="/mongo_database.png" width="90%" style="display: block; margin: 0 auto;"/>

---
 
# Коллекции 

<img src="/collection.png" width="90%" style="display: block; margin: 0 auto;"/>

---
 
# Инструменты коллекции 

<img src="/collection_tools.png" width="90%" style="display: block; margin: 0 auto;"/>

---
 
# Добавление документа

<div class="grid grid-cols-2 gap-4">
<div class="flex justify-center">
<img src="/new_document.png" width="90%" style="display: block; margin: 0 auto;"/>   
</div>
<div class="flex justify-center">
```js
{
    _id: ObjectId(),
    name: 'Иван',
    age: 18
}
```
</div>
</div>

---
 
# Инструменты коллекции 

<img src="/document.png" width="90%" style="display: block; margin: 0 auto;"/>



---

# Классы для примеров

```ts
class Student {
    _id: ObjectId = new ObjectId()
    constructor(
        public name: string,
        public group: string ) { } }
class Grade { constructor(
        public studentId: ObjectId,
        public studentName: String,
        public value?: number,
        public date?: Date  ) { } }
class Course { constructor(
        public name: string,
        public grades: Array<Grade> = []
    ) { } }
```


---

# Подключение к mongoDB

```ts
const CONNECTION = "mongodb://root:example@127.0.0.1:27017/"
const DB_NAME = "test"
const COLLECTION = "students"

const client = new MongoClient(
    CONNECTION,
    { monitorCommands: true } as MongoClientOptions
)
client.on('commandStarted', (event) => console.debug(event))
client.on('commandSucceeded', (event) => console.debug(event))
client.on('commandFailed', (event) => console.debug(event))
```

---

# Подключение к mongoDB

```ts
async function run() {
    try {
        await client.connect()
        console.log("CONNECT")
        const db = client.db(DB_NAME)
        console.log("Drop collection")
        const students = db.collection(COLLECTION) as Collection<Student>
        await students.drop()
    } finally {
        console.log("MONGO CLOSING")
        await client.close(); } }
console.log("RUN MONGO")
run().catch(console.dir)
```
```
RUN MONGO
CONNECT
Drop collection
MONGO CLOSING
```

---

# Create

```ts
const new_students = ["Маша 22", "Даша 22", "Саша 23"].map(x => {
  const s = x.split(" ")
  return new Student(s[0], parseInt(s[1]))
})
await students.insertOne(new_students[0])
await students.insertMany(new_students.slice(1, 3))
```
<img src="/create_result.png" width="90%" style="display: block; margin: 0 auto;"/>


---

# Команды mongo

<div class="grid grid-cols-2 gap-4">
<div class="flex justify-center" style="font-size: small">
<pre><code>CommandStartedEvent {
  name: 'commandStarted',
  address: '127.0.0.1:27017',
  connectionId: 1,
  serviceId: undefined,
  requestId: 5,
  databaseName: 'test',
  commandName: 'insert',
  command: {
    insert: 'students',
    documents: [ [Student] ],
    ordered: true,
    lsid: { id: Binary.createFromBase64('...', 4) },
    '$db': 'test'
  },
  serverConnectionId: 30n
}</code></pre>
</div>
<div class="flex justify-center"  style="font-size: small">
<pre><code> CommandSucceededEvent {
  name: 'commandSucceeded',
  address: '127.0.0.1:27017',
  connectionId: 1,
  serviceId: undefined,
  requestId: 5,
  commandName: 'insert',
  duration: 32,
  reply: { n: 1, ok: 1 },
  serverConnectionId: 30n,
  databaseName: 'test'
}</code></pre> 
</div>
</div>


---

# READ

```ts
const students_cursor: FindCursor<WithId<Student>> = students.find()
const students_data: WithId<Student>[] = await students_cursor.toArray()
console.log(students_data)
...
type WithId<TSchema> = EnhancedOmit<TSchema, '_id'> & {
    _id: InferIdType<TSchema>;
};
```
```
[ { _id: new ObjectId('68d0cbdad0ffe11960454687'),
    name: 'Маша',group: 22 },
  { _id: new ObjectId('68d0cbdad0ffe11960454688'),
    name: 'Даша', group: 22 },
  { _id: new ObjectId('68d0cbdad0ffe11960454689'),
    name: 'Саша', group: 23 } ]
```

---

# Функция поиска

```ts
class Collection<TSchema extends Document = Document>
...
find(): FindCursor<WithId<TSchema>>;
find(filter: Filter<TSchema>, 
  options?: FindOptions & Abortable) : FindCursor<WithId<TSchema>>;
find<T extends Document>(filter: Filter<TSchema>, 
  options?: FindOptions & Abortable): FindCursor<T>;
...
type Filter<TSchema> = {
    [P in keyof WithId<TSchema>]?: Condition<WithId<TSchema>[P]>;
} & RootFilterOperators<WithId<TSchema>>;
```


---

# Поиск

```ts
students.findOne({ name: 'Маша' }).toArray()
```
```
{
  _id: new ObjectId('68d0cd831518949ce8d8502d'),
  name: 'Маша',
  group: 22
}
```
```ts
students.find({ group: 22 }).toArray()
```
```
[ { _id: new ObjectId('68d0cd831518949ce8d8502d'),
    name: 'Маша', group: 22 },
  { _id: new ObjectId('68d0cd831518949ce8d8502e'),
    name: 'Даша', group: 22 } ]
```

---

# Условия поиска

```ts
students.find({ group: 22, name: 'Даша' })
students.find({ group: { $gt: 22 } })
students.find({ group: { $gt: 22, $lt: 24 } })
```
```
Даша - 22
Саша - 23; Вася - 23; Петя - 24; Коля - 24
Саша - 23; Вася - 23
```

---

# Условия поиска

```ts
students.find({ group: { $in: [22, 24] } })
students.find({ group: { $nin: [22, 24] } })
students.find({ group: { $ne: 22 } })
```
```
Маша - 22; Даша - 22; Петя - 24; Коля - 24
Саша - 23; Вася - 23
Саша - 23; Вася - 23; Петя - 24; Коля - 24
```

---

# UPDATE

```ts
students.updateOne({ name: 'Маша' }, { $set: { name: 'Мария' } })
students.updateMany({ group: 22 }, { $set: { group: 21 } })
```
```
Маша - 22; Даша - 22; Саша - 23; Вася - 23; Петя - 24; Коля - 24
Мария - 22; Даша - 22; Саша - 23; Вася - 23; Петя - 24; Коля - 24
Мария - 21; Даша - 21; Саша - 23; Вася - 23; Петя - 24; Коля - 24
```

---

# DELETE

```ts
students.deleteOne({ name: "Саша" })
students.deleteMany({ group: 21 })
```
```
Мария - 21; Даша - 21; Саша - 23; Вася - 23; Петя - 24; Коля - 24
Мария - 21; Даша - 21; Вася - 23; Петя - 24; Коля - 24
Вася - 23; Петя - 24; Коля - 24
```

---

# Несколько коллекций. Данные.

```ts
const new_students = ["Маша 22", "Даша 22", "Саша 23", 
  "Вася 23", "Петя 24", "Коля 24"].map(x => {
  const s = x.split(" ")
  return new Student(s[0], parseInt(s[1]))
})
await students.insertMany(new_students)
const new_courses = ["Математика", "Физика", "Информатика"]
  .map(x => new Course(x))
await courses.insertMany(new_courses)
```

---

# Добавляем оценки. Id. Push.

```ts
async function addGradeOnCourse(student: Student, course: WithId<Course>, 
  value: number, date: Date = new Date()) {
  const grade = new Grade(student._id, student.name, value, date)
  await courses.updateOne({ _id: course._id }, { $push: { grades: grade } })
}
await addGradeOnCourse(new_students[0], new_courses[0] as WithId<Course>, 3)
console.log((await courses.findOne() as Course).grades[0])
```
```
{ studentId: new ObjectId('68d6033d1b0082ab832b860a'),
  studentName: 'Маша', value: 3,
  date: 2025-09-26T03:06:37.623Z }
```

---

# Изменяем оценки. Несколько условий

```ts
async function updateGradeOnCourse(student: Student, course: WithId<Course>, 
  value: number, date: Date = new Date()) {
  await courses.updateOne(
    {
      $and: [
        { name: course.name },
        { 'grades.studentName': student.name }
      ]
    },
    {
      $set: {
        'grades.$.value': value,
        'grades.$.date': date
      }
    }
  )
}
```

---

# Изменяем оценки. 

```ts
await updateGradeOnCourse(new_students[0], new_courses[0] as WithId<Course>, 
  5, new Date(2021, 10, 10))
console.log((await courses.findOne() as Course).grades[0])
```
До
```
{ studentId: new ObjectId('68d6033d1b0082ab832b860a'),
  studentName: 'Маша', value: 3,
  date: 2025-09-26T03:06:37.623Z }
```
После
```  
{ studentId: new ObjectId('68d6033d1b0082ab832b860a'),
  studentName: 'Маша', value: 5, 
  date: 2021-11-09T18:00:00.000Z }
```

---

# Курсы, с оценками до заданной даты. ElemMatch.

```ts
const day = new Date(2022, 10, 10)
courses.find({ grades: { $elemMatch: { value: 5, date: { $lt: day } } } })
addGradeOnCourse(new_students[0], new_courses[1] as WithId<Course>, 
  5, new Date(2021, 10, 10))
addGradeOnCourse(new_students[1], new_courses[2] as WithId<Course>, 
  5, new Date(2023, 10, 10))        
courses.find().toArray()
courses.find({ grades: { $elemMatch: { value: 5, date: { $lt: day } } } })
```
```
Математика: Маша - 5
Математика: Маша - 5; Физика: Маша - 5; Информатика: Даша - 5
Математика: Маша - 5; Физика: Маша - 5
```

---

# Фреймворк агрегации

```ts
await students.aggregate<WithId<Student>>(
  [
    {
      $match: {
        age: { $gt: 22 }
      }
    }
  ]
).toArray()
```
```
Найти всех студентов старше 22 лет
Саша - 23; Вася - 23; Петя - 24; Коля - 24
```

---

# Фильтрация документов

```ts
courses.aggregate<WithId<Course>>([
  {
    $match: {
      "grades.value": { $gte: 4 }
    }
  }
])
```
```
Найти курсы с оценками выше 4
Математика: Маша - 5; Даша - 5; Саша - 3; Вася - 3; 
Физика: Маша - 5; Даша - 4; Саша - 5; Коля - 3; 
Информатика: Маша - 5; Даша - 4; Саша - 4
```
 
---
 
# Группировка данных

```ts
students.aggregate([
  {
    $group: {
      _id: "$age",
      count: { $sum: 1 },
      names: { $push: "$name" }
    }
  }
])
```
```
Группировка студентов по возрасту
{"_id":23,"count":2,"names":["Саша","Вася"]}; 
{"_id":22,"count":2,"names":["Маша","Даша"]}; 
{"_id":24,"count":2,"names":["Петя","Коля"]}
```

---

# Проекция полей

```ts
students.aggregate([{
    $project: {
      studentName: "$name",
      age: 1,
      isAdult: { $gte: ["$age", 13] },
      yearOfBirth: { $subtract: [2025, "$age"] }
    }}])
```
```
Выборка и преобразование полей студентов
{"_id":".","age":22,"studentName":"Маша","isAdult":false,"yearOfBirth":2003};
{"_id":".","age":22,"studentName":"Даша","isAdult":false,"yearOfBirth":2003};
{"_id":".","age":23,"studentName":"Саша","isAdult":true,"yearOfBirth":2002};
{"_id":".","age":23,"studentName":"Вася","isAdult":true,"yearOfBirth":2002};
{"_id":".","age":24,"studentName":"Петя","isAdult":true,"yearOfBirth":2001};
{"_id":".","age":24,"studentName":"Коля","isAdult":true,"yearOfBirth":2001}
```

---

# Pазворачивание массивов

```ts
courses.aggregate([
{ $unwind: "$grades" },
{ $project: {
  courseName: "$name",
  studentId: "$grades.studentId",
  studentName: "$grades.studentName",
  gradeValue: "$grades.value"} } ])
```
```
Развернуть оценки и получить детальную информацию
{"_id":".","courseName":"Математика","studentId":".","studentName":"Маша","gradeValue":5};
{"_id":".","courseName":"Математика","studentId":".","studentName":"Даша","gradeValue":5};
{"_id":".","courseName":"Математика","studentId":".","studentName":"Саша","gradeValue":3};
{"_id":".","courseName":"Математика","studentId":".","studentName":"Вася","gradeValue":3};
{"_id":".","courseName":"Физика","studentId":".","studentName":"Маша","gradeValue":5};
{"_id":".","courseName":"Физика","studentId":".","studentName":"Даша","gradeValue":4};
...
```


---

# Фильтрация элементов массива

<div class="grid grid-cols-2 gap-4">
<div class="flex justify-center">
```ts
courses.aggregate([{
$project: {
  name: 1,
  excellentGrades: {
    $filter: {
      input: "$grades",
      as: "grade",
      cond: { $eq: ["$$grade.value", 5] } }},
  recentGrades: {
    $filter: {
      input: "$grades",
      as: "grade",
      cond: {
        $gte: ["$$grade.date", 
          new Date("2021-01-03")]
    }}}}}])
```
</div>
<div class="flex justify-center text-xs">
<pre><code>Оставить только отличные оценки
{"_id":".","name":"Математика",
  "excellentGrades":[
  {"studentName":"Маша","value":5},
  {"studentName":"Даша","value":5}],
  "recentGrades":[
    {"studentName":"Вася","value":3]};
{"_id":".","name":"Физика",
  "excellentGrades":[
  {"studentName":"Маша","value":5},
  {"studentName":"Саша","value":5}],
  "recentGrades":[
    {"studentName":"Коля","value":3]};
{"_id":".","name":"Информатика",
  "excellentGrades":[
...</code></pre>
</div>
</div>


---

# $lookup - объединение коллекций

<div class="grid grid-cols-2 gap-4">
<div class="flex justify-center">
```ts
students.aggregate([{
$lookup: {
  from: "courses",
  let: { studentId: "$_id", studentName: "$name" },
  pipeline: [
    { $unwind: "$grades" },
    { $match: {
        $expr: {
          $eq: ["$grades.studentId", "$$studentId"]
        }}},
    { $project: {
        courseName: "$name",
        gradeValue: "$grades.value",
        gradeDate: "$grades.date"
        }}],
  as: "studentGrades"
}}])
```
</div>
<div class="flex justify-center text-xs">
<pre><code> Объединить студентов с их оценками
{"name":"Маша","age":22,"studentGrades":[
  {"courseName":"Матем.","gradeValue":5},
  {"courseName":"Физика","gradeValue":5},
  {"courseName":"Информ.","gradeValue":5}]}; 
{"name":"Даша","age":22,"studentGrades":[
  {"courseName":"Матем.","gradeValue":5},
  {"courseName":"Физика","gradeValue":4},
  {"courseName":"Информ.","gradeValue":4}]}; 
{"name":"Саша","age":23,"studentGrades":[
  {"courseName":"Матем.","gradeValue":3},
  {"courseName":"Физика","gradeValue":5},
  {"courseName":"Информ.","gradeValue":4}]}; 
{"name":"Вася","age":23,"studentGrades":[
  {"courseName":"Матем.","gradeValue":3}]}; 
{"name":"Петя","age":24,"studentGrades":[]}; 
{"name":"Коля","age":24,"studentGrades":[
  {"courseName":"Физика","gradeValue":3}]}</code></pre>
</div>
</div>


---

# Статистические операторы

<div class="grid grid-cols-2 gap-4">
<div class="flex justify-center">
```ts
courses.aggregate([
  { $unwind: "$grades" },
  { $group: {
    _id: "$name",
    avgGrade: { $avg: "$grades.value" },
    maxGrade: { $max: "$grades.value" },
    minGrade: { $min: "$grades.value" },
    totalStudents: { $sum: 1 },
    excellentCount: {
      $sum: {
        $cond: [{ $gte: ["$grades.value", 4] }, 1, 0]
      } },
    recentGradesCount: {
      $sum: {
        $cond: [
          { $gte: ["$grades.date", 
            new Date("2024-01-01")] },
            1, 0 ] }
      }}}])
```
</div>
<div class="flex justify-center text-xs">
<pre><code> Статистика по курсам
{"_id":"Физика","avgGrade":4.25,
  "maxGrade":5, "minGrade":3, 
  "totalStudents":4,
  "excellentCount":3,
  "recentGradesCount":0}; 
{"_id":"Информатика","avgGrade":4.33,
  "maxGrade":5, "minGrade":4, 
  "totalStudents":3,
  "excellentCount":3,
  "recentGradesCount":0}; 
{"_id":"Математика","avgGrade":4,
  "maxGrade":5, "minGrade":3, 
  "totalStudents":4,
  "excellentCount":2,
  "recentGradesCount":0}</code></pre>
</div>
</div>


---

# Условные операторы

<div class="grid grid-cols-2 gap-4">
<div class="flex justify-center">
```ts
courses.aggregate([
  { $unwind: "$grades" },
  { $group: {
    _id: { studentId: "$grades.studentId",
      studentName: "$grades.studentName" },
    avgGrade: { $avg: "$grades.value" },
    coursesCount: { $sum: 1 } } },
  { $project: {
    studentId: "$_id.studentId",
    studentName: "$_id.studentName",
    avgGrade: { $round: ["$avgGrade", 2] },
    coursesCount: 1,
    performance: {
      $switch: {
        branches: [
{ case: { $gte: ["$avgGrade", 4.5] }, then: "Отличник" },
{ case: { $gte: ["$avgGrade", 3.5] }, then: "Хорошист" },
{ case: { $gte: ["$avgGrade", 2.5] }, then: "Троечник" } ],
      default: "Неудовлетворительно" } } } } ])
```
</div>
<div class="flex justify-center text-xs">
<pre><code>Категоризация по успеваемости
{"count":3, "studentName":"Саша",
  "avgGrade":4,
  "performance":"Хорошист"}; 
{"count":3, "studentName":"Даша",
  "avgGrade":4.33,
  "performance":"Хорошист"};
{"count":3,"studentName":"Маша","
  avgGrade":5,
  "performance":"Отличник"}; 
{"count":1,"studentName":"Вася",
  "avgGrade":3,
  "performance":"Троечник"};
{"count":1,"studentName":"Коля",
  "avgGrade":3,
  "performance":"Троечник"}</code></pre>
</div>
</div>