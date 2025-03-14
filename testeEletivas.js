const fs = require("fs");
const readline = require("readline");
const axios = require("axios");

const BASE_URL = "https://eletivas.glitch.me/eletivas/escolha"; // Novo URL
const CSV_FILE = "estudantes.csv"; // Nome do arquivo CSV

// Função para adicionar delay
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function processCSV() {
    const alunos = [];

    // Lendo o CSV linha por linha
    const fileStream = fs.createReadStream(CSV_FILE);
    const rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity });

    for await (const line of rl) {
        const [turma, nome] = line.split(","); // Supondo formato: TURMA,NOME
        if (turma && nome) {
            alunos.push({ turma: turma.trim(), nome: nome.trim() });
        }
    }

    if (alunos.length === 0) {
        console.log("⚠️ Nenhum aluno encontrado no CSV.");
        return;
    }

    console.log(`📋 Total de alunos no CSV: ${alunos.length}`);

    // Criar requisições para cada aluno com delay entre elas
    for (let index = 0; index < alunos.length; index++) {
        const aluno = alunos[index];
        const eletivaId = (Math.floor(index / 36) % 14) + 1; // Alterna entre 1 e 14, mantendo 36 por eletiva

        try {
            // Enviar requisição
            await axios.post(BASE_URL, {
                eletivaId,
                nome: aluno.nome,
                turma: aluno.turma
            });
            console.log(`✅ ${aluno.nome} (${aluno.turma}) -> Eletiva ${eletivaId}: Sucesso`);
        } catch (error) {
            console.log(`❌ ${aluno.nome} (${aluno.turma}) -> Eletiva ${eletivaId}: Erro - ${error.response?.data?.mensagem || error.message}`);
        }

        // Adiciona um delay de 1 segundo entre as requisições
        await delay(400); // 1000 ms = 1 segundo
    }
}

processCSV();
