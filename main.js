let juego = {
    iniciado: false,
    size: 0,
    turnos: 0,
    numMinas: 0,
    tableroReal: [],
    tableroVisible: [],
    fin: false,
    //se añaden para el cronómetor
    tiempoTranscurrido: 0,
    timerId: null,
};
let banderasCont = 0;
let save;

const getRandomInt =(max)=>{
    return Math.floor(Math.random() * max);
}

const creaTablero = (size) => {
    //esta forma de crear un array con valores deseados la vi en internet, paar el ejercicio del juego de la vida
    return Array.from({ length: size }, () => Array(size).fill("X"));
}

const validaInput =(n,opc,sizeTablero = 0) =>{
    switch (opc) {
        case 1://tablero
            return n >= 5; //mínimo 5x5
        case 2://num minas
            return n >= 1;//mínimo una mina
        case 3://pide coordenada para casilla
            return n >= sizeTablero;
        case 4://pide dificultad - extra entrega 3
            return n >= 1 && n <= 3; //1==fácil, 2==medio, 3==difícil
        default:
            break;
    }
}

const pideSizeTablero=()=>{
    let size;
    while (true) {
        size = parseInt((prompt("Tamaño del tablero: ")));
        if (validaInput(size,1)) return size;
        alert("Input inválido. Sólo números positivos mayores o iguales a 5");
    }
}

const pideDificultad =() =>{
    let dificultad = 0;
    while(true){
        dificultad = parseInt(prompt("Elige un nivel de dificultad (1-3):"));
        if(validaInput(dificultad, 4)) {
            switch(dificultad){
                case 1:
                    return 0.2;
                case 2:
                    return 0.3;
                case 3:
                    return 0.4;
                default:
                    break;
            }
        }
        alert("Input inválido. Sólo números positivos entre 1 y 3");
    }
}

// const pideCoordenada = (tag, sizeTablero)=>{
//     let pos;
//     while (true) {
//         pos = parseInt(prompt(`Coordenada ${tag}:`));
//         if (!validaInput(pos,3, sizeTablero)) return pos;
//         alert("Input inválido. Tu coordenada se sale del tablero!");
//     }
// }

