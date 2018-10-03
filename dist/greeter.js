var Student = /** @class */ (function () {
    function Student(first, middleInitial, last) {
        this.first = first;
        this.middleInitial = middleInitial;
        this.last = last;
        this.fullName = first + " " + middleInitial + " " + last;
    }
    return Student;
}());
var StudentBody = /** @class */ (function () {
    function StudentBody() {
    }
    return StudentBody;
}());
function greeter(person) {
    return "Hello, " + person.first + " " + person.last;
}
var user = new Student("Jane", "L.", "Yuser");
document.body.innerHTML = greeter(user);
