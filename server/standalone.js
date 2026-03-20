const filePath= process.argv[2];
if(filePath==null) process.exit();
const {startServer}= require("./index");
startServer(filePath);