const colocaMinas=(tablero, cantidad)=>{//coloca minas deseadas en posición random dentro del tablero
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

const contarMinasAdyacentes=(tablero, posX, posY)=>{//sólo devuelve el número de minas adyacentes a la casilla que recibe
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

const generaAdyacentes=(tablero)=> {//rellena las casillas que rodean a las minas
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
const mostrarTablero=(tableroVisible)=> {
    console.table(tableroVisible);
}
const compruebaAdyacentes=(tableroReal, tableroVisible, posX, posY)=> {
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

const victoria=(tableroReal, tableroVisible)=>{
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
const objetoPartida=(tableroReal, tableroVisible, numMinas, intentos)=>{
    return {
        tableroReal: tableroReal,
        tableroVisible: tableroVisible,
        minasRestantes: numMinas,
        movimientos: intentos
    }
}

const isEmpty=(val)=>{//robado de internet - comprueba si una variable está vacía, está indefinida o tiene longitud cero
    return (val === undefined || val == null || val.length <= 0);
}



const iniciarJuego=()=> {//primer turno
    console.clear();//limpia al iniciar
    let size = pideSizeTablero();//tamaño del tablero
    let dificultad = pideDificultad();//dif 1 == 0.2, dif 2 == 0.3, dif 3 == 0.4
    let numMinas = Math.floor(size * size * dificultad);//cantidad de minas proporcional
    banderasCont = numMinas;

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

    iniciarCronometro();
    mostrarTablero(tableroVisible);
    revelaPrimeraLibre();
    tableroHTML();
}

const revelaPrimeraLibre = ()=>{
    let sizeTablero = juego.tableroReal.length;
    let encontrado = false;
    for(let i = 0; i < sizeTablero && !encontrado; i++){
        for (let j = 0; j < sizeTablero && !encontrado; j++) {
            if(juego.tableroReal[i][j] === 0){
                pulsaCasilla(i,j);
                encontrado = true;
            }
        }
    }
}

const tableroHTML = () => {

    let tablero = juego.tableroVisible;
    //referencia a la tabla en el DOM
    const tabla = document.getElementById("tabla");
    //al ser recursiva, evita que se añadan casillas extra no deseadas
    tabla.innerHTML = "";

    //recorre el tablero
    for (let i = 0; i < tablero.length; i++) {
        //crea la fila
        const tr = document.createElement("tr");

        for (let j = 0; j < tablero[i].length; j++) {
            //crea las casillas
            const td = document.createElement("td");
            td.className = "casilla";
            //referencia el contenido de la casilla
            const valor = tablero[i][j];
            //asigna el icono o número correspondiente
            td.innerHTML = meteIcono(valor);

            //para que cambien los colores de las celdas dependiendo del contenido
            if(typeof valor === "number" && valor > 0){
                td.classList.add("descubierto-num");
            }
            if(typeof valor === "number" && valor === 0){
                td.classList.add("descubierto-vacio");
            }
            if(typeof valor === "string" && valor === "F"){
                td.classList.add("bandera");
            }
            if(typeof valor === "string" && valor === "*"){
                td.classList.add("mina");
            }

            //eventos
            td.onclick = () => {
                if (tablero[i][j] === "F") return;

                pulsaCasilla(i, j);
            }

            td.oncontextmenu = (e) => {
                e.preventDefault();
                if (banderasCont > 0 && tablero[i][j] === "X") {
                    juego.tableroVisible[i][j] = "F";
                    banderasCont--;
                    tableroHTML();
                }
            }

            td.ondblclick = (e) => {
                e.preventDefault();
                if (tablero[i][j] === "F") {
                    juego.tableroVisible[i][j] = "X";
                    banderasCont++;
                    tableroHTML();
                }
            }
            tr.appendChild(td);
        }
        tabla.appendChild(tr);
    }

    // Actualizar contador de banderas
    const banderas = document.getElementById("banderas");
    if(banderas) banderas.innerHTML = `Banderas: ${banderasCont}`;
}

const pulsaCasilla = (posX, posY) => {
    //
    if (!juego.iniciado || juego.fin) return;

    if (juego.tableroVisible[posX][posY] === "F") return;

    juego.turnos++;

    //pierdes
    if (juego.tableroReal[posX][posY] === "*") {
        //revela el tablero
        juego.tableroVisible = juego.tableroReal;
        pararCronometro();

        //pinta el tablero revelado
        tableroHTML();

        // fin
        juego.fin = true;

        //necesario para que el navegador tenga tiempo de pintar el tablero antes del alert
        setTimeout(() => {
            alert("¡BOOM! Has perdido.");
        }, 50);
        return;
    }

    //jugada normal
    compruebaAdyacentes(juego.tableroReal, juego.tableroVisible, posX, posY);

    //pinta la jugada
    tableroHTML();

    //victoria
    if (victoria(juego.tableroReal, juego.tableroVisible)) {
        pararCronometro();
        juego.fin = true;

        //muestra todo al ganar
        juego.tableroVisible = juego.tableroReal;
        tableroHTML();

        //retrasa el alert para que de tiempo a pintar el tablero descubierto
        setTimeout(() => {
            alert("¡Has ganado!");
        }, 50);
    }
}


const meteIcono = (valorCasillas) => {
    switch (valorCasillas) {
        case "F":
            return "<div class='icono-bandera'></div>";
        case "X":
            return "<img class='img_casilla' src=\"./img/x.png\" alt=\"\">";
        case "*":
            return "<img class='img_casilla' src=\"./img/caca.gif\" alt=\"\">";
        case 0:
            return "<img class='img_casilla' src=\"./img/cero.png\" alt=\"\">";
        default:
            return "<p class='txt_casilla'>" + valorCasillas + "</p>";

    }
}


const botonGuardar = () => {
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

const botonCargar = () => {
    if (!isEmpty(save)) {
        juego.tableroReal = JSON.parse(JSON.stringify(save.tableroReal));
        juego.tableroVisible = JSON.parse(JSON.stringify(save.tableroVisible));
        juego.numMinas = save.minasRestantes;
        juego.turnos = save.movimientos;
        juego.fin = false;
        juego.iniciado = true;
        alert("Partida cargada!");
        mostrarTablero(juego.tableroVisible);
        tableroHTML();
        console.table("Partida cargada:", save)//debug
    } else {
        alert("No hay partida guardada!");
    }
}


//coronómetro
const actualizarCronometro=()=> {
    juego.tiempoTranscurrido++;

    let minutos = Math.floor(juego.tiempoTranscurrido / 60);
    let segundos = juego.tiempoTranscurrido % 60;

    let minStr = minutos < 10 ? "0" + minutos : minutos;
    let secStr = segundos < 10 ? "0" + segundos : segundos;

    document.getElementById("cronometro").innerText = `Tiempo: ${minStr}:${secStr}`;
}

const iniciarCronometro=()=> {
    if (juego.timerId) clearInterval(juego.timerId);

    juego.tiempoTranscurrido = 0;

    juego.timerId = setInterval(actualizarCronometro, 1000);
}

const pararCronometro=()=> {
    if (juego.timerId) {
        clearInterval(juego.timerId);
        juego.timerId = null;
    }
}