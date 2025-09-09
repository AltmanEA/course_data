---
title: Данные во внешней памяти
canvasWidth: 800
routerMode: hash
monacoRunAdditionalDeps:
  - class-transformer
  - ./preload.ts
---

# Данные во внешней памяти

---

# Проблемы и задачи

- В ОЗУ объекты хранятся по различным адресам и связаны между собой в виде графа. Вне ОЗУ (на диске или при передаче по сети) данные хранятся в виде последовательности байта.
- Нужно корректно представлять данные в виде последовательности байт (_сериализация_), восстанавливать объекты из последовательности байт (_десериализация_), а добавлять в восстановленные объекты методы (_маршалинг_).
- Часто из последовательности байт нужно извлечь только нужную информацию (_парсинг_).

---

# Формат JSON (JavaScript Object Notation)

```json
{
  "firstName": "Иван",
  "lastName": "Иванов",
  "address": {
    "streetAddress": "Московское ш., 101, кв.101",
    "city": "Ленинград",
    "postalCode": 101101
  },
  "phoneNumbers": ["812 123-1234", "916 123-4567"]
}
```

---

# Формат XML (eXtensible Markup Language)

```xml
<?xml version="1.0" encoding="UTF-8"?>
<person firstName="Иван" lastName="Иванов">
    <address
        streetAddress="Московское ш., 101, кв.101"
        city="Ленинград"
        postalCode="101101"
    />
   <phoneNumbers>
       <phoneNumber>812 123-1234</phoneNumber>
       <phoneNumber>916 123-4567</phoneNumber>
   </phoneNumbers>
</person>
```

---

# Формат YAML (Yet Another Markup Language)

```yaml
firstName: " "
lastName: " "
address:
  streetAddress: " , 101, 101"
  city: " "
  postalCode: 101101
phoneNumbers:
  - "812 123-1234"
  - "916 123-4567"
```

---

# Сериализация простого объекта

```ts {monaco-run}
import { ivanov } from "./preload.ts";
const serializedIvanov = JSON.stringify(ivanov);
const restoredIvanov = JSON.parse(JSON.stringify(ivanov));
console.log(serializedIvanov);
console.log(restoredIvanov);
```

---

# Классы для примеров

```ts
class Student {
  constructor(public firstname: string, public surname: string) {}
  get fullname() {
    return `${this.firstname} ${this.surname}`;
  }
}
class Lesson {
  constructor(public name: string, students: Student[] = []) {
    this.students = students;
  }
  students: Student[];
}
```

---

# Восстанавливаем методы

```ts {monaco-run}
import { Student } from "./preload.ts";
const pushkin = new Student("Александр", "Пушкин");
const pushkin_json = JSON.stringify(pushkin);
const pushkin_plain = JSON.parse(pushkin_json) as Student;
console.log(pushkin_plain.fullname);
const pushkin_obj = Object.assign(new Student("", ""), pushkin_plain);
console.log(pushkin_obj.fullname);
```

---

# Вложенные объекты

```ts {monaco-run}
import { Lesson, pushkin } from "./preload.ts";
const math = new Lesson("Математика", [pushkin]);
const math_json = JSON.stringify(math);
console.log(math_json);
const math_plain = JSON.parse(math_json) as Lesson;
console.log(math_plain.students[0]);
console.log(math_plain.students[0].fullname);
const math_obj = Object.assign(new Lesson(""), math_plain);
console.log(math_obj.students[0].fullname);
```

---

# Библиотека для сериализации

```ts {monaco-run}
import { plainToInstance } from "class-transformer";
import { Student } from "./preload.ts";
const pushkin = new Student("Александр", "Пушкин");
const pushkin_json = JSON.stringify(pushkin);
const pushkin_obj: unknown = JSON.parse(pushkin_json);
const pushkin_class = plainToInstance(Student, pushkin_obj);
console.log(pushkin_class.fullname);
```

---

# Вложенные объекты 2

