
var path = require("path");

// Postgres DATABASE_URL = postgres://user:passwd@host:port/databas
// SQLite   DATABASE_URL = sqlite://:@:/
var url = process.env.DATABASE_URL.match(/(.*)\:\/\/(.*?)\:(.*)@(.*)\:(.*)\/(.*)/);
var DB_name		= (url[6] || null);
var user		= (url[2] || null);
var pwd			= (url[3] || null);
var protocol	= (url[1] || null);
var dialect		= (url[1] || null);
var port		= (url[5] || null);
var host		= (url[4] || null);
var storage		= process.env.DATABASE_STORAGE;

// Cargar modelo ORM
var Sequelize = require('sequelize');

// Usar BBDD SQLite:
var sequelize = new Sequelize(DB_name, user, pwd,
								{dialect	: protocol,
								 protocol	: protocol,
								 port		: port,
								 host		: host,
								 storage 	: storage,	// solo sqlite (.env)
								 omitNull	: true}		// solo postges
					);

// Importar la definicion de la tabla Quiz en quiz.js
var Quiz = sequelize.import(path.join(__dirname, 'quiz'));

// Importar la definicion de la tabla Comment en coment.js
var Comment = sequelize.import(path.join(__dirname, 'comment'));

Comment.belongsTo(Quiz);  	// Un comment pertenece a un quiz
Quiz.hasMany(Comment);		// Un quiz puede tener muchos comments

/*
*  La relación añade la columna “QuizId” en
*  la tabla “Comment” que contiene la clave
*  externa (foreign key), que indica que
*  quiz esta asociado al comentario.
*/


exports.Quiz = Quiz;	//exportar definicion de tabla Quiz
exports.Comment = Comment;

// sequelize.sync() crea e inicializa tabla de preguntas en DB
sequelize.sync().success(function(){
	// success(..) ejecuta el manejador una vez creada la tabla
	Quiz.count().success(function(count){
		if (count === 0){
			Quiz.create({ pregunta: 'Capital de Italia',
						  respuesta: 'Roma',
						  tema: "humanidades"
					   });
			Quiz.create({ pregunta: 'Capital de Francia',
						  respuesta: 'Paris',
						  tema: "humanidades"
					   });
			Quiz.create({ pregunta: 'uno + uno',
						  respuesta: 'dos',
						  tema: "ciencia"
					   })
			.then(function(){console.log('Base de datos inicializada')});
		};
	});

});