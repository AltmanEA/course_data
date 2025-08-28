export function next_print(iterator: Iterator<any>) {
  const n = iterator.next();
  return `{ value: ${n.value}, done: ${n.done} }`;
}

export function* numberGenerator(
  start: number,
  end: number
): Generator<number> {
  for (let i = start; i <= end; i++) {
    yield i;
  }
}

export class Student {
  constructor(public name: string) {}
}
export class Group {
  constructor(public name: string, public students: Array<Student>) {}
}
export class Grade {
  constructor(public student: Student, public value: number) {}
}

export const boys = ["Sheldon", "Leonard", "Howard", "Raj"];
export const girls = ["Penny", "Amy", "Bernadette"];
export const students_names = boys.concat(girls);

export const students = students_names.map(
  (value: string) => new Student(value)
);

export const grades = [
    ["Sheldon", 5],
    ["Leonard", 4],
    ["Howard", 4],
    ["Raj", 3]
].map((value) => {
    const student_name = value[0]
    const student = students.find(
        value => value.name === student_name)
    return student ? new Grade(student, value[1] as number) : null
}) as Grade[]

export type Product = { name: string, price: number, category: string }
export const products: Product[] = [
    { name: 'Laptop', price: 1000, category: 'electronics' },
    { name: 'Book', price: 20, category: 'education' },
    { name: 'Phone', price: 500, category: 'electronics' },
    { name: 'Pen', price: 2, category: 'office' }
];