const Student = require("../models/Estudante"); // Importa o modelo de estudantes
const CacheTimestamp = require("../models/CacheTimestamp"); // Importa o modelo de CacheTimestamp
const { Op } = require("sequelize"); // Operadores do Sequelize para consultas

// Função para buscar o timestamp da última consulta
async function getLastSearchTime() {
    try {
        // Tenta buscar o timestamp da última consulta
        const cache = await CacheTimestamp.findOne({
            where: { id: 1 } // Assumindo que você tem um único registro para controle
        });

        // Se não encontrar, retorna 0 ou um valor indicativo
        return cache ? cache.timestamp : 0; // Retorna o timestamp ou 0 se não houver
    } catch (error) {
        console.error("Erro ao buscar o timestamp:", error);
        return 0; // Retorna 0 em caso de erro
    }
}

// Função para salvar o timestamp da última consulta
async function setLastSearchTime(timestamp) {
    try {
        // Verifica se já existe um registro de timestamp
        let cache = await CacheTimestamp.findOne({ where: { id: 1 } });

        if (cache) {
            // Se o registro existir, atualiza o timestamp
            cache.timestamp = timestamp;
            await cache.save();
        } else {
            // Se não existir, cria um novo registro
            await CacheTimestamp.create({ id: 1, timestamp });
        }

        console.log("Timestamp atualizado:", timestamp);
    } catch (error) {
        console.error("Erro ao atualizar o timestamp:", error);
    }
}

exports.searchStudents = async (req, res) => {
    try {
        const { nome, turma, eletiva } = req.query;
        const timestampCache = 60 * 60 * 1000; // 1 hora em milissegundos
        const lastSearchTime = await getLastSearchTime(); // Pega o timestamp da última busca

        const now = Date.now();

        // Verifica se os dados precisam ser atualizados
        if (now - lastSearchTime > timestampCache) {
            // Criando o filtro dinâmico com base nos parâmetros fornecidos
            const whereClause = {};
            if (nome) whereClause.nome = { [Op.like]: `%${nome}%` }; // Busca por nome parcial
            if (turma) whereClause.turma = turma; // Busca exata por turma
            if (eletiva) whereClause.eletiva = eletiva; // Busca exata por eletiva

            // Busca os alunos filtrados no banco de dados
            const students = await Student.findAll({ where: whereClause });

            // Atualiza o timestamp para o tempo atual
            await setLastSearchTime(now); // Atualiza o timestamp de busca

            return res.json(students); // Retorna os alunos encontrados
        }

        // Caso os dados ainda sejam válidos, retorna os dados cacheados ou persistidos
        // Vamos adicionar um código para buscar os alunos persistidos em cache, se necessário.
        // Isso depende de como você deseja gerenciar o cache, então a implementação pode variar
        const cachedStudents = await Student.findAll({
            where: { // Exemplo de onde cláusula para buscar alunos "cacheados"
                nome: { [Op.like]: `%${nome}%` }, // Isso pode ser personalizado
                turma: turma,
                eletiva: eletiva
            }
        });

        return res.json(cachedStudents); // Retorna os alunos cacheados

    } catch (error) {
        console.error("Erro ao buscar estudantes:", error);
        res.status(500).json({ message: "Erro ao buscar estudantes." });
    }
};
