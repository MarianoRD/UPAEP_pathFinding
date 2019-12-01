var locked = false;

const moves = [ // No diagonal moves
	{ x: 1, y: 0 },  // Right
	{ x: 0, y: 1 },  // Down
	{ x: -1, y: 0 }, // Left
	{ x: 0, y: -1 }  // Up
];

$(document).ready(function () {
	var status = 0;
	var startPoint, endPoint;
	var mousedown = false;
	function save(startPoint, endPoint) {
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

	function loadFile() {
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
		for (i = 0; i < $("#height").val(); i++) {
			content += '<tr>';
			for (j = 0; j < $("#width").val(); j++) {
				content += '<td class="cell" id="' + j + '_' + i + '"></td>';
			}
			content += '</tr>';
		}
		content += "</table>";
		$('#content').append(content);
	}
	$("#load").click(loadFile);
	$("#set").click(makeGrid);
	$("#startPoint").click(function () {
		status = 1;
	});
	$("#endPoint").click(function () {
			status = 2;
	});
	$("#obstacles").click(function () {
			status = 3;
	});
	$("#content").on("click", ".cell", function () {
		if (!locked) {
			if (status == 1) {
					if (startPoint != null)
							$(startPoint).removeClass("start");
					$(this).addClass("start");
					startPoint = $(this);
			}
			if (status == 2) {
				if (endPoint != null) {
				 $(endPoint).removeClass("end");
				}
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

	$("#content").on("mouseup", ".cell", function () {
		mousedown = false;
	});
	$("#content").on("mouseover", ".cell", function () {
		if (status == 3 && mousedown && !locked) {
			$(this).toggleClass("obstacle");
			reset_results();
			clean();
			}
	});

	$("#go").click(function () {
		if (startPoint != null && endPoint != null) {
			clean();
			locked = true;
			switch ($("#meth").val()) {
				case "bfs":
					bfs(startPoint, endPoint);
					break;
				case "dfs":
					dfs(startPoint, endPoint);
					break;
				case "hc":
					hill(startPoint, endPoint);
					break;
				case "bpf":
					bpf(startPoint, endPoint);
					break;
				case "astar":
					a_star(startPoint, endPoint);
					break;
			}
		}
	});
});

function showPath(winner, algorithm) {
	if (winner == null) {
    return;
  }
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
			order[id].cell.animate({
				backgroundColor: color},
				20);
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

function reset_results() {
		$("td").not(".cell").not("th").not("td:first-child").text("");
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

function isValid(x, y) {
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

function distanceDots(p, end) {
	var xEnd = getX(end);
	var yEnd = getY(end);
	var x = getX(p);
	var y = getY(p);

	distance = Math.pow((xEnd-x), 2) + Math.pow((yEnd - y), 2);
  distance = Math.sqrt(distance);

	return distance;
}

function mark(cell) {
		cell.addClass("visited");
}

function bfs(start, end) {
		var steps = 0, qCount = 0;
		var q = [];
		var order = [];

		var temp;
		q.push({ cell: start, previous: null });
		var winner = null;
		var current;

		while (q.length != 0) {
			temp = q.shift();
			current = temp.cell;
			steps++;
			order.push({ cell: $(current) });
			// Check if in ending point
			if (getX(current) == getX(end) && getY(current) == getY(end)) {
					winner = temp;
					break;
			}
			$(current).addClass("visited");
			for (var i = 0; i < moves.length; i++) {
				var newX = getX(current) + moves[i].x;
				var newY = getY(current) + moves[i].y;
				if (isValid(newX, newY)) {
					q.push({cell: $("#" + newX + "_" + newY), previous: temp});
					$("#" + newX + "_" + newY).addClass("que");
					qCount++;
				}
			}
		}
		$("#bfs_steps").text(steps);
		$("#bfs_queue").text(qCount);
		animator(order, 0, winner, $("#bfs_length"));
}

function dfs(start, end) {
	var steps = 0, count = 0;
	var stack = [];
	var order = [];
	var temp;
	stack.push({ cell: start, previous: null });
	var winner = null;
	var current;

	while (stack.length != 0) {
		temp = stack.pop();
		current = temp.cell;
		steps++;
		if (getX(current) == getX(end) && getY(current) == getY(end)) {
			winner = temp;
			break;
		}
		$(current).addClass("visited");
		order.push({cell: $(current), move: i, previous: null});
		for (var i = 0; i < moves.length; i++) {
			var newX = getX(current) + moves[i].x;
			var newY = getY(current) + moves[i].y;
			if (isValid(newX, newY)) {
				count++;
				stack.push({ cell: $("#" + newX + "_" + newY), previous: temp });
				$("#" + newX + "_" + newY).addClass("que");
			}
		}
	}
	$("#dfs_steps").text(steps);    //guardar resultados
	$("#dfs_count").text(count);
	animator(order, 0, winner, $("#dfs_length"));
}

function hill(start, end) {
  let steps = 0, count = 0;
	let current;
	let order = [];
	let succesors = [];
	var winner = null;
  let loop = 1;

	succesors.push({cell: $(start), score: distanceDots(start, end), previous: null});
	current = succesors[0];
  // Check if the first cell is the goal
  if (getX(current.cell) == getX(end) && getY(current.cell) == getY(end)) {
    winner = current;
    loop = 0;
  }
  while (succesors.length > 0 && loop == 1) {
    steps++;
    console.log(steps);
    for (var i = 0; i < moves.length; i++) {
      var newX = getX(current.cell) + moves[i].x;
      var newY = getY(current.cell) + moves[i].y;
      if (isValid(newX, newY)) {
        console.log("Adding (" + newX + "," + newY + ")");
        var newcell = $("#" + newX + "_" + newY);
        var newSuccesor = {cell: newcell, score: distanceDots($(newcell), $(end)), previous: current};
        succesors.push(newSuccesor);
        $(newSuccesor.cell).addClass("que");
        count++;
      }
    }
    for (var i = 0; i < succesors.length; i++) {
      let temp = succesors.shift();
      console.log("¿"+temp.score+" < "+current.score+"?");
      if (temp.score < current.score) {
        console.log("Changing to: " + temp.score);
        current.cell.addClass("visited");
        order.push(current);
        current = temp;
        break;
      }
    }
    if (getX(current.cell) == getX(end) && getY(current.cell) == getY(end)) {
      console.log("WE HAVE A WINNER");
      winner = current;
      loop = 0;
      break;
    }
  }
		$("#hill_steps").text(steps);
		$("#hill_count").text(count);
		animator(order, 0, winner, $("#hill_length"));
}


function bpf(start, end) {
		let current;
		let steps = 0, count = 0;
		let order = [];
		let succesors = [];
		let temp;
		var winner = null;

		succesors.push({ cell: $(start), score: distanceDots(start, end), previous: null });
		temp = succesors[0];
		do {
				steps++;
				succesors.sort((x, y) => x.score - y.score);
				temp = succesors.shift();
				current = temp.cell;
				mark($(current));
				order.push({ cell: $(current), move: undefined });
				if (getX(current) == getX(end) && getY(current) == getY(end)) {
					winner = temp;
					break;
				}
				for (var i = 0; i < moves.length; i++) {
					var newX = getX(current) + moves[i].x;
					var newY = getY(current) + moves[i].y;
					if (isValid(newX, newY)) {
						var newcell = $("#" + newX + "_" + newY);
						var newSuccesor = {cell: $(newcell), score: distanceDots($(newcell), $(end)), previous: temp};
						succesors.push(newSuccesor);
						$(newSuccesor.cell).addClass("que");
						count++;
					}
				}
		} while (succesors.length > 0);
		$("#best_steps").text(steps);
		$("#best_count").text(count);
		animator(order, 0, winner, $("#best_length"));
}

function a_star(start, end) {
		let current;
		let steps = 0, count = 0;
		let order = [];
		let succesors = [];
		let temp;
		var winner = null;

		succesors.push({cell: $(start), score: distanceDots(start, end), previous: null, cost: 0});
		temp = succesors[0];
		do {
			steps++;
			succesors.sort((x, y) => (x.score + x.cost) - (y.score + y.cost));
			temp = succesors.shift();
			current = temp.cell;
			mark($(current));
			order.push({cell: $(current)});
			if (getX(current) == getX(end) && getY(current) == getY(end)) {
				winner = temp;
				break;
			}
			for (var i = 0; i < moves.length; i++) {
				var newX = getX(current) + moves[i].x;
				var newY = getY(current) + moves[i].y;
				if (isValid(newX, newY)) {
					var newcell = $("#" + newX + "_" + newY);
					var newSuccesor = {cell: $(newcell), score: distanceDots($(newcell), $(end)), previous: temp, cost: temp.cost + 1};
					succesors.push(newSuccesor);
					$(newSuccesor.cell).addClass("que");
					count++;
				}
			}
		} while (succesors.length > 0);
		$("#a_star_steps").text(steps);
		$("#a_star_count").text(count);
		animator(order, 0, winner, $("#a_star_length"));
}
