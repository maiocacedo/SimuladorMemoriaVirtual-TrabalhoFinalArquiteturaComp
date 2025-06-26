# Simulador de Memória Virtual

Projeto desenvolvido para a disciplina da Graduação de Ciência da Computação, Arquitetura e Organização de Computadores.
Para desenvolver o projeto, foi utilizado apenas **JavaScript+HTML+CSS.** Consiste em um s**imulador de memória** que permite ao usuário compreender o funcionamento dos
seguintes metódos de genrenciamento:
  ## Overlay  
  Overlay é uma técnica de gerência de memória usada em sistemas com espaço físico limitado, anterior à adoção de memória virtual.
  Em um esquema de overlay, diferentes partes de um programa (por exemplo, subrotinas ou módulos) são carregadas em uma mesma região fixa de memória (a “overlay region”), nunca simultaneamente. 
  Quando uma subrotina deixa de ser necessária, outra pode ocupar exatamente o mesmo espaço.
  - Lista de subrotinas em **fila**, **ativos** e **concluídos**.  
  - Representação gráfica da “memória” onde a rotina principal ocupa 25% e cada subrotina ativa ocupa 15% do espaço.  
  - Animação com contador regressivo e cores diferenciadas por subrotina.
  
  ##  Paginação  
  Paginação é o esquema de memória virtual mais usado em sistemas operacionais modernos.
  Ele divide a memória virtual em blocos de tamanho fixo chamados páginas, e a memória física em blocos do mesmo tamanho chamados frames. 
  Um page table faz o mapeamento entre páginas e frames, permitindo:
  Hits – acesso direto quando a página já está em memória física.
  Page faults – interrupção que ocorre quando uma página não está carregada, forçando o SO a buscá-la (e possivelmente a substituir outra, segundo alguma política como FIFO ou LRU).
  - Configuração de **5 frames** (pode ser alterado em paginacao.js, FRAME_COUNT)  físicos de **1 KB** cada e qualquer número de páginas virtuais (pode ser ajustado em paginacao.js, PAGE_SIZE).  
  - Geração de uma **reference string** de acessos de memória (100 referências por padrão).  
  - Registro de **page-faults**, **hits** e **substituições** (FIFO) em um log de eventos.  
  - Tabela de páginas clara, exibindo para cada subrotina:
    - **Página nº**  
    - **Endereço virtual** (ex.: `0–1023`)  
    - **Frame** atual (ou `—` se não estiver carregada).  
  - Parada automática quando todas as referências forem processadas, e opção de “Parar” manual.
