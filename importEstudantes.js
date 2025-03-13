const fs = require('fs');
const path = require('path');
const { Sequelize } = require('sequelize');
const sequelize = require('./src/config/db');
const Estudante = require('./src/models/Estudante');

async function importarEstudantes(caminhoArquivo) {
    try {
        const dados = fs.readFileSync(caminhoArquivo, 'utf8');
        const linhas = dados.split('\n').slice(1); // Remove o cabeçalho

        let estudantes = [];
        for (let linha of linhas) {
            linha = linha.trim();
            if (!linha) continue;

            const [turma, nome] = linha.split(',');
            if (!turma || !nome) continue;

            estudantes.push({ turma: turma.trim(), nome: nome.trim() });
        }

        if (estudantes.length === 0) {
            console.log('Nenhum estudante válido encontrado.');
            return;
        }

        await sequelize.sync(); // Garante que o banco de dados está sincronizado
        await Estudante.bulkCreate(estudantes, { ignoreDuplicates: true });

        console.log(`✅ Importação concluída! ${estudantes.length} estudantes adicionados.`);
    } catch (erro) {
        console.error('❌ Erro ao importar estudantes:', erro.message);
    } finally {
        await sequelize.close();
    }
}

// Verifica se o arquivo foi passado como argumento no terminal
const arquivoCSV = process.argv[2];
if (!arquivoCSV) {
    console.error('❌ Por favor, forneça o caminho do arquivo CSV.');
    process.exit(1);
}

const caminhoAbsoluto = path.resolve(arquivoCSV);
importarEstudantes(caminhoAbsoluto);
