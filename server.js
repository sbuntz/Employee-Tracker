const mysql = require('mysql2');
const inquirer = require('inquirer');
const table = require("console.table");
const util = require('util');
const { connect } = require('http2');

const connection = mysql.createConnection({

    host: 'localhost',
    port: 3306,
    user: 'root',
    password: 'Notitia@123',
    database: 'company_DB',
});

console.log(
    `
  Company Database Manager  
` + "\n"
);

connection.connect((err) => {
    if (err) throw err;
    prompt();
});

function prompt() {

    inquirer
        .prompt([
            {
                type: "list",
                message: "What would you like to do?",
                name: "selection",
                choices: [
                    "View All Employees",
                    "Update Employee's Role",
                    "Add New Employee",
                    "Delete Employee",
                    "View All Departments",
                    "Add New Department",
                    "Delete Department",
                    "View All Roles",
                    "Add New Role",
                    "Delete Role",
                    "Exit"
                ]
            }
        ])

        .then(answers => {

            //how to get index from choices array?
            switch (answers.selection) {

                case "View All Employees": viewAllEmployees();
                    break;

                case "Update Employee's Role": updateEmployeesRole();
                    break;

                case "Add New Employee": addNewEmployee();
                    break;

                case "Delete Employee": deleteEmployee();
                    break;

                case "View All Departments": viewAllDepartments();
                    break;

                case "Add New Department": addNewDepartment();
                    break;

                case "Delete Department": deleteDepartment();
                    break;

                case "View All Roles": viewAllRoles();
                    break;

                case "Add New Role": addNewRole();
                    break;
                
                case "Delete Role": deleteRole();
                    break;

                case "Exit": exit();
                    break;
            }
        });
};

function viewAllEmployees() {

    let query = `
    SELECT 
        e.id, 
        CONCAT(e.first_name, " ", e.last_name) AS name, 
        r.title, 
        d.name AS department, 
        r.salary, 
        CONCAT(m.first_name, ' ', m.last_name) AS manager
    FROM employees e
        LEFT JOIN roles r
        ON e.role_id = r.id
        LEFT JOIN departments d
        ON d.id = r.department_id
        LEFT JOIN employees m
        ON m.id = e.manager_id`;

    connection.query(query, (err, res) => {
        if (err) throw err;

        employeeInfo = res;
        console.table(employeeInfo);
        prompt();
    });
}

function updateEmployeesRole() {

    let query = `
    SELECT 
        e.id, 
        CONCAT(e.first_name, " ", e.last_name) AS name, 
        r.title, 
        d.name AS department, 
        r.salary, 
        CONCAT(m.first_name, ' ', m.last_name) AS manager
    FROM employees e
        LEFT JOIN roles r
        ON e.role_id = r.id
        LEFT JOIN departments d
        ON d.id = r.department_id
        LEFT JOIN employees m
        ON m.id = e.manager_id`;

    connection.query(query, (err, res) => {
        if (err) throw err;

        let employee = res.map(function (obj) {
            return `Name: ${obj.name} ID: ${obj.id}`;
        });

        selectRole(employee);
    });

}

function selectRole(employee) {

    let query = `SELECT id, title, salary FROM roles`;

    connection.query(query, (err, res) => {
        if (err) throw err;
        let role = res.map(function (obj) {
            return `Role: ${obj.title} Salary: ${obj.salary} ID: ${obj.id}`;
        });

        changeEmployeeRole(employee, role);
    });
}

function changeEmployeeRole(employee, role) {

    inquirer
        .prompt([
            {
                type: "list",
                message: "Select the employee whose role you wish to update:",
                name: "employeeSelect",
                choices: employee
            },
            {
                type: "list",
                message: "Select the new role to apply:",
                name: "roleSelect",
                choices: role
            }
        ])

        .then(answers => {

            // this seems a bit clunky, is there a better way?
            let chosenRole = answers.roleSelect.replace(/^([^:]+\:){3}/, '').trim();
            let chosenEmployee = answers.employeeSelect.replace(/^([^:]+\:){2}/, '').trim();

            console.log(chosenRole);
            console.log(chosenEmployee);

            let query = `UPDATE employees SET role_id = ? WHERE id = ?`;
            connection.query(query, [chosenRole, chosenEmployee], (err, res) => {
                if (err) throw err;
                prompt();
            });
        });

}

function addNewEmployee() {

    let query = `SELECT id, title, salary FROM roles`;

    connection.query(query, (err, res) => {
        if (err) throw err;
        let role = res.map(function (obj) {
            return `Role: ${obj.title} Salary: ${obj.salary} ID: ${obj.id}`;
        });

        newEmployeeWithRole(role);
    });
}

