class Estado {

	/**
	 * Organiza as transições do respectivo estado
	 * 
	 * @param {String[][]} transitions Lista de transições do estado
	 * @param {String} nome Nome do respectivo estado
	 */
	
 	constructor(transitions, nome) {

		
		let trans;

		this.pileCheck = false
		
		this.estados = {} //Objetos a serem recebidos 
		
		this.trans = new Map();
		
		this.vazios = []
		
		this.state = nome
        
		for (trans of transitions) 
		{
			if (trans.includes('?')) this.pileCheck = true

			if (trans[1] == '-') this.vazios.push(trans[3])
			
			this.trans.set(trans[1], [])
		}		
        
		for (trans of transitions) this.trans.get(trans[1]).push(trans.slice(2))
		
		/* O mapa possui os símbolos lidos como chave e apresenta as transições para eles, mostrando 
		* os respectivos símbolo da pilha a ser lido, estado destino e símbolo a ser escrito na pilha. */
        
		// console.log("Transitions:", this.trans) 
	}
	
	/**
	 * Preenche a lista de estados atingíveis pelo vazio a partir do respectivo estado (e de outros também atingidos).
	 */
    
	transVazias() { // Função para preencher o atributo 'this.vazios' com os estados atingidos pelo vazio
        
		let tmp = []
		
		while (this.vazios.length > 0)
		{
			if (tmp.indexOf(this.vazios[0]) != -1)	this.vazios.shift();
			else
			{
				for (let estado of this.estados[this.vazios[0]].vazios) if (this.vazios.indexOf(estado) == -1)  this.vazios.push(estado)
					
				tmp.push(this.vazios[0])
				this.vazios.shift()	
		
			}
		}
		
		this.vazios = tmp
        
	}
	
    	/**
	 * Recebe o símbolo a ser lido nesse estado e a pilha atual do autômato, e retorna todos os possíveis estados e pilha pós-processamento.
	 * 
	 * @param {String} simbolo Símbolo a ser lido nesse estado
	 * @param {String} pilha Pilha atual do autômato
	 * @returns {String[][]} 
	 */
	
	exec(simbolo, pilha) {  
  
		let aux, add, resultado = []
        
		if (this.trans.has(simbolo)) // Se o estado processar esse símbolo
		{ 
			for (let i=0; i < this.trans.get(simbolo).length; i++) 
			{
				aux = pilha 
				add = this.trans.get(simbolo)[i][2] == '-' ? '' : this.trans.get(simbolo)[i][2] 
			
				if (aux != '-')  // Se tiver algo na pilha
				{  
					// Consumir algo da pilha
					if (aux[0] == this.trans.get(simbolo)[i][0]) resultado.push([this.trans.get(simbolo)[i][1], add + aux.substr(1)])
					// Não consumir nada da pilha
					if (this.trans.get(simbolo)[i][0] == '-') resultado.push([this.trans.get(simbolo)[i][1], add + aux])
				} else {
					// Pilha vazia
					if (this.trans.get(simbolo)[i][0] == '-') resultado.push([this.trans.get(simbolo)[i][1], add])
				}
			}
		} 
        
		return resultado
	        
	}
	
	/**
	 * Recebe o símbolo a ser lido nesse estado e a pilha atual do autômato, faz o processamento + deslocamento vazio e o deslocamento
	 * vazio + processamento, e retorna todos os possíveis estados e pilha pós-processamento. 
	 * 
	 * @param {String} simbolo Símbolo a ser lido nesse estado
	 * @param {String} pilha Pilha atual do autômato
	 * @returns {String[][]}
	 */
    
	ler(simbolo, pilha) {
        
		let resultados = []
        
		let done = []
		
		for(let res of this.exec(simbolo, pilha)) resultados.push(res)
	
		done.push(this.state)
        
		let aux = this.vazios.slice(0) 
		// Processando no estado atual e nos atingidos pela transição vazia
		while (aux.length > 0)
		{
			if (done.indexOf(aux[0]) != -1)  aux.shift();
			else 
			{
				for (let item of this.estados[aux[0]].vazios)  if (aux.indexOf(item) == -1)  aux.push(item)
                
				// console.log(aux[0] + ".exec('" + simbolo + "', '" + pilha + "')")
				for (let res of this.estados[aux[0]].exec(simbolo, pilha)) resultados.push(res)
				
				done.push(aux[0])
				aux.shift()
			}
		
		}
		
		resultados = resultados.filter(e => { return e.length }) // Removendo colchetes vazios
		
		// Deslocando pelo vazio após processar em um estado 
		for (let res of resultados.slice(0))  for (let item of this.estados[res[0]].vazios)  resultados.push([item, res[1]])
		
		resultados = Array.from(new Set(resultados.map(JSON.stringify)), JSON.parse) // Removendo itens repetidos
 
		return resultados
	}
}
