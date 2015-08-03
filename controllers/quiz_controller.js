var models = require("../models/models.js");


//Autoload - factoriza el codigo si ruta incluye :quidId
exports.load = function(req, res, next, quizId){
	models.Quiz.find({
						where: {id: Number(quizId)},
						include: [{model: models.Comment}]
					})
				.then(
					function(quiz){
						if(quiz){
							req.quiz = quiz;
							next();
						}else{
							next (new Error("No existe quizId = " + quizId));
						}
					}
				).catch(function(error){ next(error);});
};


// GET /quizes
exports.index = function(req, res){
	//console.log("LLISTAT PREGUNTES");

	var strBusqueda = (req.query.search || null);
	console.log("strBusqueda: " + strBusqueda);
	if (strBusqueda === null){
		strBusqueda = "%";
	}else{
		strBusqueda ="%" + strBusqueda.replace(/ /g, '%') + "%";
	}
	console.log("strBusqueda: " + strBusqueda);
	
	models.Quiz.findAll({where: ["pregunta like ?", strBusqueda]}).then(function(quizes){
		res.render('quizes/index.ejs', {quizes: quizes, errors: []});
	}
	).catch( function(error){ next(error); });
};




// GET /quizes/:id
exports.show = function(req, res){
	console.log("ENUNCIAT PREGUNTA");
	res.render("quizes/show", {quiz: req.quiz, errors: []})

	//models.Quiz.find(req.params.quizId).then(function(quiz){
	//	res.render('quizes/show', {quiz: quiz});
	//});
};




// GET /quizes/:id/answer
exports.answer = function (req, res){
	var resultado = "Incorrecto";
	if (req.query.respuesta === req.quiz.respuesta){
		resultado = "Correcto";
	}
	res.render(
		"quizes/answer", 
		{
			quiz: req.quiz, 
			respuesta: resultado,
			errors: []
		});

	/*
	models.Quiz.find(req.params.quizId).then(function(quiz){
		if (req.query.respuesta === quiz.respuesta){
			res.render('quizes/answer', {
										quiz: quiz,
										respuesta: "Correcto"});
		} else {
			res.render('quizes/answer', {
										quiz: quiz,
										respuesta: "Incorrecto"});
		}
	});
	*/
};


// GET /quizes/new
exports.new = function(req, res){
	var quiz = models.Quiz.build(		// crea objeto quiz
			{tema: "Tema", pregunta: "Pregunta", respuesta: "Respuesta"}
		);

	res.render('quizes/new', {quiz: quiz, errors: []});
};




// POST /quizes/create
exports.create = function(req, res){
	var quiz = models.Quiz.build( req.body.quiz );
	console.log("quiz: " + JSON.stringify(quiz));

	// guarda en DB los campos pregunta y resuesta de quiz
	
/*	 El següent codi es el que proposa el curs, pero no funciona. 
*	 El programa s'atura a la linea .then (no existeix el metode)
*	
*	quiz
*	.validate()
*	.then(		//TypeError: Object #<Object> has no method 'then'
*		function(err){
*			if (err) {
*				res.render('quizes/new', {quiz: quiz, errors: err.errors});
*			} else {
*				
*				quiz
*				.save({fields: ["pregunta", "respuesta"]})	// guarda en DB pregunta y respuesta del quiz
*				.then(function(){
*					res.redirect('/quizes');	//res.redirect: redireccion HTTP a la lista de preguntas
*				})
*			
*			}
*		}
*	);
*/

	// Solucio al problema anterior torbada al foro de curs

	var errors = quiz.validate();//ya qe el objeto errors no tiene then(
	if (errors)
	{
		var i=0; 
		var errores=new Array();//se convierte en [] con la propiedad message por compatibilida con layout
		for (var prop in errors) errores[i++]={message: errors[prop]};
		res.render('quizes/new', {quiz: quiz, errors: errores});
	} else {
		quiz // save: guarda en DB campos pregunta y respuesta de quiz
		.save({fields: ["tema", "pregunta", "respuesta"]})
		.then( function(){ res.redirect('/quizes')}) ;
	}


	
};



// GET quizes/:id/edit
exports.edit = function(req, res){
	var quiz = req.quiz;	// autoload de instancia de quiz

	res.render('quizes/edit', {quiz: quiz, errors:[]});
}



// GET quizes/:id
exports.update = function(req, res){
	req.quiz.tema  	   = req.body.quiz.tema;
	req.quiz.pregunta  = req.body.quiz.pregunta;
	req.quiz.respuesta = req.body.quiz.respuesta;
	
	console.log("EXPORTS.UPDATE");
	console.log("req.quiz.pregunta:\t\t" + req.quiz.pregunta);

	var errors = req.quiz.validate();//ya qe el objeto errors no tiene then(
	if (errors)
	{
		var i=0; 
		var errores=new Array();//se convierte en [] con la propiedad message por compatibilida con layout
		for (var prop in errors) errores[i++]={message: errors[prop]};
		res.render('quizes/edit', {quiz: req.quiz, errors: errores});
	} else {
		req.quiz // save: guarda en DB campos pregunta y respuesta de quiz
		.save({fields: ["tema", "pregunta", "respuesta"]})
		.then( function(){ res.redirect('/quizes');}) ;	//redireccion a la lista de preguntas
	}


}



// DELETE /quizes/:id
exports.destroy = function(req, res) {
	console.log("EXPORTS.DESTROY");
	
	req.quiz.destroy().then(function(){
		res.redirect('/quizes');
	}).catch(function(error){next(error)});
};