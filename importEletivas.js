const fs = require('fs');
const path = require('path');
const { Sequelize } = require('sequelize');
const sequelize = require('./src/config/db');
const Eletiva = require('./src/models/Eletiva');

async function importarEletivas(caminhoArquivo) {
    try {
        const dados = fs.readFileSync(caminhoArquivo, 'utf8');
        const linhas = dados.split('\n').slice(1); // Remove o cabeçalho

        let eletivas = [];
        for (let linha of linhas) {
            linha = linha.trim();
            if (!linha) continue;

            const [nome, professor] = linha.split(',');
            if (!nome || !professor) continue;

            eletivas.push({ nome: nome.trim(), professor: professor.trim() });
        }

        if (eletivas.length === 0) {
            console.log('Nenhuma eletiva válida encontrada.');
            return;
        }

        await sequelize.sync(); // Garante que o banco de dados está sincronizado
        await Eletiva.bulkCreate(eletivas, { ignoreDuplicates: true });

        console.log(`✅ Importação concluída! ${eletivas.length} eletivas adicionadas.`);
    } catch (erro) {
        console.error('❌ Erro ao importar eletivas:', erro.message);
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
importarEletivas(caminhoAbsoluto);
