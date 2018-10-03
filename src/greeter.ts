class Student{
    fullName: string;
    constructor(public first: string, public middleInitial: string, public last: string) {
        this.fullName = first + " " + middleInitial + " " + last;
    }
}

interface numToString { [key: number]: string; }
interface stringToNum { [key: string]: number; }

class StudentBody {
    idNameMap: numToString;
    nameIdMap: stringToNum;
}

interface Person {
    first: string,
    last: string
}

function greeter(person: Person) {
    return "Hello, " + person.first + " " + person.last;
}

let user = new Student("Jane", "L.", "Yuser");

document.body.innerHTML = greeter(user);