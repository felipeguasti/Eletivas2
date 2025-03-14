const { exec } = require('child_process');

// Função para executar um comando no terminal
function executarComando(comando) {
    return new Promise((resolve, reject) => {
        exec(comando, (erro, stdout, stderr) => {
            if (erro) {
                reject(`Erro ao executar comando: ${erro.message}`);
            }
            if (stderr) {
                console.error(`stderr: ${stderr}`);
            }
            console.log(`stdout: ${stdout}`);
            resolve(stdout);
        });
    });
}

async function renovarBanco() {
    try {
        // Sincroniza os modelos (zera as tabelas)
        console.log('🔄 Iniciando a sincronização dos modelos...');
        await executarComando('node syncModels.js');
        console.log('✅ Modelos sincronizados com sucesso.');

        // Importa as eletivas
        console.log('📥 Importando as eletivas...');
        await executarComando('node importEletivas.js eletivas.csv');
        console.log('✅ Eletivas importadas com sucesso.');

        // Importa os estudantes
        console.log('📥 Importando os estudantes...');
        await executarComando('node importEstudantes.js estudantes.csv');
        console.log('✅ Estudantes importados com sucesso.');

        console.log('✅ Banco de dados renovado com sucesso!');
    } catch (error) {
        console.error(`❌ Falha ao renovar banco de dados: ${error}`);
    }
}

// Chama a função para renovar o banco
renovarBanco();
