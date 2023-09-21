const { check, validationResult } = require("express-validator");
const { StatusCodes } = require("http-status-codes");

//Require Databases 
const User = require("../models/user");
const Community = require("../models/community");
const Member = require("../models/member");
const Role = require("../models/role");

//Validation for Role
const validateRole = [
  check("name")
    .isLength({ min: 2 })
    .withMessage("Name should be atleast 2 characters."),
];

//Validation for User
const validateSignUp = [
  check("name")
    .isLength({ min: 2 })
    .withMessage("Name should be at least 2 characters."),
  check("email")
    .notEmpty()
    .withMessage("Email cannot be empty.")
    .isEmail()
    .withMessage("Enter valid email address.")
    .custom(async (email) => {
      const user = await User.findOne({ email });
      if (user) throw new Error("User with this email already exists.");
    }),
  check("password")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 6 })
    .withMessage("Password of length 6 required"),
];

const validateSignin = [
  check("email")
    .isEmail()
    .withMessage("Please provide valid email address")
    .custom(async (email) => {
      const findUser = await User.findOne({ email });
      if (!findUser) throw new Error("Email is not registered");
    }),
];

//Validation for Community
const validateCommunityMember = [
  check("id").custom(async (id) => {
    const findCommunity = await Community.findOne({ slug: id });
    if (!findCommunity) throw new Error("Community does not exist");
  }),
];

//Validation for Member
const validateMember = [
  check("community").notEmpty().withMessage("Community is required").custom(async (community) => {
    const findCommunity = await Community.findById({ _id: community });
    if (!findCommunity) throw new Error("Community not found.");
  }),
  check("user").notEmpty().withMessage("User is required").custom(async (user) => {
    const findUser = await User.findById({ _id: user });
    if (!findUser) throw new Error("User not found.");
  }),
  check("role").notEmpty().withMessage("Role is required").custom(async (role) => {
    const findRole = await Role.findById({ _id: role });
    if (!findRole) throw new Error("Role not found.");
  }),
];
const validateDeletionMember = [
  check("id").custom(async (id) => {
    const findMember = await Member.findById({ _id: id });
    if (!findMember) throw new Error("Member not found");
  }),
];

const isRequestValidated = async (req, res, next) => {
  const errors = validationResult(req);
  console.log(errors);
  if (errors.array().length > 0)
    return res.status(StatusCodes.BAD_REQUEST).json({
      status: false,
      errors: [
        {
          param: errors.array()[0].path,
          message: errors.array()[0].msg,
          code: "INVALID_INPUT",
        },
      ],
    });
  next();
};

module.exports = {
  validateRole,
  validateSignUp,
  isRequestValidated,
  validateSignin,
  validateCommunityMember,
  validateMember,
  validateDeletionMember,
};
