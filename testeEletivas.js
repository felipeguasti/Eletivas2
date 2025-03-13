const fs = require("fs");
const readline = require("readline");
const axios = require("axios");

const BASE_URL = "http://localhost:3000/eletivas/escolha"; // Ajuste conforme necessário
const CSV_FILE = "estudantes.csv"; // Nome do arquivo CSV

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

    // Distribuir alunos entre 14 eletivas, 36 alunos por eletiva
    for (let i = 0; i < alunos.length; i++) {
        const aluno = alunos[i];
        const eletivaId = (Math.floor(i / 36) % 14) + 1; // Alterna entre 1 e 14, mantendo 36 por eletiva

        try {
            const response = await axios.post(`${BASE_URL}/escolha`, {
                eletivaId,
                aluno: aluno.nome
            });

            console.log(`✅ ${aluno.nome} (${aluno.turma}) -> Eletiva ${eletivaId}: Sucesso`);
        } catch (error) {
            if (error.response) {
                console.log(`❌ ${aluno.nome} (${aluno.turma}) -> Eletiva ${eletivaId}: Erro - ${error.response.data.mensagem}`);
            } else {
                console.log(`❌ ${aluno.nome} (${aluno.turma}) -> Eletiva ${eletivaId}: Erro desconhecido - ${error.message}`);
            }
        }
    }
}

processCSV();
