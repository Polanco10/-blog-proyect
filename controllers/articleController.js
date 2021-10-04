const Article = require('./../models/articleModel');
const factory = require('./handlerFactory');



exports.setAuthor = (req, res, next) => { //middleware - Para setiar la id del usuario loggeado como author
    req.body.author = req.user.id
    next();
}
//routes handlers
exports.aliasTopArticles = (req, res, next) => { //Aliasing
    req.query.limit = '5';
    req.query.sort = 'title';
    req.query.fields = 'title,author';
    next();
}

exports.getAllArticles = factory.getAll(Article);

exports.getArticle = factory.getOne(Article);

exports.createArticle = factory.createOne(Article);

exports.updateArticle = factory.updateOne(Article);

exports.deleteArticle = factory.deleteOne(Article);
