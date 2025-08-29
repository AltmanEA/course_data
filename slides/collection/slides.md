---
title: Коллекции
canvasWidth: 800
routerMode: hash
monacoRunAdditionalDeps:
  - ./preload.ts
---

# Коллекции

---

# Применение итератора для перебора коллекции

```ts {monaco-run}
const a = [1, 2, 3, 4, 5];
let out = "";
// Обычный цикл
for (let i = 0; i < a.length; i++) out += a[i];
console.log(out);

// Используем итератор
out = "";
for (let n of a) out += n;
console.log(out);
```

---

# Интерфейсы итератора

```ts
interface Iterable<T> {
    [Symbol.iterator](): Iterator<T>;
}

interface Iterator<TReturn = any, ...> {
    next(...): IteratorResult<TReturn ...>;
    ...
}

interface IteratorReturnResult<TReturn> {
    done: true;
    value: TReturn;
}
```

---

# Пример итератора

```ts {monaco-run}
import { next_print } from "./preload.ts";
class RangeIterator implements Iterator<number> {
  private current: number;
  constructor(private start: number, private end: number) {
    this.current = start;
  }
  next(): IteratorResult<number> {
    if (this.current <= this.end) {
      return { value: this.current++, done: false };
    } else { 
      return { value: undefined, done: true };
    } } }
const iterator = new RangeIterator(1, 3);
for (let i of [0, 1, 2, 3]) console.log(next_print(iterator));
```

---

# Генераторы

```ts {monaco-run}
import { next_print } from "./preload.ts";

function* numberGenerator(start: number, end: number): Generator<number> {
  for (let i = start; i <= end; i++) {
    yield i;
  }
}
const gen = numberGenerator(1, 3);
for (let i of [0, 1, 2, 3]) console.log(next_print(gen));
```

---

# Итерируемые объекты. Массивы.

```ts {monaco-run}
import { next_print } from "./preload.ts";

const array = [1, 2, 3];
const arrayIterator = array[Symbol.iterator]();

for (let i of [0, 1, 2, 3]) console.log(next_print(arrayIterator));
```

---

# Итерируемые объекты. Строки.

```ts {monaco-run}
const str = "hello";
for (const char of str) {
  console.log(char); // h, e, l, l, o
}
```

---

# Итерируемые объекты. Множества (Set).

- Все значения уникальны.
- Элементы сохраняют порядок добавления.
- В Set ключи и значения одинаковы.
- Производительность: has(), add(), delete() работают за O(1).

```ts {monaco-run}
const set = new Set([1, 2, 3]);
for (const value of set) {
  console.log(value); // 1, 2, 3
}
```

---

# Итерируемые объекты. Карты (Map).

Map - это коллекция пар ключ-значение, где ключи могут быть любого типа.

- Ключами могут быть объекты, функции, другие Map.
- Элементы сохраняют порядок добавления.
- Есть свойство size
- Лучшая производительность для частых добавлений/удалений

```ts {monaco-run}
const map = new Map([
  ["a", 1],
  ["b", 2],
]);
for (const [key, value] of map) {
  console.log(key, value); // a 1, b 2
}
```

---

# Итерация по ключам

```ts {monaco-run}
let list = [4, 5, 6];
for (let i in list) {
  console.log(i); // "0", "1", "2",
}
for (let i of list) {
  console.log(i); // 4, 5, 6
}
```

---

# Map vs Object

<style>
  .slidev-layout td {
    padding: 0.25em;
  }
</style>
 <table class="text-[0.7em] w-[70%]">
        <thead>
            <tr>
                <th>Особенность</th>
                <th>Map</th>
                <th>Object</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td><strong>Типы ключей</strong></td>
                <td>Любого типа (объекты, функции, примитивы)</td>
                <td>Только string, number (преобразуется в string), Symbol</td>
            </tr>
            <tr>
                <td><strong>Порядок элементов</strong></td>
                <td>Сохраняется порядок добавления</td>
                <td>Не гарантирован (зависит от реализации JS-движка)</td>
            </tr>
            <tr>
                <td><strong>Определение размера</strong></td>
                <td>Свойство <code>size</code></td>
                <td>Нет встроенного способа, нужно использовать <code>Object.keys(obj).length</code></td>
            </tr>
            <tr>
                <td><strong>Итерация</strong></td>
                <td>Встроенные методы: <code>forEach()</code>, <code>for...of</code></td>
                <td>Требуется преобразование: <code>Object.keys()</code>, <code>Object.values()</code>, <code>Object.entries()</code></td>
            </tr>
            <tr>
                <td><strong>Производительность</strong></td>
                <td>Лучше для частых добавлений/удалений элементов</td>
                <td>Лучше для статических данных и редких изменений</td>
            </tr>
            <tr>
                <td><strong>Методы работы</strong></td>
                <td><code>set()</code>, <code>get()</code>, <code>has()</code>, <code>delete()</code>, <code>clear()</code></td>
                <td>Доступ через точку или скобки: <code>obj.key</code>, <code>obj['key']</code></td>
            </tr>
            <tr>
                <td><strong>Использование с TypeScript</strong></td>
                <td>Строгая типизация: <code>Map&lt;K, V&gt;</code></td>
                <td>Интерфейсы или типы для определения структуры</td>
            </tr>
        </tbody>
    </table>

