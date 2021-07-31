/*********************************************************************************
* WEB322 – Assignment 04
* I declare that this assignment is my own work in accordance with Seneca Academic Policy. No part
* of this assignment has been copied manually or electronically from any other source
* (including 3rd party web sites) or distributed to other students.
*
* Name: _______BOBBY LI_______ Student ID: __045895042___ Date: _July 30, 2021__
*
* Online (Heroku) Link: https://bli322a3.herokuapp.com/
*
********************************************************************************/ 

const express = require("express");

//Part 1 Step 1:
const exphbs = require("express-handlebars");

const path = require("path");
const data = require("./data-service.js");
const bodyParser = require('body-parser');
const fs = require("fs");
const multer = require("multer");
const app = express();

const HTTP_PORT = process.env.PORT || 8080;


//Part 1 Step 1:
app.engine('.hbs', exphbs({ 
    extname: '.hbs',
    // Part 1 Step 4:
    helpers: {
        navLink: function(url, options){
            return '<li' +
            ((url == app.locals.activeRoute) ? ' class="active" ' : '') +
            '><a href="' + url + '">' + options.fn(this) + '</a></li>';
        },
        equal: function (lvalue, rvalue, options) {
            if (arguments.length < 3)
            throw new Error("Handlebars Helper equal needs 2 parameters");
            if (lvalue != rvalue) {
            return options.inverse(this);
            } else {
            return options.fn(this);
            }
        }       
    }
 }));
app.set('view engine', '.hbs',);
//

// multer requires a few options to be setup to store files with file extensions
// by default it won't store extensions for security reasons
const storage = multer.diskStorage({
    destination: "./public/images/uploaded",
    filename: function (req, file, cb) {
      // we write the filename as the current date down to the millisecond
      // in a large web service this would possibly cause a problem if two people
      // uploaded an image at the exact same time. A better way would be to use GUID's for filenames.
      // this is a simple example.
      cb(null, Date.now() + path.extname(file.originalname));
    }
  });
  
  // tell multer to use the diskStorage function for naming files instead of the default.
  const upload = multer({ storage: storage });

app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));

// Part 1 Step 4:
app.use(function(req,res,next){
    let route = req.baseUrl + req.path;
    app.locals.activeRoute = (route == "/") ? "/" : route.replace(/\/$/, "");
    next();
   });   

app.get("/", (req,res) => {
    res.render("home.hbs");
});

app.get("/about", (req,res) => {
    res.render("about.hbs");
});

app.get("/images/add", (req,res) => {
    res.render("addImage.hbs");
});

app.get("/employees/add", (req,res) => {
    data.getDepartments().then(function (data) {
        res.render("addEmployee", {departments: data});
    }).catch(function (err) {
        res.render("addEmployee", {departments: []});
    })
});

app.get("/images", (req,res) => {
    fs.readdir("./public/images/uploaded", function(err, items) {
        res.render("images.hbs", {images:items});
    });
});

app.get("/employees", (req, res) => {
    if (req.query.status) {
        data.getEmployeesByStatus(req.query.status).then((data) => {
            if (data.length > 0)
                res.render("employees.hbs", {employees: data});
            else
                res.render("employees.hbs",{ message: "no results" });
        }).catch((err) => {
            res.render("employees.hbs", {message: "no results"});
        });
    } else if (req.query.department) {
        data.getEmployeesByDepartment(req.query.department).then((data) => {
            if (data.length > 0)
                res.render("employees.hbs", {employees: data});
            else
                res.render("employees.hbs",{ message: "no results" });
        }).catch((err) => {
            res.render("employees.hbs", {message: "no results"});
        });
    } else if (req.query.manager) {
        data.getEmployeesByManager(req.query.manager).then((data) => {
            if (data.length > 0)
                res.render("employees.hbs", {employees: data});
            else
                res.render("employees.hbs",{ message: "no results" });
        }).catch((err) => {
            res.render("employees.hbs", {message: "no results"});
        });
    } else {
        data.getAllEmployees().then((data) => {
            if (data.length > 0)
            {
                console.log(data + data.length)
                res.render("employees.hbs", {employees: data});
            }

            else
                res.render("employees.hbs",{ message: "no results" });
        }).catch((err) => {
            res.render("employees.hbs", {message: "no results"});
        });
    }
});