function newEmployeeWithRole(role) {

    inquirer
        .prompt([
            {
                type: "input",
                name: "firstName",
                message: "Enter the employee's first name:"
            },
            {
                type: "input",
                name: "lastName",
                message: "Enter the employee's last name:"
            },
            {
                type: "list",
                name: "roleSelect",
                message: "Select the employee's role:",
                choices: role
            }
        ])

        .then((answers) => {

            let chosenRole = answers.roleSelect.replace(/^([^:]+\:){3}/, '').trim();

            let query = `INSERT INTO employees SET ?`
            connection.query(query, {
                first_name: answers.firstName,
                last_name: answers.lastName,
                role_id: chosenRole
            }, (err, res) => {
                if (err) throw err;
                prompt();
            });
        });
}

function deleteEmployee() {

    let query = `
    SELECT 
        e.id, 
        CONCAT(e.first_name, " ", e.last_name) AS name, 
        r.title, 
        d.name AS department, 
        r.salary, 
        CONCAT(m.first_name, ' ', m.last_name) AS manager
    FROM employees e
        LEFT JOIN roles r
        ON e.role_id = r.id
        LEFT JOIN departments d
        ON d.id = r.department_id
        LEFT JOIN employees m
        ON m.id = e.manager_id`;

    connection.query(query, (err, res) => {
        if (err) throw err;

        let employee = res.map(function (obj) {
            return `Name: ${obj.name} ID: ${obj.id}`;
        });

        removeSelectedEmployee(employee);
    });

}

function removeSelectedEmployee(employee) {

    inquirer
        .prompt([
            {
                type: "list",
                name: "employeeSelect",
                message: "Select the employee you wish to remove:",
                choices: employee
            }
        ])

        .then((answers) => {

            let chosenEmployee = answers.employeeSelect.replace(/^([^:]+\:){2}/, '').trim();
            let query = `DELETE FROM employees WHERE ?`;
            connection.query(query, { id: chosenEmployee }, (err, res) => {
                if (err) throw err;
                prompt();
            });
        });
}

function viewAllDepartments() {

    connection.query("SELECT * FROM departments", (err, res) => {
        if (err) throw err;
        console.table(res)
        prompt();
    });

}

function addNewDepartment() {

    inquirer
        .prompt([
            {
                type: "input",
                name: "departmentName",
                message: "Enter the name of the new department:",
            }
        ])

        .then((answers) => {

            connection.query("INSERT INTO departments SET ?", { name: answers.departmentName }, (err, res) => {
                if (err) throw err;
                prompt();
            });
        });
}


function deleteDepartment() {

    let query = `
    SELECT *
    FROM departments`;

    connection.query(query, (err, res) => {
        if (err) throw err;

        let department = res.map(function (obj) {
            return `Department: ${obj.name} ID: ${obj.id}`;
        });

        removeSelectedDepartment(department);
    });

}


function removeSelectedDepartment(department) {

    inquirer
        .prompt([
            {
                type: "list",
                name: "departmentSelect",
                message: "Select the department you wish to remove:",
                choices: department
            }
        ])

        .then((answers) => {

            let chosenDepartment = answers.departmentSelect.replace(/^([^:]+\:){2}/, '').trim();
            let query = `DELETE FROM departments WHERE ?`;
            connection.query(query, { id: chosenDepartment }, (err, res) => {
                if (err) throw err;
                prompt();
            });
        });
}


function viewAllRoles() {

    connection.query("SELECT * FROM roles", (err, res) => {
        if (err) throw err;
        console.table(res)
        prompt();
    });

}


function addNewRole() {

    connection.query("SELECT * FROM departments", (err, res) => {
        if (err) throw err;
        addRoleDetails(res);
    });

}

function addRoleDetails(departments) {

    inquirer
        .prompt([
            {
                type: "input",
                name: "roleName",
                message: "Enter the title of the new role:",
            },
            {
                type: "number",
                name: "roleSalary",
                message: "Enter the salary for this role:"
            },
            {
                type: "list",
                name: "departmentID",
                message: "Select the department for this role:",
                choices() {
                    return departments.map(({ id, name }) => {
                        return {
                            name: name, value: id
                        };
                    });
                }
            }
        ])

        .then((answers) => {

            // console.log(answers.departmentID);

            connection.query("INSERT INTO roles SET ?", {

                title: answers.roleName,
                salary: answers.roleSalary,
                department_id: answers.departmentID

            }, (err, res) => {
                if (err) throw err;
                prompt();
            });
        });
}



function deleteRole() {

    let query = `
    SELECT *
    FROM roles`;

    connection.query(query, (err, res) => {
        if (err) throw err;

        let role = res.map(function (obj) {
            return `Role: ${obj.title} ID: ${obj.id}`;
        });

        removeSelectedDepartment(role);
    });

}


function removeSelectedRole(role) {

    inquirer
        .prompt([
            {
                type: "list",
                name: "roleSelect",
                message: "Select the role you wish to remove:",
                choices: role
            }
        ])

        .then((answers) => {

            let chosenRole = answers.roleSelect.replace(/^([^:]+\:){2}/, '').trim();
            let query = `DELETE FROM roles WHERE ?`;
            connection.query(query, { id: chosenRole }, (err, res) => {
                if (err) throw err;
                prompt();
            });
        });
}



function exit() {

    connection.end();

}


/*  attempting to get async to work */