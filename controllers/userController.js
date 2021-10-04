const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const factory = require('./../controllers/handlerFactory');

const filterObj = (obj, ...allowedFields) => { //Crea un nuevo objeto a partir de las properties que se ingresan
    const newObj = {};
    Object.keys(obj).forEach(el => {
        if (allowedFields.includes(el)) newObj[el] = obj[el]
    });
    return newObj;
}

exports.getMe = (req, res, next) => { //middleware - Para extraer la id del usuario loggeado
    req.params.id = req.user.id;
    next()
}
//routes handlers
exports.updateMe = catchAsync(async (req, res, next) => { //Modificar data personal del usuario
    if (req.body.password || req.body.passwordConfirm) {
        return next(new AppError('This route is not for password updates. Please use / updateMyPassword.', 400));
    }
    const filteredBody = filterObj(req.body, 'name', 'email');
    const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, { new: true, runValidators: true }); //new:true -> devuelve el objeto user que encuentra en la query
    res.status(200).json({
        status: 'success',
        data: {
            user: updatedUser

        }
    })
});

exports.deleteMe = catchAsync(async (req, res, next) => {
    await User.findByIdAndUpdate(req.user.id, { active: false })
    res.status(204).json({
        status: 'success',
        data: null

    });
});


exports.getAllUsers = factory.getAll(User);
exports.getUser = factory.getOne(User);
exports.deleteUser = factory.deleteOne(User);
//No updatear passwords con updateUser!
exports.updateUser = factory.updateOne(User);