app.get("/employee/:empNum", (req, res) => {
    // initialize an empty object to store the values
    let viewData = {};
    
    data.getEmployeeByNum(req.params.empNum).then((data) => {
        if (data) {
            viewData.employee = data; //store employee data in the "viewData" object as "employee"
        } else {
            viewData.employee = null; // set employee to null if none were returned
        }
    }).catch(() => {
        viewData.employee = null; // set employee to null if there was an error
    }).then(data.getDepartments)
    .then((data) => {
        viewData.departments = data; // store department data in the "viewData" object as "departments"
        // loop through viewData.departments and once we have found the departmentId that matches
        // the employee's "department" value, add a "selected" property to the matching
        // viewData.departments object
        for (let i = 0; i < viewData.departments.length; i++) {
            if (viewData.departments[i].departmentId == viewData.employee.department) {
                viewData.departments[i].selected = true;
            }
        }
    }).catch(() => {
        viewData.departments = []; // set departments to empty if there was an error
    }).then(() => {
        if (viewData.employee == null) { // if no employee - return an error
            res.status(404).send("Employee Not Found");
        } else {
            res.render("employee", { viewData: viewData }); // render the "employee" view
        }
    });
});
   

/* app.get("/managers", (req,res) => {
    data.getManagers().then((data)=>{
        res.json(data);
    }).catch((err)=>{
        res.status(500).send("Unable to Update Employee");
       });
       ;
}); */

app.get("/departments", (req,res) => {
    data.getDepartments().then((data)=>{
        if (data.length > 0)
            res.render("departments.hbs", {departments : data});
        else
            res.render("departments.hbs",{ message: "no results" });
    }).catch((err) => {
        res.render("departments.hbs", {message: "no results"})
    });
});

// Part 5
app.post("/employee/update", (req, res) => {
    data.updateEmployee(req.body).then(()=>{
        res.redirect("/employees");
    }).catch((err)=>{
        res.status(500).send("Unable to Update Employee");
       });
       ;
   });

app.post("/employees/add", (req, res) => {
    data.addEmployee(req.body)
        .then(res.redirect('/employees'))
        .catch((err)=>{
            res.status(500).send("Unable to Add Employee");
           });
  });

app.post("/images/add", upload.single("imageFile"), (req,res) =>{
    res.redirect("/images");
});


// A4
app.get("/departments/add", (req,res) => {
    res.render("addDepartment.hbs");
});

app.post('/departments/add', function(req, res) {
    data.addDepartment(req.body)
        .then(res.redirect('/departments'))
        .catch((err) => res.status(500).send("Unable to Add Department"))
}) 

//

app.post("/department/update", (req, res) => {
    data.updateDepartment(req.body).then(()=>{
        res.redirect("/departments");
    }).catch((err)=>{
        res.status(500).send("Unable to Update Department");
       });
       ;
});

app.get("/department/:departmentId", (req, res) => {
    data.getDepartmentById(req.params.departmentId).then((data) => {
        console.log(data + data.length)
        if (data)
            res.render("department.hbs", {department: data});
        else
            res.status(404).send("Department Not Found");
    }).catch((err) => {
        res.status(404).send("Department Not Found");
    });
});

app.get("/departments/delete/:departmentId", (req, res) => {
    data.deleteDepartmentById(req.params.departmentId).then(() => {
        res.redirect("/departments");
    }).catch(() => {
            res.redirect("/departments")
            res.status(500).send("Unable to Remove Department / Department not found)")
        })
});

app.get("/employees/delete/:empNum", (req, res) => {
    data.deleteEmployeeByNum(req.params.empNum).then(() => {
        res.redirect("/employees")}).catch(() => {
            res.status(500).send("Unable to Remove Employee / Employee not found)")
        })
});

//
app.use((req, res) => {
    res.status(404).send("Page Not Found");
  });

data.initialize().then(function(){
    app.listen(HTTP_PORT, function(){
        console.log("app listening on: " + HTTP_PORT)
    });
}).catch(function(err){
    console.log("unable to start server: " + err);
});