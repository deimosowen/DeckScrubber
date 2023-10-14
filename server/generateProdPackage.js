const fs = require('fs');
const path = require('path');

const generateProdPackage = () => {
    const basePackageJson = require('./package.json');

    const prodPackage = {
        name: basePackageJson.name,
        version: basePackageJson.version,
        scripts: {
            "init": "npm install",
            "start": "node server.bundle.js"
        },
        dependencies: {
            "sqlite3": basePackageJson.dependencies["sqlite3"]
        }
    };

    fs.writeFileSync(path.join(__dirname, '../dist', 'package.json'), JSON.stringify(prodPackage, null, 2));

    console.log("package.json for production generated successfully!");
};

module.exports = generateProdPackage;