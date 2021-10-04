const express = require('express')
const userController = require('./../controllers/userController')
const authController = require('./../controllers/authController')

const router = express.Router(); //  middleware function


//routes
router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.post('/forgotPassword', authController.forgotPassword);
router.patch('/resetPassword/:token', authController.resetPassword);

router.use(authController.protect); //Aplica authControler.protect para todas las routes definidas bajo esta linea
router.patch('/updateMyPassword', authController.updatePassword);
router.get('/me', userController.getMe, userController.getUser);
router.patch('/updateMe', userController.updateMe);
router.delete('/deleteMe', userController.deleteMe);

router.use(authController.restrictTo('admin')); //Aplica authControler.restrictTo para todas las routes definidas bajo esta linea
router.route('/').get(userController.getAllUsers);
router.route('/:id').get(userController.getUser).patch(userController.updateUser).delete(userController.deleteUser);

module.exports = router;