const mysql= require('mysql2');
const art= require('ascii-art')
const inquirer = require('inquirer');
const db = mysql.createConnection(
    {
      host: 'localhost',
      // MySQL username,
      user: 'root',
      // MySQL password
      password: 'Plokmn0978=-',
      database: 'employee_db'
    },
    console.log(`Connected to the emplyee_db database.`)
  );

spChoices=[
  'View All Employees',
  'View Employees by Department',
  'View Employees by Manager',
  'Add Employee',
  'Remove Employee',
  'Update Employee Role',
  'Update Employee Manager',
  'View All Roles',
  'Add Role',
  'Remove Role',
  'Veiw all Departments',
  'Add Department',
  'Remove Department',
  'Veiw Total Utilized Budget by Department',
  'Quit'
]
departments=[]
managers=[]
roles=[]
db.query('SELECT * FROM departments', function (err, results) {
  results.forEach(element =>{
    departments.push(element.name)
  });
});
db.query(`SELECT CONCAT(m.first_name, ' ', m.last_name) AS manager 
FROM employees AS e LEFT JOIN employees AS m ON e.manager_id = m.id
WHERE m.id IS NOT NULL`, function (err, results) {
  results.forEach(element =>{
    if (!managers.includes(element.manager)){
    managers.push(element.manager)
    }
  });
});
db.query(`SELECT title FROM employee_db.roles`, function (err, results) {
  results.forEach(element =>{
    roles.push(element.title)
  });
})

inquirer
    .prompt([
      {
        
        type: 'list',
        name: 'startingPoint',
        message: `What would you like to do?`,
        choices: spChoices,
      },
      {
        type:'list',
        name:'employeesbyDep',
        message: 'Which Department would you like to see employees for?',
        choices: departments,
        when:(answers)=> answers.startingPoint==='View Employees by Department'
      },
      {
        type:'list',
        name:'employeesbyMan',
        message: 'Which Manager would you like to see employees for?',
        choices: managers,
        when:(answers)=> answers.startingPoint==='View Employees by Manager'
      }
    ])
    .then(answers => {
      switch(answers.startingPoint){
        case 'View All Employees':
          viewEmployees();
          break;
        case 'View Employees by Department':
          viewByDep(answers.employeesbyDep);
          break;
        case 'View Employees by Manager':
          viewbyMan(answers.employeesbyMan);
          break;
        case 'Add Employee':
          addEmployee();
          break;
        case 'Remove Employee':
          
          break;
        case 'Update Employee Role':
          UpEmployeeRole();
          break;
        case 'Update Employee Manager': 
        
          break;
        case 'View All Roles':
          viewAllRoles();
          break;
        case 'Add Role':
          addRole();
          break;
        case 'Remove Role':
          
          break;
        case 'Veiw all Departments':
          viewAllDeps();
          break;
        case 'Add Department':
          addDep();
          break;
        case 'Remove Department':
          
          break;
        case 'Veiw Total Utilized Budget by Department':
          
          break;
        case 'Quit':
          db.end()
          return;
      }
      
    })



let viewEmployees = () =>{
db.query(`SELECT employees.id, employees.first_name, employees.last_name, roles.title, roles.salary, departments.name AS department
          FROM employees
          JOIN roles ON employees.role_id=roles.id
          JOIN departments ON roles.department_id=departments.id`, function (err, results) {
    console.table(results);
});
}

let viewByDep = (department)=>{
  db.query(`SELECT employees.id, employees.first_name, employees.last_name, departments.name AS department 
  FROM employees 
  INNER JOIN roles ON employees.role_id = roles.id 
  INNER JOIN departments ON roles.department_id = departments.id 
  WHERE departments.name = '${department}'
  ORDER BY employees.id`, function (err, results) {
    console.table(results);
});
}

let viewbyMan = (manager) =>{
  db.query(`SELECT e.id, e.first_name, e.last_name, CONCAT(m.first_name, ' ', m.last_name) AS manager 
  FROM employees AS e LEFT JOIN employees AS m ON e.manager_id = m.id
  WHERE CONCAT(m.first_name, ' ', m.last_name) = '${manager}'`, function (err,results){
    console.table(results)
  })
}

let viewAllDeps = () =>{
  db.query('SELECT * FROM departments', function (err, results) {
    console.table(results);
});
}

