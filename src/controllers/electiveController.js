const Estudante = require('../models/Estudante');
const Eletiva = require('../models/Eletiva');
const db = require('../config/db'); 
const { Op } = require("sequelize");

// Função para padronizar nome
exports.normalizeName = (name) => {
    return name
        .normalize("NFD") // Separa os caracteres acentuados
        .replace(/[\u0300-\u036f]/g, "") // Remove acentos
        .replace(/ç/g, "C") // Substitui ç por C
        .replace(/[^a-zA-Z\s]/g, "") // Remove caracteres especiais
        .toUpperCase() // Converte para maiúsculas
        .trim(); // Remove espaços extras
};

exports.chooseElective = async (req, res) => {
    const { turma, nome, eletivaId } = req.body;

    // Verificar se os dados foram enviados
    if (!turma || !nome || !eletivaId) {
        return res.status(400).json({ message: "Todos os campos são obrigatórios." });
    }

    // Padronizar nome do estudante
    const nomePadronizado = exports.normalizeName(nome); // Alterado para usar normalizeName exportada

    try {
        // Verificar se o estudante existe na turma informada
        const estudante = await Estudante.findOne({ 
            where: { nome: nomePadronizado, turma }
        });

        console.log('Estudante encontrado:', estudante);

        if (!estudante) {
            return res.status(404).json({ message: "Nenhum usuário encontrado com esse nome na turma informada." });
        }

        // Verificar se o estudante já escolheu uma eletiva
        if (estudante.eletivaId !== null) {
            return res.status(400).json({ message: "Você já escolheu uma eletiva. Não pode alterar a escolha." });
        }

        // Contar quantos alunos já escolheram essa eletiva
        const totalAlunos = await Estudante.count({ where: { eletivaId: eletivaId } });
        
        console.log('Total de alunos escolhendo a eletiva:', totalAlunos);

        // Buscar a eletiva pelo ID para obter o nome
        const eletiva = await Eletiva.findByPk(eletivaId);

        console.log('Eletiva encontrada:', eletiva);

        if (!eletiva) {
            return res.status(404).json({ message: "Eletiva não encontrada." });
        }

        const vagasRestantes = 35 - totalAlunos;

        console.log('Vagas restantes para a eletiva:', vagasRestantes);

        // Verificar se a eletiva já atingiu o limite de alunos
        if (vagasRestantes <= 0) {
            return res.status(400).json({ message: `As vagas para a Eletiva ${eletiva.nome} estão esgotadas.` });
        }

        // Atualizar a escolha do estudante
        await estudante.update({ eletivaId });

        console.log('Estudante atualizado:', estudante);

        // Retornar resposta com o nome da eletiva e número de vagas restantes
        return res.status(200).json({
            message: `Eletiva ${eletiva.nome} escolhida com sucesso!`,
            nomeEletiva: eletiva.nome,
            vagasRestantes
        });

    } catch (error) {
        console.error("Erro ao processar escolha de eletiva:", error);
        return res.status(500).json({ message: "Erro interno do servidor." });
    }
};



exports.buscarEletivas = async (req, res) => {
    try {
        // Buscando todas as eletivas com os dados necessários
        const eletivas = await Eletiva.findAll({
            attributes: ['id', 'nome', 'professor'], 
            order: [['nome', 'ASC']],
            include: [{
                model: Estudante,
                as: 'estudantes', 
                attributes: [] 
            }],
            group: ['Eletiva.id'], 
            raw: true 
        });

        // Contar os estudantes diretamente usando o count do Sequelize
        const eletivasComVagas = await Promise.all(eletivas.map(async (eletiva) => {
            const vagasOcupadas = await Estudante.count({
                where: { eletivaId: eletiva.id }
            });
            const vagasRestantes = 35 - vagasOcupadas; // Calcula as vagas restantes

            return {
                id: eletiva.id,
                nome: eletiva.nome,
                professor: eletiva.professor,
                vagas: vagasRestantes
            };
        }));

        // Envia os dados de eletivas com as vagas restantes e os professores para o frontend
        res.json(eletivasComVagas);
    } catch (error) {
        console.error("Erro ao buscar eletivas:", error);
        res.status(500).json({ error: "Erro ao buscar eletivas" });
    }
};
