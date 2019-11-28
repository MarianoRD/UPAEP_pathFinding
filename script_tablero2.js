var locked = false;
const moves = [ // No diagonal moves
	{ x: 1, y: 0 },  // Right
	{ x: 0, y: 1 },  // Down
	{ x: -1, y: 0 }, // Left
	{ x: 0, y: -1 }  // Up
];
function reset_results() {
		$("td").not(".cell").not("th").not("td:first-child").text("");
}

$(document).ready(function () {
	var status = 0;
	var pi, pf;
	var mousedown = false;
	function save(pi, pf) {
		var start = null, end = null;
		var obstacles = [];
		if (startPoint != undefined) {
				start = { x: getX(pi), y: getY(pi) };
		}
		if (endPoint != undefined) {
				end = { x: getX(pf), y: getY(pf) };
		}

		var obstaclesList = $(".obstacles");
		for (let i = 0; i < obstaclesList.length; i++) {
				obstacles.push({ x: getX(obstaclesList[i]), y: getY(obstaclesList[i]) });

		}
		var board = {
					height: $("#height").val(),
					width: $("#width").val(),
					startPoint: start,
					endPoint: end,
					obstacles: obstacles };

		var myJSON = JSON.stringify(board);

		var blob = new Blob([myJSON], { type: 'application/json' });
		var anchor = document.createElement('a');
		anchor.download = "map.json";
		anchor.href = window.URL.createObjectURL(blob);
		anchor.dataset.downloadurl = ['application/json', anchor.download, anchor.href].join(':');
		anchor.click();
	}


	function load_file() {
		var file = document.getElementById('file').files[0];
		if (file != undefined) {
			if (file.type == "application/json") {
				var reader = new FileReader();
				reader.readAsText(file);
				reader.onload = function (event) {
					var board = JSON.parse(event.target.result);
					$("#height").val(board.height);
					$("#width").val(board.width);
					makeGrid();
					$("#" + board.pi.x + "_" + board.pi.y).addClass("start");
					startPoint = $("#" + board.pi.x + "_" + board.pi.y);
					$("#" + board.pf.x + "_" + board.pf.y).addClass("end");
					endPoint = $("#" + board.pf.x + "_" + board.pf.y);
					// Obstacles
					for (var i = 0; i < board.obstacles.length; i++) {
							cell = $("#" + board.obstacles[i].x + "_" + board.obstacles[i].y);
							cell.addClass("obstacles")
					}
				};
				reset_results();
			}
		}
	}

	function clean() {
		locked = false;
		$(".cell").removeClass("que");
		$(".cell").removeClass("visited");
		$(".cell").not(".startPoint .endPoint .obstacle").css("background-color", "").text("");
	}

	$("#clean").click(clean);
	$("#save").click(function () {
			save(startPoint, endPoint);
	});

	function makeGrid() {
		reset_results();
		locked = false;
		$("#content").empty();
		var content = "<table class='board'>";
		for (i = 0; i < $("#largo").val(); i++) {
			content += '<tr>';
			for (j = 0; j < $("#ancho").val(); j++) {
				content += '<td class="cell" id="' + j + '_' + i + '"></td>';
			}
			content += '</tr>';
		}
		content += "</table>";
		$('#content').append(content);
	}

	$("#load").click(loadFile);
	$("#apply").click(makeGrid);
	$("#startPoint").click(function () {
		status = 1;
	});
	$("#endPoint").click(function () {
			status = 2;
	});
	$("#obstacle").click(function () {
			status = 3;
	});

	$("#contenido").on("click", ".cell", function () {
		if (!locked) {
			if (status == 1) {
					if (startPoint != null)
							$(startPoint).removeClass("start");
					$(this).addClass("start");
					startPoint = $(this);
			}
			if (status == 2) {
				if (endPoint != null)
						$(endPoint).removeClass("end");
				$(this).addClass("end");
				endPoint = $(this);
			}
			reset_results();
			clean();
		}
		});


	$("#content").on("mousedown", ".cell", function () {
		if (status == 3 && !locked) {
			mousedown = true;
			$(this).toggleClass("obstacle");
			reset_results();
			clean();
		}
	});

	$("#contenido").on("mouseup", ".cell", function () {
				mousedown = false;
	});
	$("#contenido").on("mouseover", ".cell", function () {
			if (status == 3 && mousedown && !locked) {
					$(this).toggleClass("obstaculo");
					reset_results();
					limpiar();
			}
	});
	$("#go").click(function () {
		if (pi != null && pf != null) {
			clean();
			locked = true;
			switch ($("#meth").val()) {
				case "bfs":
					profundidad(startPoint, endPoint);
					break;
				case "dfs":
					amplitud(startPoint, endPoint);
					break;
				case "hc":
					hill(startPoint, endPoint);
					break;
				case "bpf":
					bestFirst(startPoint, endPoint);
					break;
				case "astar":
					a_star(startPoint, endPoint);
					break;
			}
		}
	});
});

