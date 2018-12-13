"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const users_1 = __importDefault(require("../models/users"));
const users_schema_1 = require("./users.schema");
const validation_1 = __importDefault(require("../middlewares/validation"));
function userNotFound(res) {
    return res.status(404).json({
        status: 404,
        errors: [
            {
                message: 'User not found',
                path: ['_id'],
            },
        ],
    });
}
exports.default = (app) => {
    const router = express_1.Router();
    const { Users } = app.models;
    function findAllUsers(req, res, next) {
        const { Users } = app.models;
        Users.find()
            .select('-addresses -__v -password')
            .then(users => res.status(200).json(users))
            .catch(next);
    }
    function findUserById(req, res, next) {
        const { id } = req.params;
        return Users.findById(id)
            .select('-__v -password')
            .then((user) => {
            if (!user) {
                return userNotFound(res);
            }
            res.status(200).json(user);
        })
            .catch(next);
    }
    function registerNewUser(req, res, next) {
        return Users.create(req.data.body)
            .then(user => res.status(201).json(user))
            .catch(next);
    }
    function deleteUserById(req, res, next) {
        return users_1.default.deleteOne({ _id: req.params.id })
            .then(x => {
            res.status(200).json({
                status: 200,
                isDeleted: x.n > 0,
            });
        })
            .catch(next);
    }
    function findAllAddresses(req, res, next) {
        const { id } = req.params;
        return users_1.default.findById(id)
            .select('addresses')
            .then(addresses => {
            if (!addresses) {
                return userNotFound(res);
            }
            return res.status(200).json(addresses);
        })
            .catch(next);
    }
    function addNewAddress(req, res, next) {
        const { id } = req.params;
        const { body } = req.data;
        return Users.findById(id)
            .then(user => {
            user.addresses.push(body);
            return user.save().then(_ => {
                res.status(201).json(body);
            });
        })
            .catch(next);
    }
    function notImplemented(req, res) {
        res.json({ err: 'not implemented yet' });
    }
    router.get('/', findAllUsers);
    router.post('/', validation_1.default(users_schema_1.registerSchema), registerNewUser);
    router.get('/:id', findUserById);
    router.put('/:id', notImplemented);
    router.delete('/:id', deleteUserById);
    router.get('/:id/addresses', findAllAddresses);
    router.post('/:id/addresses', validation_1.default(users_schema_1.newAddress), addNewAddress);
    router.get('/:id/addresses/:addressId', notImplemented);
    router.put('/:id/addresses/:addressId', notImplemented);
    router.delete('/:id/addresses/:addressId', notImplemented);
    return router;
};
