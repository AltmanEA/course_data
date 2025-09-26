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