function showPath(winner, algorithm) {
	if (winner == null)
		return;
	var length = 0;
	let nav = winner.previous;
	while (nav != null) {
		if (!nav.cell.is(".start")) {
			nav.cell.animate({
				backgroundColor: "#2ea66e"},
				100);
		}
		length++;
		nav = nav.previous;
	}
	algorithm.text(length);
}

function animator(order, id, winner, algorithm) {
		if (order[id].cell.is(".start, .end")) {
			animator(order, id + 1, winner, algorithm);
			return;
		}
		order[id].cell.animate({
					backgroundColor: "green"},
					30, function () {
						let color = "#00ffd0";
						order[id].cell.animate(
								{
										backgroundColor: color
								}, 20);
						if (id < order.length - 2) {
								animator(order, id + 1, winner, algorithm);
						}
						else {
								locked = false;
								showPath(winner, algorithm);
						}
				}
		);
}

function getX(cell) {
		var text = $(cell).attr("id");
		var arr = text.split("_");
		return parseFloat(arr[0]);
}
function getY(cell) {
		var text = $(cell).attr("id");
		var arr = text.split("_");
		return parseFloat(arr[1]);
}
function esValida(x, y) {
		if (x < 0 || y < 0)
				return false;
		var cell = $("#" + x + "_" + y);
		if ($(cell).is(".obstacle"))
				return false;
		if ($(cell).is(".visited"))
				return false;
		if ($(cell).is(".que"))
				return false;
		if (x >= $("#width").val() || y >= $("#height").val())
				return false;
		return true;
}

function profundidad(pi, pf) {
		var pasos = 0, cola = 0;
		var pila = [];
		var order = [];
		var actual;
		pila.push({ cell: pi, previous: null });
		var winner = null;
		var current;

		while (pila.length != 0) {
				actual = pila.pop();
				current = actual.cell;
				pasos++;
				//checar si llego a la meta
				if (getX(current) == getX(pf) && getY(current) == getY(pf)) {
						winner = actual;
						break;
				}

				//$(current).text(mark);
				$(current).addClass("visitado");
				/*
				0 derecha
				1 abajo
				2 izquierda
				3 arriba
				*/

				order.push({ cell: $(current), move: i, previous: null }); // animacion
				for (var i = 0; i < moves.length; i++) {
						//traslada las cordenadas actuales
						var nuevoX = getX(current) + moves[i].x;
						var nuevoY = getY(current) + moves[i].y;
						if (esValida(nuevoX, nuevoY)) {
								cola++;
								pila.push({ cell: $("#" + nuevoX + "_" + nuevoY), previous: actual });//guardar a la pila

								$("#" + nuevoX + "_" + nuevoY).addClass("que");
						}
				}

		}

		$("#profundidad_pasos").text(pasos);    //guardar resultados
		$("#profundidad_cola").text(cola);
		animator(order, 0, winner, $("#profundidad_longitud")); //mostrar animacion

}




//AMPLITUD
function amplitud(pi, pf) {
		var pasos = 0, cola_count = 0;
		var cola = [];
		var order = [];

		var actual;
		cola.push({ cell: pi, previous: null });
		var winner = null;
		var current;

		while (cola.length != 0) {
				actual = cola.shift();
				current = actual.cell;
				pasos++;
				order.push({ cell: $(current) });
				//checar si llego a la meta
				if (getX(current) == getX(pf) && getY(current) == getY(pf)) {
						winner = actual;
						break;
				}

				$(current).addClass("visitado");





				for (var i = 0; i < moves.length; i++) {
						//traslada las cordenadas actuales
						var nuevoX = getX(current) + moves[i].x;
						var nuevoY = getY(current) + moves[i].y;
						if (esValida(nuevoX, nuevoY)) {


								cola.push({ cell: $("#" + nuevoX + "_" + nuevoY), previous: actual });//guardar a la cola
								$("#" + nuevoX + "_" + nuevoY).addClass("que");
								cola_count++;
						}
				}
		}

		$("#amplitud_pasos").text(pasos);
		$("#amplitud_cola").text(cola_count);
		var stores = $("#amplitud_longitud");
		animator(order, 0, winner, stores);

}

function manhattan(p, pf) //manhattan
{
		xf = getX(pf);
		yf = getY(pf);

		x = getX(p);
		y = getY(p);
		return Math.abs(xf - x) + Math.abs(yf - y);
}

//Hill Climbing
function mark(cell) {
		cell.addClass("visitado");
}

