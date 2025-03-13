document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("eletivas-form");
    const mensagem = document.getElementById("mensagem");
    const eletivaSelect = document.getElementById("eletiva");

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
                console.log("Resposta recebida:", response);
                return response.json();
            })
            .then(data => {
                console.log("Dados recebidos:", data);
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
            console.log("mensagem");
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
});
