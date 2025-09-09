import * as sax from 'sax';

export const ivanov = {  firstName: "Иван",
  lastName: "Иванов",
  address: {
    streetAddress: "Московское ш., 101, кв.101",
    city: "Ленинград",
    postalCode: 101101,
  },
  phoneNumbers: ["812 123-1234", "916 123-4567"],
};

export class Student {
  constructor(public firstname: string, public surname: string) {}
  get fullname() {
    return `${this.firstname} ${this.surname}`;
  }
}
export class Lesson {
  constructor(public name: string, students: Student[] = []) {
    this.students = students;
  }
  students: Student[];
}

export const pushkin = new Student("Александр", "Пушкин");

export const bookstore = `<bookstore>
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
</bookstore>`;

export function print_xpath_result(result: XPathResult): string {
  let out = "";
  let node = result.iterateNext();
  while (node) {
    out += new XMLSerializer().serializeToString(node) + "\n";
    node = result.iterateNext();
  }
  return out
}

export interface TitleResult {
  text: string;
  lang: string;
  category: string;
}

export class XPathSaxParser {
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
