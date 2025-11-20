
function getRandomInt(max) {
    return Math.floor(Math.random() * max);
}

function creaTablero(size) {
    //esta forma de crear un array con valores deseados la vi en internet, paar el ejercicio del juego de la vida
    return Array.from({ length: size }, () => Array(size).fill("X"));
}


function validaInput(n, opc, sizeTablero = 0) {
    switch (opc) {
        case 1://tablero
            return n >= 5; //mínimo 5x5
        case 2://num minas
            return n >= 1;//mínimo una mina
        case 3://pide coordenada para casilla
            return n >= sizeTablero;
        default:
            break;
    }
}

function pideSizeTablero() {
    let size;
    while (true) {
        size = parseInt((prompt("Tamaño del tablero: ")));
        if (validaInput(size,1)) return size;
        alert("Input inválido. Sólo números positivos mayores o iguales a 5");
    }
}

function pideCoordenada(tag, sizeTablero){
    let pos;
    while (true) {
        pos = parseInt(prompt(`Coordenada ${tag}:`));
        if (!validaInput(pos,3, sizeTablero)) return pos;
        alert("Input inválido. Tu coordenada se sale del tablero!");
    }
}



function colocaMinas(tablero, cantidad) {//coloca minas deseadas en posición random dentro del tablero
    let size = tablero.length;
    let minasColocadas = 0;//contador

    while (minasColocadas < cantidad) {
        let x = getRandomInt(size);
        let y = getRandomInt(size);

        if (tablero[x][y] !== "*") {//si no es una mina
            tablero[x][y] = "*";//pone una mina
            minasColocadas++;//aumenta el total
        }
    }
}

function contarMinasAdyacentes(tablero, posX, posY) {//sólo devuelve el número de minas adyacentes a la casilla que recibe
    let size = tablero.length;
    let total = 0;

    //recorre desde la anterior a la siguiente fila
    for (let i = -1; i <= 1; i++) {
        //recorre desde la anterior a la siguiente columna
        for (let j = -1; j <= 1; j++) {
            if (i === 0 && j === 0) continue;//se salta la casilla que llega, sólo comprobará las adyacentes

            //se mueve por las casillas que rodean a (posX,posY)
            let x = posX + i;
            let y = posY + j;

            if (x >= 0 && x < size && y >= 0 && y < size && tablero[x][y] === "*") { //si se sale del tablero o es una mina, no entra
                total++;//acumula los *
            }
        }
    }
    return total;
}

function generaAdyacentes(tablero) {//rellena las casillas que rodean a las minas
    let size = tablero.length;
    for (let i = 0; i < size; i++) {
        for (let j = 0; j < size; j++) {
            if (tablero[i][j] !== "*") {//omite reemplazar las minas
                //asigna cuántas minas adyacentes tiene la casilla
                tablero[i][j] = contarMinasAdyacentes(tablero, i, j); //el valor de la casilla es el total de minas adyacentes
            }
        }
    }
}

//hace lo que dice
function mostrarTablero(tableroVisible) {
    console.table(tableroVisible);
}
function compruebaAdyacentes(tableroReal, tableroVisible, posX, posY) {
    let size = tableroReal.length;
    //comprueba los límites del tablero
    if (posX < 0 || posX >= size || posY < 0 || posY >= size) return;
    //comprueba si ya se ha elegido
    if (tableroVisible[posX][posY] !== "X") return;

    //se altera el tablero visible
    let valor = tableroReal[posX][posY]; //coge el valor de la casilla elegida
    tableroVisible[posX][posY] = valor;//lo asigna al tablero visible en la misma pos

    //si es una casilla vacía (0) revela las adyacentes
    if (valor === 0) {
        //recorre desde la anterior a la siguiente fila
        for (let i = -1; i <= 1; i++) {
            //recorre desde la anterior a la siguiente columna
            for (let j = -1; j <= 1; j++) {
                if (i !== 0 || j !== 0) {//se salta la casilla actual
                    //se llama a sí misma, pero con las posiciones que rodean a la casilla en cuestión
                    compruebaAdyacentes(tableroReal, tableroVisible, posX + i, posY + j);
                }
            }
        }
    }
}

function victoria(tableroReal, tableroVisible) {
    let size = tableroReal.length;

    //recorre tó el tablero
    for (let i = 0; i < size; i++) {
        for (let j = 0; j < size; j++) {
            //si hay alguna mina descubierta o casillas sin elegir, aún no has ganado
            if (tableroReal[i][j] !== "*" && tableroVisible[i][j] === "X") {
                return false;
            }
        }
    }
    return true;//has ganado
}

//desafío opcional
function objetoPartida(tableroReal, tableroVisible, numMinas, intentos){
    return {
        tableroReal: tableroReal,
        tableroVisible: tableroVisible,
        minasRestantes: numMinas,
        movimientos: intentos
    }
}

