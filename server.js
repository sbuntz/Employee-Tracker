const mysql = require('mysql2');
const inquirer = require('inquirer');
const table = require("console.table");
const util = require('util');
const {
    connect
} = require('http2');

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
        .prompt([{
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
        }])

        .then(answers => {

            switch (answers.selection) {

                case "View All Employees":
                    viewAllEmployees();
                    break;

                case "Update Employee's Role":
                    updateEmployeesRole();
                    break;

                case "Add New Employee":
                    addNewEmployee();
                    break;

                case "Delete Employee":
                    deleteEmployee();
                    break;

                case "View All Departments":
                    viewAllDepartments();
                    break;

                case "Add New Department":
                    addNewDepartment();
                    break;

                case "Delete Department":
                    deleteDepartment();
                    break;

                case "View All Roles":
                    viewAllRoles();
                    break;

                case "Add New Role":
                    addNewRole();
                    break;

                case "Delete Role":
                    deleteRole();
                    break;

                case "Exit":
                    exit();
                    break;
            }
        });
};

function viewAllEmployees() {

    let query = `
    SELECT 
        CONCAT(e.first_name, " ", e.last_name) AS Employee, 
        r.title as "Job Title", 
        r.salary AS Salary, 
        d.name AS Department, 
        CONCAT(m.first_name, ' ', m.last_name) AS Manager
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
        CONCAT(e.first_name, " ", e.last_name) AS employee,
        r.id AS roleID,
        r.title
    FROM employees e
    LEFT JOIN roles r
        ON e.role_id = r.id`;

    connection.query(query, (err, res) => {
        if (err) throw err;

        let chosenEmployee = res.map(({
            employee,
            id
        }) => ({
            name: employee,
            value: id,
        }))

        let chosenRole = res.map(({
            title,
            roleID
        }) => ({
            name: title,
            value: roleID,
        }))

        inquirer
            .prompt([{
                    type: "list",
                    message: "What employee's role has changed?",
                    name: "employeeSelected",
                    choices: chosenEmployee
                },
                {
                    type: "list",
                    message: "What is their new role?",
                    name: "roleSelected",
                    choices: chosenRole
                }
            ])

            .then(answers => {

                let chosenRole = answers.roleSelected;
                let chosenEmployee = answers.employeeSelected;

                let query = `UPDATE employees SET role_id = ? WHERE id = ?`;

                connection.query(query, [chosenRole, chosenEmployee], (err, res) => {
                    if (err) throw err;
                    viewAllEmployees();
                });
            });
        });
    }


function addNewEmployee() {

    let query = `SELECT * FROM roles`;

    connection.query(query, (err, res) => {
        if (err) throw err;
        let chosenRole = res.map(({
            title,
            id
        }) => ({
            name: title,
            value: id,
        }));

        inquirer
        .prompt([{
                type: "input",
                name: "firstName",
                message: "What is the employee's first name?"
            },
            {
                type: "input",
                name: "lastName",
                message: "What is the employee's last name?"
            },
            {
                type: "list",
                name: "roleSelected",
                message: "What is the employee's role?",
                choices: chosenRole
            }
        ])

        .then((answers) => {

            let query = `INSERT INTO employees SET ?`
            connection.query(query, {
                first_name: answers.firstName,
                last_name: answers.lastName,
                role_id: answers.roleSelected
            }, (err, res) => {
                if (err) throw err;
                viewAllEmployees();
            });
        });
    });
}



function deleteEmployee() {

    let query = `
    SELECT 
        id, 
        CONCAT(first_name, " ", last_name) AS employee
    FROM employees `;

    connection.query(query, (err, res) => {
        if (err) throw err;

        let chosenEmployee = res.map(({
            employee,
            id
        }) => ({
            name: employee,
            value: id,
        }));

        inquirer
        .prompt([{
            type: "list",
            name: "employeeSelected",
            message: "Which employee do you wish to delete?",
            choices: chosenEmployee
        }])

        .then((answers) => {

            let query = `DELETE FROM employees WHERE ?`;
            connection.query(query, {
                id: answers.employeeSelected
            }, (err, res) => {
                if (err) throw err;
                viewAllEmployees();
            });
        });
    });

}


function viewAllDepartments() {

    connection.query("SELECT name as Department FROM departments", (err, res) => {
        if (err) throw err;
        console.table(res)
        prompt();
    });

}

function addNewDepartment() {

    inquirer
        .prompt([{
            type: "input",
            name: "departmentName",
            message: "What is the name of the new department?",
        }])

        .then((answers) => {

            connection.query("INSERT INTO departments SET ?", {
                name: answers.departmentName
            }, (err, res) => {
                if (err) throw err;
                viewAllDepartments();
            });
        });
}


function deleteDepartment() {

    let query = `
    SELECT *
    FROM departments`;

    connection.query(query, (err, res) => {
        if (err) throw err;

        let chosenDepartment = res.map(({
            name,
            id
        }) => ({
            name: name,
            value: id,
        }));

        inquirer
        .prompt([{
            type: "list",
            name: "departmentSelected",
            message: "What is the department you wish to delete?",
            choices: chosenDepartment
        }])

        .then((answers) => {
            let query = `DELETE FROM departments WHERE ?`;
            connection.query(query, {
                id: answers.departmentSelected
            }, (err, res) => {
                if (err) throw err;
                viewAllDepartments();
            });
        });
    });
}


function viewAllRoles() {

    connection.query("SELECT title as Title, salary as Salary FROM roles", (err, res) => {
        if (err) throw err;
        console.table(res)
        prompt();
    });
}


function addNewRole() {

    connection.query("SELECT * FROM departments", (err, res) => {
        if (err) throw err;

        let chosenDepartment = res.map(({
            name,
            id
        }) => ({
            name: name,
            value: id,
        }));
        
        inquirer
        .prompt([{
                type: "input",
                name: "roleName",
                message: "What is the title of the new role?",
            },
            {
                type: "number",
                name: "roleSalary",
                message: "What is the salary for this role?"
            },
            {
                type: "list",
                name: "name",
                message: "What department is this role for?",
                choices: chosenDepartment
            }])

        .then((answers) => {

            connection.query("INSERT INTO roles SET ?", {

                title: answers.roleName,
                salary: answers.roleSalary,
                department_id: answers.departmentID

            }, (err, res) => {
                if (err) throw err;
                viewAllRoles();
            });
        });
    });

}


function deleteRole() {

    let query = `
    SELECT *
    FROM roles`;

    connection.query(query, (err, res) => {
        if (err) throw err;

        let chosenRole = res.map(({
            title,
            id
        }) => ({
            name: title,
            value: id,
        }));

        inquirer
        .prompt([{
            type: "list",
            name: "roleSelected",
            message: "Select the role you wish to remove:",
            choices: chosenRole
        }])

        .then((answers) => {
            let query = `DELETE FROM roles WHERE ?`;
            connection.query(query, {
                id: answers.roleSelected
            }, (err, res) => {
                if (err) throw err;
                viewAllRoles();
            });
        });
    });

}



function exit() {
    connection.end();
}