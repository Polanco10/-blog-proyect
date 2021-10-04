const express = require('express');
const articleController = require('../controllers/articleController');
const authController = require('./../controllers/authController');

const router = express.Router(); //  middleware function
// const router = express.Router({mergeParams:true}); mergeParams:true-> acceso a params de otros routers definidos en otro routes / sirve para nested routes

//param middleware
//validate ID
// router.param('id', articleController.checkID);

router.route('/top-5').get(articleController.aliasTopArticles, articleController.getAllArticles);

//routes
router
    .route('/')
    .get(articleController.getAllArticles)
    .post(authController.protect, authController.restrictTo('admin'), articleController.setAuthor, articleController.createArticle);
router
    .route('/:id')
    .get(articleController.getArticle)
    .patch(authController.protect, authController.restrictTo('admin'), articleController.updateArticle)
    .delete(authController.protect, authController.restrictTo('admin'), articleController.deleteArticle);

module.exports = router;