function isEmpty(val){//robado de internet - comprueba si una variable está vacía, está indefinida o tiene longitud cero
    return (val === undefined || val == null || val.length <= 0);
}

let juego = {
    iniciado: false,
    size: 0,
    turnos: 0,
    numMinas: 0,
    tableroReal: [],
    tableroVisible: [],
    fin: false,
};

function iniciarJuego() {//primer turno
    console.clear();//limpia al iniciar
    let size = pideSizeTablero();//tamaño del tablero
    let numMinas = Math.floor(size * size * 0.2);//cantidad de minas proporcional

    alert(`Se colocarán ${numMinas} minas.`);

    let tableroReal = creaTablero(size);//tablero interno
    colocaMinas(tableroReal, numMinas);//posiciona la misnas en lugares random
    generaAdyacentes(tableroReal);//rellena el resto de casillas dependiendo de la cantidad de minas que rodean a cada una
    let tableroVisible = creaTablero(size);//el tablero de juego

    //objeto de la partida
    juego = {
        iniciado: true,
        size,
        turnos: 0,
        numMinas,
        tableroReal,
        tableroVisible,
        fin: false
    };


    mostrarTablero(tableroVisible);
}

function siguienteTurno() {//avanza el turno
    if (!juego.iniciado || juego.fin) return;

    let posX = pideCoordenada("X", juego.size);
    let posY = pideCoordenada("Y", juego.size);

    juego.turnos++;

    if (juego.tableroReal[posX][posY] === "*") {//pierdes y termina
        alert("¡BOOM! Has perdido.");
        mostrarTablero(juego.tableroReal);
        juego.fin = true;
        return;
    }


    compruebaAdyacentes(juego.tableroReal, juego.tableroVisible, posX, posY);

    if (victoria(juego.tableroReal, juego.tableroVisible)) {//ganas
        alert("¡Has ganado!");
        juego.fin = true;
    }

    mostrarTablero(juego.tableroVisible);
}

function tableroHTML(tablero, posX = -1, posY = -1) {
    let output = "";

    for (let i = 0; i < tablero.length; i++) {
        output += "<tr>"; // empieza una nueva fila
        for (let j = 0; j < tablero[i].length; j++) {
            output += `<td class='casilla' onclick='pulsaCasilla(${i}, ${j})'>
                    ${meteIcono(tablero[i][j])}</td>`;
        }
        output += "</tr>"; // cierra la fila
    }

    // Inserta el HTML dentro de la tabla
    document.getElementById("tabla").innerHTML = output;
}

function pulsaCasilla(row, col){
    if (!juego.iniciado) return;

    let posX = row;
    let posY = col;

    juego.turnos++;

    if (juego.tableroReal[posX][posY] === "*") {//pierdes y termina
        alert("¡BOOM! Has perdido.");
        juego.tableroVisible = juego.tableroReal;
        mostrarTablero(juego.tableroReal);
        juego.fin = true;
        return;
    }


    compruebaAdyacentes(juego.tableroReal, juego.tableroVisible, posX, posY);

    if (victoria(juego.tableroReal, juego.tableroVisible)) {//ganas
        alert("¡Has ganado!");
        juego.tableroVisible = juego.tableroReal;
        juego.fin = true;
    }

    mostrarTablero(juego.tableroVisible);
}


function meteIcono(valorCasillas){
    switch (valorCasillas) {
        case "X":
            return "<img class='img_casilla' src=\"./img/x.gif\" alt=\"\">";
        case "*":
            return "<img class='img_casilla' src=\"./img/mina.gif\" alt=\"\">";
        case 0:
            return "<img class='img_casilla' src=\"./img/cero.png\" alt=\"\">";
        default:
            return "<p class='txt_casilla'>"+valorCasillas+"</p>";

    }
}

var save;
function botonGuardar() {
    save = objetoPartida(
        JSON.parse(JSON.stringify(juego.tableroReal)),
        JSON.parse(JSON.stringify(juego.tableroVisible)),
        juego.numMinas,
        juego.turnos,
        // juego.fin = false,
        // juego.iniciado = true,
    );
    console.table("Partida guardada:", save)//debug
    alert("Partida guardada!");
}

function botonCargar() {
    if (!isEmpty(save)) {
        juego.tableroReal = JSON.parse(JSON.stringify(save.tableroReal));
        juego.tableroVisible = JSON.parse(JSON.stringify(save.tableroVisible));
        juego.numMinas = save.minasRestantes;
        juego.turnos = save.movimientos;
        juego.fin = false;
        juego.iniciado = true;
        alert("Partida cargada!");
        mostrarTablero(juego.tableroVisible);
        console.table("Partida cargada:", save)//debug
    } else {
        alert("No hay partida guardada!");
    }
}