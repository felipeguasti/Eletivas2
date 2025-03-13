const express = require("express");
const router = express.Router();
const studentsController = require("../controllers/studentsController");

router.get("/buscar", studentsController.searchStudents);

module.exports = router;
