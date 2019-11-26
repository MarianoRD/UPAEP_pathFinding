$(document).ready(function(){
	var locked = false;
	var status = 0;
	var pi, pf;
	/* 1 pi
	 2 pf
	 3 obsta */
$("#aplicar").click(function(){
	$("#contenido").empty();
       var content = "<table>";
	for(i=0; i<$("#largo").val(); i++){
		content += '<tr>';
		for(j=0; j<$("#ancho").val(); j++)
		{	
			content += '<td class="cell" id="' + j +  '_' + i +'"></td>';
		}
		
		
		
		content += '</tr>';
	}
	content += "</table>";

	$('#contenido').append(content);
    });
	
	$("#p_inicio").click(function() {
		status = 1;
		
	});
	$("#p_final").click(function() {
		status = 2;
		
	});
	$("#obs").click(function() {
		status = 3;
		
	});
	
	$("#contenido").on("click", ".cell", function()
	{
		
		if (status == 1)
		{
			if (pi!=null)
			$(pi).removeClass("start");
		$(this).addClass("start");
		pi = this;
		
		}
		if (status == 2)
		{
			if (pf!=null)
			$(pf).removeClass("end");
		$(this).addClass("end");
		pf = this;
		
		}
		if (status == 3)
		{
			$(this).toggleClass("obstaculo");
		}		
		
	}		
		
	);
	$("#go").click(function()
	{
	if (pi!=null && pf!=null)
	{
		switch($("#meth").val())
		{
			case "Profundidad":
				profundidad(pi, pf);
			break;
			case "Amplitud":
				amplitud(pi,pf);
			break;
			case "Hill Climbing":
				hill(pi,pf);
		}
	}
	});
	
});
function getX(cell)
{
	var text=$(cell).attr("id");
	var arr = text.split("_");
	return parseFloat(arr[0]);
}
function getY(cell)
{
	var text=$(cell).attr("id");
	var arr = text.split("_");
	return parseFloat(arr[1]);
}
function profundidad(pi, pf)
{	
	var pasos = 0;
	var cola = [];
	
	cola.push(pi);
	
	
	while(cola.length != 0)
	{
		current = cola.pop();
		pasos++;
		//checar si llego a la meta
		if (getX(current) == getX(pf) && getY(current) == getY(pf))
		{
			alert("LLEGASTE A LA META!");
			break;
		}
	
	
	/*$(current).queue(function() {
                           $(this).addClass("visitado");
						   $(this).dequeue();
                       });*/
	                    $(this).addClass("visitado");

	//$(current).delay("fast").fadeOut();
	
	//checar derecha
	var nuevoX = 0;
	nuevoX = getX(current) + 1;
	var nuevoY = getY(current);
	
	if (esValida(nuevoX, nuevoY))
	{
		cola.push($("#" + nuevoX + "_" + nuevoY));
	}
	
	nuevoX = getX(current);
	nuevoY = getY(current) + 1;
	
	//checar abajo
	if (esValida(nuevoX, nuevoY))
	{
		cola.push($("#" + nuevoX + "_" + nuevoY));
	}
	
	nuevoX = getX(current) - 1;
	nuevoY = getY(current);
	
	//checar izquierda
	if (esValida(nuevoX, nuevoY))
	{
		cola.push($("#" + nuevoX + "_" + nuevoY));
	}
	
	nuevoX = getX(current);
	nuevoY = getY(current) - 1;
	
	//checar arriba
	if (esValida(nuevoX, nuevoY))
	{
		cola.push($("#" + nuevoX + "_" + nuevoY));
	}
	}
}
function esValida(x,y)
{

	if (x < 0 || y < 0)
	return false;
	
	var cell = $("#" + x + "_" + y);
	if( $(cell).is(".obstaculo"))
		return false;
	
	if( $(cell).is(".visitado"))
		return false;
	
	if (x >= $("#ancho").val() || y >= $("#largo").val() )
	return false;

	return true;
	
}

