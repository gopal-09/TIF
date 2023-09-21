const { Generator } = require("snowflake-generator");
const { StatusCodes } = require("http-status-codes");
const jwt = require("jsonwebtoken");
const SnowflakeGenerator = new Generator(1420070400000);

const Community = require("../models/community");
const User = require("../models/user");
const Role = require("../models/role");
const Member = require("../models/member");

async function addMember(req, res) {
  const authorizationHeader = req.headers["authorization"];
  const { community, user, role } = req.query;
  try {
    if (authorizationHeader && authorizationHeader.startsWith("Bearer ")) {
      const token = authorizationHeader.slice(7);
      const decoded = jwt.verify(token, process.env.JWT_KEY);
      const findUser = await User.findById({ _id: decoded._id });
      const userId = findUser._id;

      const findCommunity = await Community.findById({ _id: community });
      const owner = findCommunity.owner;

      //Check if signedin user is owner of community
      if (owner !== userId)
        return res.status(StatusCodes.BAD_REQUEST).json({
          status: false,
          errors: [
            {
              message: "You are not authorized to perform this action.",
              code: "NOT_ALLOWED_ACCESS",
            },
          ],
        });

      const findMember = await Member.find({ community });

      //Check if member exists with same id as user id given in query
      const memberFound = findMember.find((member) => member.user === user);

      //Check if member already exists
      if (memberFound)
        return res.status(StatusCodes.BAD_REQUEST).json({
          status: false,
          errors: [
            {
              message: "User is already added in the community.",
              code: "RESOURCE_EXISTS",
            },
          ],
        });

      const memberId = SnowflakeGenerator.generate().toString();
      const date = new Date();
      const member = await Member.create({
        _id: memberId,
        community,
        user,
        role,
        created_at: date,
      });
      member.save();

      const getMember = await Member.findById({ _id: memberId });
      const resMessage = {
        status: true,
        content: {
          data: getMember,
        },
      };
      return res.json(resMessage);
    } else
      return res.json({
        status: false,
        errors: [
          {
            message: "You need to sign in to proceed.",
            code: "NOT_SIGNEDIN",
          },
        ],
      });
  } catch (error) {
    return res.json({ message: error });
  }
}

async function removeMember(req, res) {
  const _id = req.params.id;
  //Get Member using path variable: id
  const findMember = await Member.findById({ _id });
  const communityId = findMember.community;
  const findMemberRoleId = findMember.role;
  
  //Get community to which member belongs using community id
  const findCommunity = await Community.findById({ _id: communityId });
  const communityOwner = findCommunity.owner;

  const authorizationHeader = req.headers["authorization"];
  try {
    if (authorizationHeader && authorizationHeader.startsWith("Bearer ")) {
      const token = authorizationHeader.slice(7);
      const decoded = jwt.verify(token, process.env.JWT_KEY);
      const findUser = await User.findById({ _id: decoded._id });
      const userId = findUser._id;

      //Find signedin user in Member collection using the same community id as the member to be deleted and the user id of signedin user
      const findUserMember = await Member.findOne({
        $and: [{ user: userId }, { community: communityId }],
      });
      //Check if signedin user is a member of the community
      if (!findUserMember)
        return res
          .status(StatusCodes.BAD_REQUEST)
          .json({ message: "Not allowed access" });

      //Get Role details(id,name) using member found in Members collections of the signedin user
      const userRoleId = findUserMember.role;
      const userRole = await Role.findById({ _id: userRoleId });
      const role = userRole.name;

      //Check if signedin user is the owner or the moderator
      if (communityOwner == userId || role == "community moderator") {
        const deletedMember = await Member.findByIdAndDelete(_id);
        const deletedRole = await Role.findByIdAndRemove(findMemberRoleId);
        if (deletedMember && deletedRole)
          return res.status(StatusCodes.BAD_REQUEST).json({
            status: true,
          });
      } else
        return res
          .status(StatusCodes.BAD_REQUEST)
          .json({ message: "Not allowed access" });
    } else
      return res.json({
        status: false,
        errors: [
          {
            message: "You need to sign in to proceed.",
            code: "NOT_SIGNEDIN",
          },
        ],
      });
  } catch (error) {
    res.json({ message: error });
  }
}

module.exports = { addMember, removeMember };
