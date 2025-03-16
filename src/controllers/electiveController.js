const Estudante = require('../models/Estudante');
const Eletiva = require('../models/Eletiva');
const CacheTimestamp = require('../models/CacheTimestamp');
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


// Controlador para buscar as eletivas
exports.buscarEletivas = async (req, res) => {
    try {
        const timestampCache = 60 * 60 * 1000; // 1 hora em milissegundos
        const lastFetchTime = await getLastFetchTime('eletivas'); // Passando 'eletivas' como parâmetro

        const now = Date.now();

        // Verifica se os dados precisam ser atualizados (se nunca foi feito o fetch ou o cache está expirado)
        if (lastFetchTime === 0 || now - lastFetchTime > timestampCache) {
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

            // Atualiza o timestamp para o tempo atual
            await setLastFetchTime('eletivas', now);  // Passando 'eletivas' como operação

            return res.json(eletivasComVagas); // Retorna as eletivas com as vagas restantes
        }

        // Caso os dados estejam no cache e ainda sejam válidos, retorna os dados diretamente
        const cachedEletivas = await Eletiva.findAll({
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
        const eletivasComVagasCache = await Promise.all(cachedEletivas.map(async (eletiva) => {
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

        return res.json(eletivasComVagasCache); // Retorna os dados cacheados

    } catch (error) {
        console.error("Erro ao buscar eletivas:", error);
        res.status(500).json({ error: "Erro ao buscar eletivas" });
    }
};

exports.resultadoEletiva = async (req, res) => {
    try {
        const timestampCache = 60 * 60 * 1000; // 1 hora em milissegundos
        const lastFetchTime = await getLastFetchTime('resultadoEletiva'); // Passando 'resultadoEletiva' como parâmetro

        const now = Date.now();

        // Verifica se os dados precisam ser atualizados (se nunca foi feito o fetch ou o cache está expirado)
        if (lastFetchTime === 0 || now - lastFetchTime > timestampCache) {
            // Busca os dados atualizados no banco de dados
            const alunosComEletiva = await Estudante.findAll({
                where: {
                    eletivaId: { [Op.ne]: null }
                },
                order: [
                    ['eletivaId', 'ASC'],
                    ['nome', 'ASC']
                ]
            });

            // Enriquecendo alunosComEletiva com os nomes das eletivas
            for (let aluno of alunosComEletiva) {
                const eletiva = await Eletiva.findByPk(aluno.eletivaId);
                aluno.dataValues.eletivaNome = eletiva ? eletiva.nome : 'Eletiva não encontrada';
            }

            const alunosSemEletiva = await Estudante.findAll({
                where: {
                    eletivaId: null
                },
                order: [
                    ['turma', 'ASC'],
                    ['nome', 'ASC']
                ]
            });

            // Atualiza o timestamp para o tempo atual
            await setLastFetchTime('resultadoEletiva', now);  // Passando 'resultadoEletiva' como operação

            return res.json({
                alunosComEletiva,
                alunosSemEletiva
            });
        }

        // Caso os dados estejam no cache e ainda sejam válidos, retorna os dados diretamente
        const cachedAlunosComEletiva = await Estudante.findAll({
            where: {
                eletivaId: { [Op.ne]: null }
            },
            order: [
                ['eletivaId', 'ASC'],
                ['nome', 'ASC']
            ]
        });

        // Enriquecendo alunosComEletiva com os nomes das eletivas
        for (let aluno of cachedAlunosComEletiva) {
            const eletiva = await Eletiva.findByPk(aluno.eletivaId);
            aluno.dataValues.eletivaNome = eletiva ? eletiva.nome : 'Eletiva não encontrada';
        }

        const cachedAlunosSemEletiva = await Estudante.findAll({
            where: {
                eletivaId: null
            },
            order: [
                ['turma', 'ASC'],
                ['nome', 'ASC']
            ]
        });

        return res.json({
            alunosComEletiva: cachedAlunosComEletiva,
            alunosSemEletiva: cachedAlunosSemEletiva
        });

    } catch (error) {
        console.error("Erro ao buscar resultado das eletivas:", error);
        res.status(500).json({ message: "Erro ao buscar resultado das eletivas." });
    }
};


// Função para obter o timestamp da última consulta no banco de dados
async function getLastFetchTime(operation) {
    try {
        // Tenta buscar o timestamp da última consulta baseado na operação
        const cache = await CacheTimestamp.findOne({
            where: { operation } // Aqui utilizamos a operação passada como filtro
        });

        // Se não encontrar, retorna 0 ou um valor indicativo
        return cache ? cache.timestamp : 0; // Retorna o timestamp ou 0 se não houver
    } catch (error) {
        console.error("Erro ao buscar o timestamp:", error);
        return 0; // Retorna 0 em caso de erro
    }
}

// Função para atualizar o timestamp da última consulta no banco de dados
async function setLastFetchTime(operation, timestamp) {
    try {
        // Verifica se já existe um registro de timestamp para a operação específica
        let cache = await CacheTimestamp.findOne({ where: { operation } });

        if (cache) {
            // Se o registro existir, atualiza o timestamp
            cache.timestamp = timestamp;
            await cache.save();
        } else {
            // Se não existir, cria um novo registro com a operação e o timestamp
            await CacheTimestamp.create({ operation, timestamp });
        }

        console.log(`Timestamp atualizado para a operação ${operation}:`, timestamp);
    } catch (error) {
        console.error("Erro ao atualizar o timestamp:", error);
    }
}