---

# Операции с итераторами

```ts {monaco-run}
import { numberGenerator } from "./preload.ts";
// Spread operator
const iterator = numberGenerator(1, 3);
console.log([...iterator]);
// Деструктуризация
const [first, second] = numberGenerator(1, 5);
console.log(first, second); // 1, 2
// Преобразования в массив
console.log(Array.from(numberGenerator(1, 3)));
```

---

# Работа с коллекциями в функциональном стиле. Пример.

```ts
class Student {
  constructor(public name: string) {}
}
class Group {
  constructor(public name: string, public students: Array<Student>) {}
}
class Grade {
  constructor(public student: Student, public value: number) {}
}

const boys = ["Sheldon", "Leonard", "Howard", "Raj"];
const girls = ["Penny", "Amy", "Bernadette"];
const students_names = boys.concat(girls);
```

---

# Трансформация массива

```ts {monaco-run}
import { Student, students_names } from "./preload.ts";
const students_old: Student[] = [];
for (let s of students_names) students_old.push(new Student(s));
console.log(students_old[0]);
console.log(students_old.join(", "));

const students = students_names.map((value: string) => new Student(value));
console.log(students[0]);
console.log(students.join(", "));
```

---

# Функция map (не коллекция Map)

```ts
/**
* Calls a defined callback function on each element of an array,
*   and returns an array that contains the results.
* @param callbackfn A function that accepts up to three arguments.
*   The map method calls the callbackfn function one time
*   for each element in the array.
* @param thisArg An object to which the this keyword can refer
*   in the callbackfn function. If thisArg is omitted,
*   undefined is used as the this value.
*/
map<U>(
    callbackfn: (value: T, index: number, array: T[]) => U,
    thisArg?: any): U[];
```

---

# Примеры использования функции map

```ts {monaco-run}
const numbers = [1, 2, 3, 4];
// Умножение на 2
console.log(numbers.map((n) => n * 2));
// Преобразование объектов
const users = [
  { name: "Alice", age: 25 },
  { name: "Bob", age: 30 },
];
console.log(users.map((user) => user.name));
// С индексами
console.log(numbers.map((n, index) => `${index}: ${n}`));
// Преобразование в другой тип
console.log(numbers.map((n) => n.toString()));
```

---

# Фильтрация или отбор

```ts {monaco-run}
import { students, boys, girls, Student, Group } from "./preload.ts";
const boy_students = students.filter((value: Student) =>
  boys.includes(value.name)
);
const girl_students = students.filter((value: Student) =>
  girls.includes(value.name)
);
const groups = [
  new Group("Boys", boy_students),
  new Group("Girls", girl_students),
];
console.log(JSON.stringify(groups));
```

---

# Функция filter

```ts
/**
* Returns the elements of an array that meet the condition
*   specified in a callback function.
* @param predicate A function that accepts up to three arguments.
*   The filter method calls the predicate function one time
*   for each element in the array.
* @param thisArg ... .
*/
filter(
    predicate: (value: T, index: number, array: T[]) => unknown,
    thisArg?: any): T[];
```

---

# Примеры использования функции filter

```ts {monaco-run}
const numbers = [1, 2, 3, 4, 5, 6];
// Четные числа
console.log(numbers.filter((n) => n % 2 === 0));
// Фильтрация объектов
const products = [
  { name: "Laptop", price: 1000, inStock: true },
  { name: "Mouse", price: 25, inStock: false },
  { name: "Keyboard", price: 75, inStock: true },
];
console.log(JSON.stringify(products.filter((product) => product.inStock)));
// Поиск по строке
const words = ["apple", "banana", "cherry", "date"];
console.log(words.filter((word) => word.length > 5));
```

---

# Поиск

```ts {monaco-run}
import { students, Grade } from "./preload.ts";
const grades = [
  ["Sheldon", 5],
  ["Leonard", 4],
  ["Howard", 4],
  ["Raj", 3],
].map((value) => {
  const student_name = value[0];
  const student = students.find((value) => value.name === student_name);
  return student ? new Grade(student, value[1] as number) : null;
}) as Grade[];
console.log(JSON.stringify(grades));
```

