document.addEventListener("DOMContentLoaded", function () {
    const isIndex = window.location.pathname === "/";
    const isResultado = window.location.pathname.includes("/resultado");
    if(isIndex){
        const form = document.getElementById("eletivas-form");
        const mensagem = document.getElementById("mensagem");
        const eletivaSelect = document.getElementById("eletiva");
        const comEscolhas = document.getElementById("comEscolhas");
        const semEscolhas = document.getElementById("semEscolhas");
    
        // Função para carregar as eletivas dinamicamente
        async function carregarEletivas() {
            try {
                const response = await fetch("/eletivas/buscar");
                const data = await response.json();
    
                // Limpa as opções atuais do dropdown
                eletivaSelect.innerHTML = `<option value="">Selecione uma eletiva</option>`;
    
                // Adiciona as novas opções ao dropdown
                data.forEach(eletiva => {
                    const option = document.createElement("option");
                    option.value = eletiva.id; // Use o id da eletiva
                    option.textContent = eletiva.nome; // Exibe o nome da eletiva
                    eletivaSelect.appendChild(option);
                });
            } catch (error) {
                console.error("Erro ao carregar as eletivas:", error);
                mostrarMensagem("Erro ao carregar as eletivas. Tente novamente.", "error");
            }
        }
    
        carregarEletivas();
    
        // Lidar com o envio do formulário
        form.addEventListener("submit", async (event) => {
            event.preventDefault();
    
            const turma = document.getElementById("turma").value;
            const nome = document.getElementById("nome").value.trim();
            const eletiva = document.getElementById("eletiva").value;
    
            // Verifica se todos os campos estão preenchidos
            if (!turma || !nome || !eletiva) {
                mostrarMensagem("Todos os campos são obrigatórios.", "error");
                return;
            }
    
            try {
                const response = await fetch("/eletivas/escolha", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({ turma, nome, eletivaId: eletiva })
                });
    
                const data = await response.json();
    
                if (response.ok) {
                    mostrarMensagem(data.message, "success");
                    form.reset();
                } else {
                    mostrarMensagem(data.message, "error");
                }
            } catch (error) {
                console.error("Erro ao enviar requisição:", error);
                mostrarMensagem("Erro ao conectar com o servidor. Tente novamente.", "error");
            }
        });
    
        function mostrarMensagem(message, type) {
            // Cria um novo elemento div para exibir a mensagem
            const mensagemDiv = document.createElement("div");
        
            // Define a classe CSS dependendo do tipo de mensagem
            if (type === "error") {
                mensagemDiv.classList.add("popup", "error");
            } else if (type === "success") {
                mensagemDiv.classList.add("popup", "success");
            }
        
            // Define o conteúdo da mensagem
            mensagemDiv.textContent = message;
        
            // Adiciona a mensagem ao corpo da página
            document.body.appendChild(mensagemDiv);
        
            // Remove a mensagem após 3 segundos
            setTimeout(() => {
                mensagemDiv.classList.add("fade-out");
                setTimeout(() => {
                    mensagemDiv.remove();
                }, 500); // Tempo de fade-out antes de remover
            }, 3000);
        }
        
        function atualizarEletivas() {
            fetch("/eletivas/buscar")
                .then(response => {
                    return response.json();
                })
                .then(data => {
                    const tabela = document.getElementById("eletivas-lista");
                    tabela.innerHTML = "";
        
                    data.forEach(eletiva => {
                        const row = document.createElement("tr");
                        row.innerHTML = `
                            <td>${eletiva.nome}</td>
                            <td>${eletiva.professor}</td> <!-- Coluna professor logo após nome -->
                            <td id="vagas-${eletiva.id}">${eletiva.vagas}</td>
                        `;
                        tabela.appendChild(row);
                    });
                })
                .catch(error => {
                    console.error("Erro ao buscar eletivas:", error);
                });
        }
        
        
        document.addEventListener("DOMContentLoaded", () => {
            const form = document.getElementById("eletivas-form");
            const mensagem = document.getElementById("mensagem");
        
            form.addEventListener("submit", async (event) => {
                event.preventDefault();
        
                const turma = document.getElementById("turma").value;
                const nome = document.getElementById("nome").value;
                const eletiva = document.getElementById("eletiva").value;
        
                // Verifica se todos os campos estão preenchidos
                if (!turma || !nome || !eletiva) {
                    mostrarMensagem("Todos os campos são obrigatórios.", "error");
                    return;
                }
        
                try {
                    const response = await fetch("/eletivas/escolha", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify({ turma, nome, eletivaId: eletiva })
                    });
        
                    const data = await response.json();
        
                    if (response.ok) {
                        mostrarMensagem(data.message, "success");
                        form.reset();
                    } else {
                        mostrarMensagem(data.message, "error");
                    }
                } catch (error) {
                    console.error("Erro ao enviar requisição:", error);
                    mostrarMensagem("Erro ao conectar com o servidor. Tente novamente.", "error");
                }
            });
        
            function mostrarMensagem(texto, tipo) {
                mensagem.textContent = texto;
                mensagem.style.display = "block";
                mensagem.style.color = tipo === "success" ? "green" : "red";
        
                setTimeout(() => {
                    mensagem.style.display = "none";
                }, 5000);
            }
        }); 
        // Atualiza a lista de eletivas a cada 10 segundos (countdown)
        //setInterval(atualizarEletivas, 1000);
    
        // Primeira atualização ao carregar a página
        atualizarEletivas();
    }
    if (isResultado) {
        const select = document.getElementById("eletiva-select");
        const tableContainer = document.getElementById("table-container");
    
        select.addEventListener("change", () => {
            const selectedEletiva = select.value;
            fetchResultadoEletiva(selectedEletiva);
        });
    
        // Função para verificar e usar o Cache API
        async function fetchResultadoEletiva(selectedEletiva) {
            const timestampCliente = localStorage.getItem('timestamp');
            const timestampAtual = Date.now();
            showLoading();

            try {
                const cache = await caches.open('resultadoEletivaCache');
                const cachedResponse = await cache.match('resultadoEletiva');
                const shouldFetchNewData = !cachedResponse || (timestampCliente && timestampAtual - timestampCliente > 3600000); // 1 hora de validade

                let data;
                
                if (shouldFetchNewData) {
                    // Se os dados estiverem desatualizados ou não existirem no cache, busca do servidor
                    const response = await fetch('/eletivas/resultado');
                    data = await response.json();

                    // Atualizar o cache com os novos dados e o timestamp
                    cache.put('resultadoEletiva', new Response(JSON.stringify(data)));
                    localStorage.setItem('timestamp', Date.now());
                } else {
                    // Usando dados do cache
                    data = await cachedResponse.json();
                }

                // Atualiza o HTML com os valores
                const qtdComEletiva = data.alunosComEletiva.length;
                const qtdSemEletiva = data.alunosSemEletiva.length;

                document.getElementById("alunosComEletiva").innerHTML = `Alunos com eletiva: ${qtdComEletiva}`;
                document.getElementById("alunosSemEletiva").innerHTML = `Alunos sem eletiva: ${qtdSemEletiva}`;

                // Unindo as listas de alunos
                const alunos = [...data.alunosComEletiva, ...data.alunosSemEletiva];

                // Filtrando apenas os alunos que possuem a eletiva selecionada
                const alunosFiltrados = selectedEletiva
                    ? alunos.filter(aluno => aluno.eletivaNome === selectedEletiva)
                    : alunos;

                // Limpar o conteúdo anterior da tabela
                tableContainer.innerHTML = '';
                if (!alunosFiltrados.length) {
                    tableContainer.innerHTML = '<p>Nenhum aluno encontrado.</p>';
                    return;
                }

                // Criar a tabela
                const table = document.createElement('table');
                table.classList.add('styled-table');

                // Criar o cabeçalho da tabela
                const thead = document.createElement('thead');
                thead.innerHTML = `
                    <tr>
                        <th>Nome</th>
                        <th>Eletiva</th>
                        <th>Turma</th>
                    </tr>
                `;
                table.appendChild(thead);

                // Criar o corpo da tabela
                const tbody = document.createElement('tbody');
                alunosFiltrados.forEach(aluno => {
                    const tr = document.createElement('tr');
                    tr.innerHTML = `
                        <td>${aluno.nome}</td>
                        <td>${aluno.eletivaNome ? aluno.eletivaNome : 'Nenhuma'}</td>
                        <td>${aluno.turma}</td>
                    `;
                    tbody.appendChild(tr);
                });
                table.appendChild(tbody);

                // Adicionando a tabela ao container
                tableContainer.appendChild(table);

            } catch (error) {
                console.error('Erro ao carregar os dados:', error);
                tableContainer.innerHTML = '<p>Erro ao carregar os dados.</p>';
            } finally {
                hideLoading();  // Esconde a tela de loading quando o processo for concluído (seja com sucesso ou erro)
            }
        }
        async function fetchEletivas() {
            try {
                const response = await fetch('/eletivas/buscar');
                const eletivas = await response.json();
    
                eletivas.forEach(eletiva => {
                    const option = document.createElement('option');
                    option.value = eletiva.nome;
                    option.textContent = eletiva.nome;
                    select.appendChild(option);
                });
            } catch (error) {
                console.error("Erro ao buscar as eletivas:", error);
            }
        }
        fetchResultadoEletiva();
        fetchEletivas();
    }
});

function showLoading() {
    const popup = document.getElementById("generic-popup");
    const messageContainer = popup.querySelector(".popup-message");
    const okButton = popup.querySelector(".popup-ok-button");
    messageContainer.textContent = "Carregando...";
    okButton.style.display = "none";
    popup.classList.remove("hidden");
}
// Função para ocultar o carregamento
function hideLoading() {
    const popup = document.getElementById("generic-popup");
    popup.classList.add("hidden");  // Oculta o popup (esconde o "Carregando...")
}
function hideLoadingWithMessage(message, callback = null) {
    const popup = document.getElementById("generic-popup");
    const messageContainer = popup.querySelector(".popup-message");
    const okButton = popup.querySelector(".popup-ok-button");
    messageContainer.textContent = message;
    okButton.style.display = "inline-block";
    okButton.onclick = () => {
        popup.classList.add("hidden");
        if (callback) callback();
    };
}
