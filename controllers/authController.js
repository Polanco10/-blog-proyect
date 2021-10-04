const crypto = require('crypto');
const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const User = require('./../models/userModel');
const AppError = require('./../utils/appError')
const catchAsync = require('./../utils/catchAsync');
const sendEmail = require('./../utils/email');

const signToken = id => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });//payload -> data a encriptar (_id) / se encripta en base a un secret y una fecha de expiracion
}

const createSendToken = (user, statusCode, res) => {

    const token = signToken(user._id);
    const cookieOptions = { // httpOnly:true -> el navegador no puede modificar la cookie (solo recivirla, almacenarla y reenviarla)
        expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000),
        httpOnly: true,
    }
    if (process.env.NODE_ENV === 'production') cookieOptions.secure = true; //secure:true -> la cookie solo se puede usar en https 
    res.cookie('jwt', token, cookieOptions);
    user.password = undefined; // trick para no devolver la password en el response
    res.status(statusCode).json({
        status: 'success',
        token,
        data: {
            user
        }
    });
}

exports.signup = catchAsync(async (req, res, next) => {
    const newUser = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        passwordConfirm: req.body.passwordConfirm
    });
    createSendToken(newUser, 201, res)
});

exports.login = catchAsync(async (req, res, next) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return next(new AppError('Please provide email and password!', 400));
    }
    const user = await User.findOne({ email }).select('+password'); //Devuelve la password en la consulta - que se configuró en el modelo como select: false

    if (!user || !await user.correctPassword(password, user.password)) {
        return next(new AppError('Incorrect email or password', 401));
    }
    createSendToken(user, 200, res);

});

exports.protect = catchAsync(async (req, res, next) => { //Protect middleware - valida las rutas solamente para usuarios logeados 
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) { //Valida que hayan enviado el token dentro del header del request
        token = req.headers.authorization.split(' ')[1];
    }
    if (!token) {
        return next(new AppError('You are not logged in! Please log in to get access.', 401));
    }
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET); //Se mete en una promesa la funcion verify / Se decodifica el token que se recibe / Levanta un Error si es que no es valido

    const currentUser = await User.findById(decoded.id); // Se valida que el usuario aun exista
    if (!currentUser) {
        return next(new AppError('The user belonging to this token does not exist.', 401))
    }
    if (currentUser.changedPasswordAfter(decoded.iat)) {//iat=issued at - Valida si es que el token se invalida por cambio de password
        return next(new AppError('User recently changed password! Please log in again.', 401))
    }
    req.user = currentUser; //Se almacena el usuario en el request para poder usarlo en otros middlewares
    next();
})

exports.restrictTo = (...roles) => {
    return (req, res, next) => { //middleware function
        if (!roles.includes(req.user.role)) {
            return next(new AppError('You do not have permission to perform this action', 403))
        }
        next();
    }
};

exports.forgotPassword = catchAsync(async (req, res, next) => { //Se envia correo con token para crear una nueva contraseña
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
        return next(new AppError('There is no user with email address', 404));
    }
    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false }); //se usa user.save() para persistir el token encriptado y la fecha proveniente de createPasswordResetToken() - validateBeforeSave:false -> para que no pida la confirmacion de la password

    const resetURL = `${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${resetToken}`;
    const message = `Forgot your password? Submit a PATCH  request with your new password and passwordConfirm to: ${resetURL}.\nIf you didn't forget your password, please ignore this email!`
    try {
        await sendEmail({
            email: user.email,
            subject: 'Your password reset token (valid for 10 min)',
            message
        });
        res.status(200).json({
            status: 'success',
            message: 'Token sent to email'
        })
    } catch (err) {
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save({ validateBeforeSave: false }) //si hay error en el mail borrar los campos de token y fecha de expiracion
        return next(new AppError('There was an error sending the email. Try again later!', 500))
    }
})

exports.resetPassword = catchAsync(async (req, res, next) => { //Resetiar la password (olvidando la contraseña)

    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex'); //Se encripta el token que llega por parametro
    const user = await User.findOne({ passwordResetToken: hashedToken, passwordResetExpires: { $gt: Date.now() } }); // se busca el token encryptado en la base de datos - compara fecha de expiracion con fecha actual

    if (!user) {
        return next(new AppError('Token is invalid or has expired!', 400))
    }
    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save(); // guardar nueva password - se ejecuta documents middlewares de encriptacion de password y seteo de fecha de cambio de password

    createSendToken(user, 200, res)

});

exports.updatePassword = catchAsync(async (req, res, next) => { //Cambiar la password

    const user = await User.findById(req.user.id).select('+password'); //devolver la password en la query

    if (! await user.correctPassword(req.body.passwordCurrent, user.password)) { // La password que se ingresó no coincide con la password actual del usuario
        return next(new AppError('Your current password is wrong', 401));
    }
    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    await user.save(); // Guarda /  Realiza validaciones asociadas a .save()

    createSendToken(user, 200, res);

});