```ts {monaco-run}
import { plainToInstance } from "class-transformer";
import { Lesson, pushkin } from "./preload.ts";
const math = new Lesson("Математика", [pushkin]);
const math_json = JSON.stringify(math);
console.log(math_json);
const math_plain: unknown = JSON.parse(math_json);
const math_obj = plainToInstance(Lesson, math_plain);
console.log(math_obj.students[0].fullname);
```

---

# Вложенные объекты 3

```json
    // tsconfig.json
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true
```

```ts
import "reflect-metadata"; // Для декораторов, не работает в браузере
import { plainToInstance, Type } from "class-transformer";
import { Student, pushkin } from "./preload.ts";
class Lesson {
  constructor(public name: string, students: Student[] = []) {
    this.students = students;
  }
  @Type(() => Student)
  students: Student[];
}
const math_json = JSON.stringify(new Lesson("Математика", [pushkin]));
const math_plain: unknown = JSON.parse(math_json);
const math_obj = plainToInstance(Lesson, math_plain);
console.log(math_obj.students[0].fullname);
```

```
{"name":"Математика","students":[{"firstname":"Александр","surname":"Пушкин"}]}
Александр Пушкин
```

---

# Полиморфная сериализация

```ts
abstract class Person {}
class PersonTutor extends Person {
  constructor(public name: string) { super(); }
  get fullname() { return `Проф. ${this.name}`; }
}
class PersonStudent extends Person {
  constructor(public firstname: string, public surname: string) {
    super(); }
  get fullname() { return `${this.firstname} ${this.surname}`; }
}
class PassCard {
   @Type(() => ???)
  person: Person;
  constructor(person: Person) {
    this.person = person;
  }
}
```

---

# Информация о типе объектов

```ts
abstract class Person { abstract _type: string }
class PersonTutor extends Person {
    override _type: string = "tutor" ... }
class PersonStudent extends Person{
    override _type: string = "student" ... }
class PassCard {
  @Type(() => Person, {
    discriminator: {
      property: "_type",
      subTypes: [
        { value: PersonStudent, name: "student" },
        { value: PersonTutor, name: "tutor" },
      ],
    },
  })
  person: Person;
  constructor(person: Person) {this.person = person; } }
```

---

# Пример полиморфной сериализации

```ts
const card = new PassCard(new PersonTutor("Эйлер"));
const card_json = JSON.stringify(card);
console.log(card_json);
const card_plain = JSON.parse(card_json) as PassCard;
console.log((card_plain.person as PersonTutor).fullname);
const card_class = plainToInstance(PassCard, card_plain);
console.log(card_class);
console.log((card_class.person as PersonTutor).fullname);
console.log((card_class.person as PersonStudent).fullname);
```

```
{"person":{"name":"Эйлер","_type":"tutor"}}
undefined
PassCard { person: PersonTutor { name: 'Эйлер', _type: 'tutor' } }
Проф. Эйлер
Проф. Эйлер
```

---

# DOM (Document Object Model)

- Формат представления различной информации в древовидной форме.
  - XML (eXtensible Markup Language) - универсальный формат.
  - HTML (Hypertext Markup Language) - формат для гипертекста.
  - SVG (Scalable Vector Graphics) - формат для векторных изображений.

