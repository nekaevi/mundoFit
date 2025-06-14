// routes/professorRoutes.js
const express = require('express');
const router = express.Router();
const professorController = require('../controllers/professorController');

router.post('/', professorController.createProfessor);
router.get('/', professorController.getProfessores);
router.get('/:id', professorController.getProfessorById);
router.put('/:id', professorController.updateProfessor);
router.delete('/:id', professorController.deleteProfessor);

module.exports = router;