//AMPLITUD
function amplitud(pi, pf)
{	
	var pasos = 0;
	var cola = [];
	
	cola.push(pi);
	
	
	while(cola.length != 0)
	{
		current = cola[0];
		cola.splice(0,1);
		pasos++;
		//checar si llego a la meta
		if (getX(current) == getX(pf) && getY(current) == getY(pf))
		{
			alert("LLEGASTE A LA META!");
			break;
		}
	
	
	/*$(current).delay(200).queue(function() {
                           $(this).addClass("visitado");
						   $(this).dequeue();
                       });
*/
	//$(current).delay("fast").fadeOut();
	 $(this).addClass("visitado");
	//checar derecha
	var nuevoX = 0;
	nuevoX = getX(current) + 1;
	var nuevoY = getY(current);
	
	if (esValida(nuevoX, nuevoY))
	{
		cola.push($("#" + nuevoX + "_" + nuevoY));
	}
	
	nuevoX = getX(current);
	nuevoY = getY(current) + 1;
	
	//checar abajo
	if (esValida(nuevoX, nuevoY))
	{
		cola.push($("#" + nuevoX + "_" + nuevoY));
	}
	
	nuevoX = getX(current) - 1;
	nuevoY = getY(current);
	
	//checar izquierda
	if (esValida(nuevoX, nuevoY))
	{
		cola.push($("#" + nuevoX + "_" + nuevoY));
	}
	
	nuevoX = getX(current);
	nuevoY = getY(current) - 1;
	
	//checar arriba
	if (esValida(nuevoX, nuevoY))
	{
		cola.push($("#" + nuevoX + "_" + nuevoY));
	}
	}
	
	$("#consola").append();
}
function puntuarHipotenusa(tablero, i, j, xf, yf)
{
	
			if(esValida(i,j))
			{
				
				tablero[i][j] = Math.sqrt(Math.pow(xf-i,2) + Math.pow(yf-j,2));
			}
			else
			{
				tablero[i][j] = -1;
			}
}

function hipotenusa(x,y,xf,yf)
{
	return Math.sqrt(Math.pow(xf-x,2) + Math.pow(yf-y,2));
}

//Hill Climbing
function hill(pi,pf) {
	var tablero = [];
	for(i=0; i<$("#ancho").val(); i++)
	{
		tablero[i] = new Array($("#largo").val());
	}
	
	var xi = getX(pi);
	var yi =getY(pi);
	var xf = getX(pf);
	var yf =getY(pf);
	
	//Marcar el punto inicial
	
	tablero[xi][yi] = -1;
	//Marcar la meta 
	tablero[xf][yf] = -100;
	//los siguientes lugares
	actualx=xi;
	actualy=yi;
	
	
	
	
	
	var mejor = new Array(3);
	
	mejor[0] = actualx;
	mejor[1] = actualy;
	mejor[2] = hipotenusa(actualx,actualy,xf,yf);
	
	//derecha
	if(esValida(actualx+1, actualy))
	{
		mejor[0] = actualx + 1;
		mejor[1] = actualy;
		mejor[2] = hipotenusa(actualx,actualy,xf,yf);
	}
	
	//abajo
	if(esValida(actualx, actualy-1))
	{
		if(mejor[2] > hipotenusa(actualx,actualy-1,xf,yf))
		{
			mejor[0] = actualx;
			mejor[1] = actualy - 1;
			mejor[2] = hipotenusa(actualx,actualy-1,xf,yf);
		}
	}
	
	//izquierda
	if(esValida(actualx-1, actualy))
	{
		if(mejor[2] > hipotenusa(actualx-1,actualy,xf,yf))
		{
			mejor[0] = actualx - 1;
			mejor[1] = actualy;
			mejor[2] = hipotenusa(actualx-1,actualy,xf,yf);
		}
	}
	
	//arriba
	if(esValida(actualx, actualy+1))
	{
		if(mejor[2] > hipotenusa(actualx,actualy+1,xf,yf))
		{
			mejor[0] = actualx;
			mejor[1] = actualy + 1;
			mejor[2] = hipotenusa(actualx,actualy+1,xf,yf);
		}
	}
	
	actualx = mejor[0];
	actualy = mejor[1];
	
		
}