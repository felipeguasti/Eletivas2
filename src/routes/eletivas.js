const express = require('express');
const router = express.Router();
const electiveController = require('../controllers/electiveController');

router.post('/escolha', electiveController.chooseElective);
router.get("/buscar", electiveController.buscarEletivas);
router.get("/resultado", electiveController.resultadoEletiva);

module.exports = router;