function hill(pi, pf) {

		let current;
		let pasos = 0, cola = 0;
		let order = [];
		let succesors = [];
		let actual;
		var winner = null;
		succesors.push({ cell: $(pi), score: manhattan(pi, pf), previous: null });

		actual = succesors[0];
		do {

				//ordenar
				pasos++;
				succesors.sort((x, y) => x.score - y.score);
				order.push({ cell: $(actual.cell) });

				if (succesors[0].score > actual.score) {
						// tomar el primero

						break;
				}
				else {
						actual = succesors.shift();
				}
				current = actual.cell; // tomar el primero
				order.push({ cell: $(current) });

				succesors = [];

				mark($(current)); //marcar como visitado



				if (getX(current) == getX(pf) && getY(current) == getY(pf)) //verifica si se termino
				{

						winner = actual;
						break;
				}

				//checar derecha




				for (var i = 0; i < moves.length; i++) {
						//traslada las cordenadas actuales
						var nuevoX = getX(current) + moves[i].x;
						var nuevoY = getY(current) + moves[i].y;

						if (esValida(nuevoX, nuevoY)) //verifica que sea valido
						{
								var newcell = $("#" + nuevoX + "_" + nuevoY);
								var newSuccesor = { cell: newcell, score: manhattan($(newcell), $(pf)), previous: actual };
								succesors.push(newSuccesor);
								$(newSuccesor.cell).addClass("que");
								cola++;
								//$(newSuccesor.cell).text(newSuccesor.score); //animacion
						}

				}

		} while (succesors.length > 0);
		$("#hill_pasos").text(pasos);
		$("#hill_cola").text(cola);
		animator(order, 0, winner, $("#hill_longitud")); //animacion

}


function bestFirst(pi, pf) {

		let current;
		let pasos = 0, cola = 0;
		let order = [];
		let succesors = [];
		let actual;
		var winner = null;

		succesors.push({ cell: $(pi), score: manhattan(pi, pf), previous: null });
		actual = succesors[0];
		do {

				//ordenar
				pasos++;
				succesors.sort((x, y) => x.score - y.score);



				actual = succesors.shift();


				current = actual.cell; // tomar el primero


				mark($(current)); //marcar como visitado
				order.push({ cell: $(current), move: undefined });



				if (getX(current) == getX(pf) && getY(current) == getY(pf)) //verifica si se termino
				{

						winner = actual;
						break;
				}
				for (var i = 0; i < moves.length; i++) {
						//traslada las cordenadas actuales
						var nuevoX = getX(current) + moves[i].x;
						var nuevoY = getY(current) + moves[i].y;

						if (esValida(nuevoX, nuevoY)) //verifica que sea valido
						{
								var newcell = $("#" + nuevoX + "_" + nuevoY);
								var newSuccesor = { cell: newcell, score: manhattan($(newcell), $(pf)), previous: actual };
								succesors.push(newSuccesor);
								//$(newSuccesor.cell).text(Math.round((newSuccesor.score) * 100) / 100);
								$(newSuccesor.cell).addClass("que");
								cola++;
						}

				}

		} while (succesors.length > 0);
		$("#best_pasos").text(pasos);
		$("#best_cola").text(cola);
		animator(order, 0, winner, $("#best_longitud"));

}

function a_star(pi, pf) {

		let current;
		let pasos = 0, cola = 0;
		let order = [];
		let succesors = [];
		let actual;
		var winner = null;

		// se agrega a la cola un objeto que contiene el punto inicial, su puntuacion, y el elmento anterior y costo
		succesors.push({ cell: $(pi), score: manhattan(pi, pf), previous: null, costo: 0 });
		actual = succesors[0];
		do {

				//ordenar
				pasos++;
				succesors.sort((x, y) => (x.score + x.costo) - (y.score + y.costo));
				actual = succesors.shift(); //sacar de la lista
				current = actual.cell;
				mark($(current)); //marcar como visitado
				order.push({ cell: $(current) });

				if (getX(current) == getX(pf) && getY(current) == getY(pf)) //verifica si se llego a la meta
				{

						winner = actual;
						break;
				}

				for (var i = 0; i < moves.length; i++) {
						//traslada las cordenadas actuales
						var nuevoX = getX(current) + moves[i].x;
						var nuevoY = getY(current) + moves[i].y;

						if (esValida(nuevoX, nuevoY)) //verifica que sea valido
						{
								var newcell = $("#" + nuevoX + "_" + nuevoY);
								var newSuccesor = { cell: newcell, score: manhattan($(newcell), $(pf)), previous: actual, costo: actual.costo + 1 };
								succesors.push(newSuccesor);
								//$(newSuccesor.cell).text(Math.round((newSuccesor.score) * 100) / 100); //animacion
								//$(newSuccesor.cell).text($(newSuccesor.cell).text() + " + " + (actual.costo + 1));
								cola++;
								$(newSuccesor.cell).addClass("que");
						}
				}

		} while (succesors.length > 0);
		$("#a_star_pasos").text(pasos);
		$("#a_star_cola").text(cola);
		animator(order, 0, winner, $("#a_star_longitud")); //animacion

}
