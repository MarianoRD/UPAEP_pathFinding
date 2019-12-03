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
	function saveFile(startPoint, endPoint) {
		var start = null, end = null;
		var obstacles = [];
		if (startPoint != undefined) {
				start = { x: getX(startPoint), y: getY(startPoint) };
        console.log("Start ok");
		}
		if (endPoint != undefined) {
				end = { x: getX(endPoint), y: getY(endPoint) };
        console.log("End ok");
		}
    console.log($(".obstacle"));
		var obstaclesList = $(".obstacle");
		for (let i = 0; i < obstaclesList.length; i++) {
				obstacles.push({ x: getX(obstaclesList[i]), y: getY(obstaclesList[i]) });
		}
		var board = {
					height: $("#height").val(),
					width: $("#width").val(),
					startPoint: start,
					endPoint: end,
					obstacles: obstacles
        };
		var payload = JSON.stringify(board);
		var file = new Blob([payload], { type: 'application/json'});
    var a = document.createElement("a");
    var url = URL.createObjectURL(file);
    a.href = url;
    a.download = "map.json";
    document.body.appendChild(a);
    a.click();
    setTimeout(function() {
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    }, 0);
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
					$("#" + board.startPoint.x + "_" + board.startPoint.y).addClass("start");
					startPoint = $("#" + board.startPoint.x + "_" + board.startPoint.y);
					$("#" + board.endPoint.x + "_" + board.endPoint.y).addClass("end");
					endPoint = $("#" + board.endPoint.x + "_" + board.endPoint.y);
					// Obstacles
					for (var i = 0; i < board.obstacles.length; i++) {
						node = $("#" + board.obstacles[i].x + "_" + board.obstacles[i].y);
						node.addClass("obstacle")
					}
				};
				reset_results();
			}
		}
	}

	function clean() {
		locked = false;
		$(".node").removeClass("que");
		$(".node").removeClass("visited");
		$(".node").not(".startPoint .endPoint .obstacle").css("background-color", "").text("");
	}
	$("#clean").click(clean);
	$("#save").click(function () {
		saveFile(startPoint, endPoint);
	});
  $("#load").click(loadFile);
	function makeGrid() {
		reset_results();
		locked = false;
		$("#content").empty();
		var content = "<table class='board'>";
		for (i = 0; i < $("#height").val(); i++) {
			content += '<tr>';
			for (j = 0; j < $("#width").val(); j++) {
				content += '<td class="node" id="' + j + '_' + i + '"></td>';
			}
			content += '</tr>';
		}
		content += "</table>";
		$('#content').append(content);
	}
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
	$("#content").on("click", ".node", function () {
		if (!locked) {
			if (status == 1) {
					if (startPoint != null) {
            $(startPoint).removeClass("start");
          }
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
	$("#content").on("mousedown", ".node", function () {
		if (status == 3 && !locked) {
			mousedown = true;
			$(this).toggleClass("obstacle");
			reset_results();
			clean();
		}
	});
	$("#content").on("mouseup", ".node", function () {
		mousedown = false;
	});
	$("#content").on("mouseover", ".node", function () {
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
		if (!nav.node.is(".start")) {
			nav.node.animate({
				backgroundColor: "#2ea66e"},
				100);
		}
		length++;
		nav = nav.previous;
	}
	algorithm.text(length);
}

function animator(order, id, winner, algorithm) {
	if (order[id].node.is(".start, .end")) {
		animator(order, id + 1, winner, algorithm);
		return;
	}
	order[id].node.animate({
		backgroundColor: "green"},
		30, function () {
			let color = "#00ffd0";
			order[id].node.animate({
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
		$("td").not(".node").not("th").not("td:first-child").text("");
}

function getX(node) {
	var text = $(node).attr("id");
	var arr = text.split("_");
	return parseFloat(arr[0]);
}

function getY(node) {
	var text = $(node).attr("id");
	var arr = text.split("_");
	return parseFloat(arr[1]);
}

function isValid(x, y) {
	if (x < 0 || y < 0)
			return false;
	var node = $("#" + x + "_" + y);
	if ($(node).is(".obstacle")) {
		return false;
	} else if ($(node).is(".visited")) {
		return false;
	} else if ($(node).is(".que")) {
		return false;
	}	else if (x >= $("#width").val() || y >= $("#height").val()) {
		return false;
	}
	return true;
}

function distanceDots(p, end) {
	var xEnd = getX(end);
	var yEnd = getY(end);
	var y = getY(p);
	var x = getX(p);

	distance = Math.pow((xEnd-x), 2) + Math.pow((yEnd - y), 2);
  distance = Math.sqrt(distance);

	return distance;
}

function bfs(start, end) {
		var steps = 0, qCount = 0;
		var q = [];
		var order = [];

		var temp;
		q.push({ node: start, previous: null });
		var winner = null;
		var current;

		while (q.length != 0) {
			temp = q.shift();
			current = temp.node;
			steps++;
			order.push({ node: $(current) });
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
					q.push({node: $("#" + newX + "_" + newY), previous: temp});
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
	stack.push({ node: start, previous: null });
	var winner = null;
	var current;

	while (stack.length != 0) {
		temp = stack.pop();
		current = temp.node;
		steps++;
		if (getX(current) == getX(end) && getY(current) == getY(end)) {
			winner = temp;
			break;
		}
		$(current).addClass("visited");
		order.push({node: $(current), move: i, previous: null});
		for (var i = 0; i < moves.length; i++) {
			var newX = getX(current) + moves[i].x;
			var newY = getY(current) + moves[i].y;
			if (isValid(newX, newY)) {
				count++;
				stack.push({ node: $("#" + newX + "_" + newY), previous: temp });
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

	succesors.push({node: $(start), score: distanceDots(start, end), previous: null});
	current = succesors[0];
  // Check if the first node is the goal
  if (getX(current.node) == getX(end) && getY(current.node) == getY(end)) {
    winner = current;
    loop = 0;
  }
  while (succesors.length > 0 && loop == 1) {
    steps++;
    for (var i = 0; i < moves.length; i++) {
      var newX = getX(current.node) + moves[i].x;
      var newY = getY(current.node) + moves[i].y;
      if (isValid(newX, newY)) {
        var newNode = $("#" + newX + "_" + newY);
        var newSuccesor = {node: newNode, score: distanceDots($(newNode), $(end)), previous: current};
        succesors.push(newSuccesor);
        $(newSuccesor.node).addClass("que");
        count++;
      }
    }
    for (var i = 0; i < succesors.length; i++) {
      let temp = succesors.pop();
      if (temp.score < current.score) {
        current.node.addClass("visited");
        order.push(current);
        current = temp;
        break;
      }
    }
    if (getX(current.node) == getX(end) && getY(current.node) == getY(end)) {
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

		succesors.push({ node: $(start), score: distanceDots(start, end), previous: null });
		temp = succesors[0];
		do {
				steps++;
				succesors.sort((x, y) => x.score - y.score);
				temp = succesors.shift();
				current = temp.node;
				$(current).addClass("visited");
				order.push({ node: $(current), move: undefined });
				if (getX(current) == getX(end) && getY(current) == getY(end)) {
					winner = temp;
					break;
				}
				for (var i = 0; i < moves.length; i++) {
					var newX = getX(current) + moves[i].x;
					var newY = getY(current) + moves[i].y;
					if (isValid(newX, newY)) {
						var newNode = $("#" + newX + "_" + newY);
						var newSuccesor = {node: $(newNode), score: distanceDots($(newNode), $(end)), previous: temp};
						succesors.push(newSuccesor);
						$(newSuccesor.node).addClass("que");
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

		succesors.push({node: $(start), score: distanceDots(start, end), previous: null, cost: 0});
		temp = succesors[0];
		do {
			steps++;
			succesors.sort((x, y) => (x.score + x.cost) - (y.score + y.cost));
			temp = succesors.shift();
			current = temp.node;
			$(current).addClass("visited");
			order.push({node: $(current)});
			if (getX(current) == getX(end) && getY(current) == getY(end)) {
				winner = temp;
				break;
			}
			for (var i = 0; i < moves.length; i++) {
				var newX = getX(current) + moves[i].x;
				var newY = getY(current) + moves[i].y;
				if (isValid(newX, newY)) {
					var newNode = $("#" + newX + "_" + newY);
					var newSuccesor = {node: $(newNode), score: distanceDots($(newNode), $(end)), previous: temp, cost: temp.cost + 1};
					succesors.push(newSuccesor);
					$(newSuccesor.node).addClass("que");
					count++;
				}
			}
		} while (succesors.length > 0);
		$("#a_star_steps").text(steps);
		$("#a_star_count").text(count);
		animator(order, 0, winner, $("#a_star_length"));
}
