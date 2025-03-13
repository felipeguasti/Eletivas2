const Student = require("../models/Estudante"); // Importa o modelo de estudantes

exports.searchStudents = async (req, res) => {
    try {
        const { nome, turma, eletiva } = req.query;

        // Criando o filtro dinâmico com base nos parâmetros fornecidos
        const whereClause = {};
        if (nome) whereClause.nome = { [Op.like]: `%${nome}%` }; // Busca por nome parcial
        if (turma) whereClause.turma = turma; // Busca exata por turma
        if (eletiva) whereClause.eletiva = eletiva; // Busca exata por eletiva

        // Busca os alunos filtrados no banco de dados
        const students = await Student.findAll({ where: whereClause });

        // Retorna os alunos encontrados
        res.json(students);
    } catch (error) {
        console.error("Erro ao buscar estudantes:", error);
        res.status(500).json({ message: "Erro ao buscar estudantes." });
    }
};