---

# Функции анализа

```ts
// Determines whether the specified callback function
// returns true for any element of an array.
some(
    predicate: (value: number, index: number, array: Int8Array)
        => unknown,
    thisArg?: any): boolean;
// Determines whether all the members of an array
// satisfy the specified test.
every(
    predicate: (value: number, index: number, array: Int8Array)
        => unknown,
    thisArg?: any): boolean;
```

---

# Аккумуляция или свертка значений

```ts {monaco-run}
import { grades, Grade } from "./preload.ts";
// Среднее арифметическое
console.log(
  grades.reduce(
    (previousValue: number, currentValue: Grade) =>
      previousValue + currentValue.value,
    0
  ) / grades.length
);
// Максимальное
console.log(
  grades.reduce((previousValue: Grade, currentValue: Grade) => {
    if (previousValue.value < currentValue.value) return currentValue;
    else return previousValue;
  })
);
```

---

# Функция reduce

```ts
reduce<U>(
    callbackfn: (
        previousValue: U,
        currentValue: T,
        currentIndex: number,
        array: T[]) => U,
    initialValue: U): U;
```

---

# Примеры использования reduce

```ts {monaco-run}
// Группировка
type Person = { name: string; age: number; city: string };
const people: Array<Person> = [
  { name: "Alice", age: 25, city: "NY" },
  { name: "Bob", age: 30, city: "LA" },
  { name: "Charlie", age: 25, city: "NY" },
];
const groupedByAge = people.reduce(
  (acc: Record<number, Array<Person>>, person: Person) => {
    const age = person.age;
    if (!acc[age]) acc[age] = [];
    acc[age].push(person);
    return acc;
  },
  {}
);
console.log(JSON.stringify(groupedByAge));
```

---

# Примеры использования reduce

```ts {monaco-run}
// Преобразование массива в объект
const keyValuePairs: Array<[string, number]> = [
  ["a", 1],
  ["b", 2],
  ["c", 3],
];
const obj = keyValuePairs.reduce(
  (acc: Record<string, number>, [key, value]: [string, number]) => {
    acc[key] = value;
    return acc;
  },
  {}
);
console.log(obj);
```

---

# Примеры использования функций

```ts {monaco-run}
const products = [
  { name: "Laptop", price: 1000, category: "electronics" },
  { name: "Book", price: 20, category: "education" },
  { name: "Phone", price: 500, category: "electronics" },
  { name: "Pen", price: 2, category: "office" },
];
// Электроника дороже 100
const result = products
  .filter((product) => product.category === "electronics")
  .filter((product) => product.price > 100)
  .map((product) => product.name);
console.log(result);
```

---

# Примеры использования функций

```ts {monaco-run}
import { products, Product } from "./preload.ts";
type CategoryStats = { count: number; total: number; products: Array<string> };
const categoryStats = products.reduce(
  (acc: Record<string, CategoryStats>, product: Product) => {
    const category = product.category;
    if (!acc[category]) {
      acc[category] = { count: 0, total: 0, products: [] };
    }
    acc[category].count++;
    acc[category].total += product.price;
    acc[category].products.push(product.name);
    return acc;
  },
  {}
);
console.log(JSON.stringify(categoryStats));
```

---

# Функция sort

```ts
// Sorts an array in place.
// This method mutates the array and
//  returns a reference to the same array.
sort(compareFn?: (a: T, b: T) => number): this;
```

---

# WeakMap и WeakSet

<div class="grid grid-cols-2 gap-4">
<div class="flex justify-center">
Особенности:
</div>
<div class="flex justify-center">
Подходят:
</div>
<div class="flex justify-center">
<ul>
<li>Ключи (элементы) только объекты (не примитивы)</li>
<li>Слабые ссылки на ключи</li>
<li>Не препятствуют сборке мусора</li>
<li>Нет итерации по ключам/значениям</li>
<li>Нет свойства size</li>
</ul>
</div>
<div class="flex justify-center">
<ul>
<li>Приватных данных объектов</li>
<li>Кэширования результатов</li>
<li>Отслеживания состояния объектов</li>
<li>Временных ассоциаций</li>
</ul>
</div>
</div>

---

# Библиотеки коллекций

- [Lodash](https://lodash.com/)
- [Underscore](https://underscorejs.org/)
- [Immutable.js](https://github.com/immutable-js/immutable-js)

[chart](https://npm-stat.com/charts.html?package=lodash&package=underscore&package=immutable&from=2024-09-01&to=2025-08-28)