let viewAllRoles = () =>{
  db.query(`SELECT roles.id,roles.title,roles.salary, departments.name as department
            FROM roles
            join departments ON roles.department_id=departments.id`, function (err, results) {
    console.table(results);
  })
}

let addRole= ()=>{
  inquirer
    .prompt([
      {
        type:'input',
        message:'What is the name of the New role?',
        name: 'roleName'
      },
      {
        type:'number',
        message:'What is the salary of the New role?',
        name: 'roleSal'
      },
      {
        type:'list',
        message:'What is the department of the New role?',
        name: 'roleDep',
        choices:departments
      }
    ]).then(answers=>{
      let depID
      db.query(`SELECT departments.id FROM departments
      WHERE departments.name="${answers.roleDep}";`, function(err,results6){
        if(err){
          console.error(err);
        }
        depID=results6[0].id
        db.query(`INSERT INTO roles (title, salary, department_id)
                  VALUES ('${answers.roleName}',${answers.roleSal},${depID})`, function (err,results){
                    if(err){
                      console.error(err);
                    }
                  })
      })
    })
}

let  addEmployee= async ()=>{
  managers.push('None')
inquirer
  .prompt([
    {
        type:'input',
        message:'What is the first name of the New Employee?',
        name: 'employeefName'
    },
    {
      type:'input',
      message:'What is the last name of the New Employee?',
      name: 'employeelName'
    },
    {
      type:'list',
      message:`What is the employee's role?`,
      name: 'employeeRole',
      choices: roles
    },
    {
      type:'list',
      message:`Who is your manager?`,
      name: 'employeeManager',
      choices: managers
    }
  ]).then(async answers=>{
    let variable1
     db.query(`SELECT roles.id FROM roles 
      WHERE roles.title = "${answers.employeeRole }"`, async function (err, results) {
        if(err){
          console.error(err);
        }
      variable1= await results[0].id
      let variable2
      if(answers.employeeManager==="None"){
        variable2=null
      }else if(managers.includes(answers.employeeManager)){
        db.query(`SELECT employees.id FROM employees 
        WHERE CONCAT(employees.first_name, ' ', employees.last_name) = "${answers.employeeManager }"`, async function (err, results1) {
          if(err){
            console.error(err);
          }
        variable2= await results1[0].id
        db.query(`INSERT INTO employees (first_name, last_name, role_id,manager_id)
                  VALUES ('${answers.employeefName}','${answers.employeelName}','${variable1}','${variable2}');`, function (err, results2) {
      if(err){console.error(err);}
    });
      });
      }
      });

    });
}

let UpEmployeeRole= ()=>{
  let employeeNames=[]
db.query(`SELECT CONCAT(employees.first_name, ' ', employees.last_name) AS Names
          FROM employees `,function(err,results){
            console.log(results)
            results.forEach(element =>{
              if (!employeeNames.includes(element.Names)){
                employeeNames.push(element.Names)
              }
            });
            inquirer
              .prompt([
                {
                  type:'list',
                  name:'upDateEmployee',
                  message:"Which Employee would you like to update?",
                  choices:employeeNames,
                },
                {
                  type:'list',
                  name:'upDateEmployeeRole',
                  message:"Which Role would you like to give the Employee?",
                  choices:roles,
                }
              ]).then(answers=>{
                let rolesID
                let namesID
                db.query(`SELECT employees.id FROM employees
                          WHERE CONCAT(employees.first_name, ' ', employees.last_name) = "${answers.upDateEmployee}"`, function(err,results3){
                            if(err){
                              console.error(err);
                            }
                            namesID=results3[0].id
                            db.query(`SELECT roles.id FROM roles 
                            WHERE roles.title = "${answers.upDateEmployeeRole}"`, function (err, results4) {
                              if(err){
                                console.error(err);
                              }
                              rolesID=results4[0].id
                              db.query(`UPDATE employees
                              SET employees.role_id=${rolesID}
                              WHERE employees.id=${namesID}`, function (err, results5) {
                                if(err){
                                  console.error(err);
                                }
                              })
                            })
                          })

              
              })                        
              
          })
}

let addDep= ()=>{
  inquirer
    .prompt([
    {
      type:'input',
      message:'What is the name of the New Department?',
      name: 'depName'
    }
    ]).then(answers=>{
      db.query(`INSERT INTO departments (name)
                VALUES ('${answers.depName}')`)
    })
}