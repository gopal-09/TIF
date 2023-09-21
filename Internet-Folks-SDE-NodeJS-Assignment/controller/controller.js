const express = require("express");
const router = express.Router();

//Require Role Modules
const { createRole, getRole } = require("./role");

//Require User Modules
const { signup, signin, getMe } = require("./user");

//Require Validation modules
const {
  validateRole,
  isRequestValidated,
  validateSignUp,
  validateSignin,
  validateCommunityMember,
  validateMember,
  validateDeletionMember,
} = require("../validators/auth");

//Require Community modules
const {
  createCommunity,
  getCommunity,
  getMembers,
  getOwnedCommunity,
  getJoinedCommunity,
} = require("../controller/community");

//Require Member modules
const { addMember, removeMember } = require("./member");


//Routes for Role
router.route("/v1/role").post(validateRole, isRequestValidated, createRole);
router.route("/v1/role").get(getRole);

//Routes for User 
router
  .route("/v1/auth/signup")
  .post(validateSignUp, isRequestValidated, signup);
router
  .route("/v1/auth/signin") 
  .post(validateSignin, isRequestValidated, signin);
router.route("/v1/auth/me").get(getMe);

// Routes for Community 
router
  .route("/v1/community")
  .post(validateRole, isRequestValidated, createCommunity);
router.route("/v1/community").get(getCommunity);
router
  .route("/v1/community/:id/members")
  .get(validateCommunityMember, isRequestValidated, getMembers);
router.route("/v1/community/me/owner").get(getOwnedCommunity);
router.route("/v1/community/me/member").get(getJoinedCommunity);

//Routes for Member
router.route("/v1/member").post(validateMember, isRequestValidated, addMember);
router
  .route("/v1/member/:id")
  .delete(validateDeletionMember, isRequestValidated, removeMember);

module.exports = router;