Имеется стандарт [DOM Living Standard](https://dom.spec.whatwg.org/) и реализация в браузере [DOM](https://developer.mozilla.org/ru/docs/Web/API/Document_Object_Model)

---

# Основные узлы DOM

- Document: Корень всего дерева, точка входа для работы с документом.
- Element: Узел элемента (тега). Например: \<book\>, \<title\>.
- Attr: Узел атрибута элемента. Например: category="fiction".
- Text: Текстовое содержимое внутри элемента. Например: "Война и мир".
- Comment: Узел комментария.

---

# Основные методы. Поиск и навигация.

- getElementsByTagName(name) - возвращает коллекцию всех элементов с указанным именем тега;
- getElementById(id)- находит элемент по уникальному идентификатору (требует наличие DTD, где ID объявлен как тип ID).
- childNodes - коллекция всех дочерних узлов (включая текстовые узлы и комментарии).
- children - коллекция только дочерних элементов (игнорирует текстовые узлы и комментарии).
- parentNode - родительский узел текущего элемента.
- nextSibling - следующий узел на том же уровне дерева.

---

# Основные методы. Управление содержимым.

- createElement(tagName) - создает новый элемент с указанным именем тега.
- createTextNode(text) - создает новый текстовый узел с указанным содержимым.
- appendChild(node) - добавляет указанный узел в конец текущего узла.
- removeChild(node) - удаляет указанный узел из текущего узла.
- replaceChild(newChild, oldChild) - заменяет указанный узел в текущем узле.
- insertBefore(newChild, refChild) - вставляет указанный узел перед указанным узлом.

---

# Пример создания документа

```ts {monaco-run}
const xmlDoc = document.implementation.createDocument(null, "catalog");
const root = xmlDoc.documentElement;
const book = xmlDoc.createElement("book");
book.setAttribute("id", "bk101");
const author = xmlDoc.createElement("author");
author.textContent = "Gambardella, Matthew";
const title = xmlDoc.createElement("title");
title.textContent = "XML Developer's Guide";
book.appendChild(author);
book.appendChild(title);
root.appendChild(book);
const serializer = new XMLSerializer();
const xmlString = serializer.serializeToString(xmlDoc);
console.log(xmlString);
```

---

# Пример чтения документа

```ts {monaco-run}
const parser = new DOMParser();
const xmlString = "<root><item>Text</item></root>";
const xmlDoc = parser.parseFromString(xmlString, "text/xml");
const item = xmlDoc.getElementsByTagName("item")[0];
console.log(item.textContent);
```

---

# Запросы к документам

- Аналог запросам к базам данным
- Используется движок, который находит данные по запросу на определенном языке.
- XPATH - простой язык для поиска и выборки узлов XML
- XQuery - язык для выборки данных из XML, поддерживающий XPath, по возможностям близким к SQL.

---

# Оси XPATH

```
child:: (Дочерние узлы) — ось по умолчанию
  //book/child::title
  //book/title
attribute:: (Атрибуты) — сокращение @
  //book/attribute::category
  //book/@category
attribute:: (Атрибуты) — сокращение //
  //bookstore/descendant::title
  //bookstore//title
parent:: (Родительский узел) — сокращение ..
  /parent::bookstore
  /../bookstore
self:: (Текущий узел)
ancestor:: (Все предки)
following-sibling:: (Следующие узлы)
```

---

# Пример документа

```xml
<bookstore>
  <book category="fiction">
    <title lang="en">Harry Potter</title>
    <author>J.K. Rowling</author>
    <price>29.99</price>
  </book>
  <book category="cooking">
    <title lang="en">Everyday Italian</title>
    <author>Giada De Laurentiis</author>
    <price>30.00</price>
  </book>
  <book category="fiction">
    <title lang="ru">Война и мир</title>
    <author>Лев Толстой</author>
    <price discount="10%">25.50</price>
  </book>
</bookstore>
```

---

# XPATH запросы. Выбор элементов.

<style>
  .slidev-layout td {
    padding: 0.25em;
  }
</style>
 <table class="text-[0.7em] w-[70%]">
        <thead>
            <tr>
                <th>XPath выражение</th>
                <th>Описание</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td><code>//book</code></td>
                <td>Все элементы <code>book</code></td>
            </tr>
            <tr>
                <td><code>/bookstore/book</code></td>
                <td>Все <code>book</code>, которые являются дочерними для <code>bookstore</code></td>
            </tr>
            <tr>
                <td><code>//book/title</code></td>
                <td>Все элементы <code>title</code> внутри <code>book</code></td>
            </tr>
            <tr>
                <td><code>//title[@lang]</code></td>
                <td>Все <code>title</code> с атрибутом <code>lang</code></td>
            </tr>
            <tr>
                <td><code>//title[@lang='en']</code></td>
                <td>Все <code>title</code> с <code>lang="en"</code></td>
            </tr>
            <tr>
                <td><code>//book[price>25]</code></td>
                <td>Все <code>book</code> с ценой > 25</td>
            </tr>
            <tr>
                <td><code>//book[last()]</code></td>
                <td>Последний элемент <code>book</code></td>
            </tr>
            <tr>
                <td><code>//book[position()<3]</code></td>
                <td>Первые два элемента <code>book</code></td>
            </tr>
        </tbody>
    </table>

---

# XPATH запросы. Выбор атрибутов.

<style>
  .slidev-layout td {
    padding: 0.25em;
  }
</style>
<table class="text-[0.7em] w-[70%]">
        <thead>
            <tr>
                <th>XPath выражение</th>
                <th>Описание</th>                
            </tr>
        </thead>
        <tbody>
            <tr>
                <td><code>//@category</code></td>
                <td>Все атрибуты <code>category</code></td>
            </tr>
            <tr>
                <td><code>//book/@category</code></td>
                <td>Атрибуты <code>category</code> элементов <code>book</code></td>
            </tr>
            <tr>
                <td><code>//title/@lang</code></td>
                <td>Атрибуты <code>lang</code> элементов <code>title</code></td>
            </tr>
            <tr>
                <td><code>//book[1]/@category</code></td>
                <td>Атрибут <code>category</code> первой книги</td>
            </tr>
            <tr>
                <td><code>//price/@discount</code></td>
                <td>Атрибут <code>discount</code> элементов <code>price</code></td>
            </tr>
        </tbody>
    </table>

---

# XPATH запросы. Выбор с условиями и функциями.

<style>
  .slidev-layout td {
    padding: 0.25em;
  }
</style>
<table class="text-[0.7em] w-[70%]">
  <thead>
            <tr>
                <th>XPath выражение</th>
                <th>Описание</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td><code>//book[author='Лев Толстой']</code></td>
                <td>Книги, где автор — "Лев Толстой"</td>
            </tr>
            <tr>
                <td><code>//book[price<30] </code></td>
                <td>Книги с ценой меньше 30</td>
            </tr>
            <tr>
                <td><code>//book[contains(title, 'War')]</code></td>
                <td>Книги, в заголовке которых есть "War"</td>
            </tr>
            <tr>
                <td><code>//book[starts-with(author, 'J')]</code></td>
                <td>Книги, где автор начинается на "J"</td>
            </tr>
            <tr>
                <td><code>//book[ends-with(title, 'Guide')]</code></td>
                <td>Книги, где заголовок заканчивается на "Guide"</td>
            </tr>
            <tr>
                <td><code>//book[not(@category)]</code></td>
                <td>Книги без атрибута category</td>
            </tr>
            <tr>
                <td><code>count(//book)</code></td>
                <td>Количество книг</td>
            </tr>
            <tr>
                <td><code>sum(//price)</code></td>
                <td>Сумма всех цен</td>
            </tr>
        </tbody>
</table>

---

# Пример XPATH на TypeScript

```ts {monaco-run}
import { bookstore } from './preload.ts';
const xmlDoc = new DOMParser().parseFromString(bookstore, 'text/xml');
const result = document.evaluate(
  "//book[@category='fiction']/title", // XPath выражение
  xmlDoc,                              // Контекстный узел
);
let node = result.iterateNext();
while (node) {
  console.log(new XMLSerializer().serializeToString(node));
  node = result.iterateNext();
}
```

---

# Пример XPATH на TypeScript

```ts {monaco-run}
import { bookstore, print_xpath_result } from './preload.ts';
const xmlDoc = new DOMParser().parseFromString(bookstore, 'text/xml');
const evaluator = new XPathEvaluator();
const nsResolver = evaluator.createNSResolver(xmlDoc);
const result = evaluator.evaluate(
  "//book[@category='fiction']/title", // XPath выражение
  xmlDoc,                              // Контекстный узел
  nsResolver,                          // Resolver для пространств имен
  XPathResult.ORDERED_NODE_ITERATOR_TYPE, // Тип результата
  null                                 // Существующий результат (null)
);
console.log(print_xpath_result(result))
```

---

# Потоковый парсер SAX <br> (Simple API for XML)

- Потоковая обработка - данные обрабатываются по мере чтения
- Низкое потребление памяти - не хранит весь документ в памяти
- Быстрая обработка больших файлов

- Сложность - труднее работать с иерархическими структурами
- Только для чтения - нельзя модифицировать XML


---

# Пример SAX на TypeScript

<style>
/* Локальная стилизация для конкретного слайда */
.slidev-monaco-container {
  max-height: 330px; /* Установите желаемую максимальную высоту */
  overflow: auto !important;
  white-space: pre-wrap; /* Сохраняет пробелы и переносы */
}
</style>

```ts {monaco}
import * as sax from 'sax';

interface TitleResult {
  text: string;
  lang: string;
  category: string;
}

class XPathSaxParser {
  private parser: sax.SAXParser;
  private results: TitleResult[] = [];
  private currentPath: string[] = [];
  private inFictionBook: boolean = false;
  private currentTitle: Partial<TitleResult> = {};

  constructor() {
    this.parser = sax.parser(true, {
      trim: true,
      lowercase: true
    });

    this.setupEventHandlers();
  }

  private setupEventHandlers(): void {
    this.parser.onopentag = (node: sax.QualifiedTag) => {
      this.currentPath.push(node.name);

      if (node.name === 'book') {
        // Проверяем атрибут category
        this.inFictionBook = node.attributes.category === 'fiction';
      } else if (node.name === 'title' && this.inFictionBook) {
        this.currentTitle = {
          category: 'fiction',
          lang: node.attributes.lang || ''
        };
      }
    };

    this.parser.ontext = (text: string) => {
      const currentElement = this.currentPath[this.currentPath.length - 1];
      
      if (currentElement === 'title' && this.inFictionBook && text.trim()) {
        this.currentTitle.text = text.trim();
      }
    };

    this.parser.onclosetag = (tagName: string) => {
      const lastTag = this.currentPath.pop();
      
      if (tagName === 'book') {
        this.inFictionBook = false;
      } else if (tagName === 'title' && this.inFictionBook && this.currentTitle.text) {
        this.results.push(this.currentTitle as TitleResult);
        this.currentTitle = {};
      }
    };

    this.parser.onerror = (error: Error) => {
      console.error('Parsing error:', error);
    };

    this.parser.onend = () => {
      console.log('Parsing completed successfully');
    };
  }

  public parse(xml: string): Promise<TitleResult[]> {
    return new Promise((resolve, reject) => {
      this.parser.onend = () => resolve(this.results);
      this.parser.onerror = reject;

      try {
        this.parser.write(xml).close();
      } catch (error) {
        reject(error);
      }
    });
  }
}
```

---

# Пример SAX на TypeScript

<style>
/* Локальная стилизация для конкретного слайда */
.slidev-monaco-container {
  max-height: 330px; /* Установите желаемую максимальную высоту */
  overflow: auto !important;
  white-space: pre-wrap; /* Сохраняет пробелы и переносы */
}
</style>

```ts {monaco-run}
import { bookstore, XPathSaxParser } from './preload.ts';
async function runXPathQuery() {
  const parser = new XPathSaxParser();
  try {
    const results = await parser.parse(bookstore);    
    console.log('=== XPATH QUERY: //book[@category="fiction"]/title ===');
    console.log(`Found ${results.length} results:\n`);    
    results.forEach((title, index) => {
      console.log(`Result ${index + 1}:`);
      console.log(`  Text: "${title.text}"`);
      console.log(`  Language: ${title.lang}`);
      console.log(`  Category: ${title.category}`);
      console.log('---'); });
  } catch (error) { console.error('Error:', error); } }
runXPathQuery();
```