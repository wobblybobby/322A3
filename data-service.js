/* const fs = require("fs");

let employees = [];
let departments = []; */

const Sequelize = require('sequelize');

var sequelize = new Sequelize('d6pgkb4a1emsvo', 'vzfyqluipufpvc', '03c746a0e91d47f7166642de827cdc08dac497aa06ee2bf9231fac07a6084408', {
    host: 'ec2-52-86-2-228.compute-1.amazonaws.com',
    dialect: 'postgres',
    port: 5432,
    dialectOptions: {
    ssl: { rejectUnauthorized: false }
    },
    query: {
        raw: true
    }
});

var Employee = sequelize.define('Employee', {
    employeeNum: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    firstName: Sequelize.STRING,
    lastName: Sequelize.STRING,
    email: Sequelize.STRING,
    SSN: Sequelize.STRING,
    addressStreet: Sequelize.STRING,
    addressCity: Sequelize.STRING,
    addressState: Sequelize.STRING,
    addressPostal: Sequelize.STRING,
    maritalStatus: Sequelize.STRING,
    isManager: Sequelize.BOOLEAN,
    employeeManagerNum: Sequelize.INTEGER,
    status: Sequelize.STRING,
    hireDate: Sequelize.STRING
},{
    createdAt: false, // disable createdAt
    updatedAt: false // disable updatedAt
});

var Department = sequelize.define('Department', {
    departmentId: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    departmentName: Sequelize.STRING
},{
    createdAt: false, // disable createdAt
    updatedAt: false // disable updatedAt
});

Department.hasMany(Employee, {foreignKey: 'department'});

module.exports.initialize = function () {
    return new Promise(function (resolve, reject) {
        sequelize.sync().then(function () {
                resolve()
            }).catch(function () {
                reject('unable to sync the database')
            });
       });
}

module.exports.getAllEmployees = function(){
    return new Promise(function (resolve, reject) {
        Employee.findAll().then(function(data){
            resolve(data)
        }).catch(function() {
            reject('no results returned')
        });
    });
}

module.exports.addEmployee = function (employeeData) {
    return new Promise(function (resolve, reject) {
        employeeData.isManager = (employeeData.isManager) ? true : false;
        for (prop in employeeData){
            if (employeeData[prop] == "")
                employeeData[prop] = null;
        }
        Employee.create({
            employeeNum: employeeData.employeeNum,
            firstName: employeeData.firstName,
            lastName: employeeData.lastName,
            email: employeeData.email,
            SSN: employeeData.SSN,
            addressStreet: employeeData.addressStreet,
            addressCity: employeeData.addressCity,
            addressState: employeeData.addressState,
            addressPostal: employeeData.addressPostal,
            maritalStatus: employeeData.maritalStatus,
            isManager: employeeData.isManager,
            employeeManagerNum: employeeData.employeeManagerNum,
            status: employeeData.status,
            hireDate: employeeData.hireDate,
            department: employeeData.department
        }).then(function () {
            resolve('success')
        }).catch(function (err){
            reject('unable to create employee')
        })
       });
};

module.exports.getEmployeeByNum = function (num) {
    return new Promise(function (resolve, reject) {
        Employee.findAll({
            where:{
                employeeNum: num
            }
            }).then(function(data){
                resolve(data[0])
            }).catch(function (){
                reject('no results returned')
            })
       });
};

module.exports.getEmployeesByStatus = function (status) {
    return new Promise(function (resolve, reject) {
        Employee.findAll({
            where:{
                status: status
            }
        }).then(function (data){
            resolve(data)
        }).catch(function (){
            reject('no results returned')
        })
       });
};


module.exports.getEmployeesByDepartment = function (department) {
    return new Promise(function (resolve, reject) {
        Employee.findAll({
            where:{
                department: department
            }
            }).then(function(data){
                resolve(data)
            }).catch(function (){
                reject('no results returned')
            })
       });
};

module.exports.getEmployeesByManager = function (manager) {
    return new Promise(function (resolve, reject) {
        Employee.findAll({
            where:{
                employeeManagerNum: manager
            }
            }).then(function(data){
                resolve(data)
            }).catch(function (){
                reject('no results returned')
            })
       });
};

/* module.exports.getManagers = function () {
    return new Promise(function (resolve, reject) {
        reject();
       });
}; */

module.exports.getDepartments = function(){
    return new Promise(function (resolve, reject) {
        Department.findAll().then(function (data){
            resolve(data)
        }).catch(function (err){
            reject('no results returned')
        })
       });
}

module.exports.updateEmployee = function(employeeData){
    return new Promise(function (resolve, reject) {
        employeeData.isManager = (employeeData.isManager) ? true : false;
        for (prop in employeeData){
            if (employeeData[prop] == "")
                employeeData[prop] = null;
        }
        Employee.update(employeeData, {
            where: {
                employeeNum: employeeData.employeeNum
            }
        }).then(function (data){
            resolve(data)
        }).catch(function (){
            reject('unable to update employee')
        })
    });
};

module.exports.addDepartment = function(departmentData){
    return new Promise(function (resolve, reject) {
        for (prop in departmentData){
            if (departmentData[prop] == "")
                departmentData[prop] = null;
        }
        Department.create({
            departmentId : departmentData.departmentId,
            departmentName: departmentData.departmentName
        }).then(function () {
            resolve('success')
        }).catch(function (){
            reject('unable to create department')
        })
    });
}

module.exports.updateDepartment = function(departmentData){
    return new Promise(function (resolve, reject) {
        for (prop in departmentData){
            if (departmentData[prop] == "")
                departmentData[prop] = null;
        }
        Department.update(departmentData, {
            where: {
                departmentId: departmentData.departmentId
            }
        }).then(function (data){
            resolve(data)
        }).catch(function (){
            reject('unable to update department')
        })
    });
}

module.exports.getDepartmentById = function(id){
    return new Promise(function (resolve, reject) {
        Department.findAll({
            where:{
                departmentId: id
            }
            }).then(function(data){
                resolve(data[0])
            }).catch(function (){
                reject('no results returned')
            })
    });
}

module.exports.deleteDepartmentById = function(id){
    return new Promise(function (resolve, reject) {
        console.log(id)
        Department.destroy({
            where: {
                departmentId: id
            }
        }).then(function (){
            resolve('success')
        }).catch(function (err){
            reject('unable to delete department')
        })
    });
}

module.exports.deleteEmployeeByNum = function(empNum) {
    return new Promise(function (resolve, reject) {
        Employee.destroy({
            where: {
                employeeNum: empNum
            }
        }).then(function (){
            resolve(Employee.destroy({
                where: {
                    employeeNum: empNum
                }
            }))
        }).catch(function () {
            reject('unable to delete employee')
        })
    })
}