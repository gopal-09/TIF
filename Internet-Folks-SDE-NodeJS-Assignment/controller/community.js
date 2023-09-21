const { Generator } = require("snowflake-generator");
const { StatusCodes } = require("http-status-codes");
const jwt = require("jsonwebtoken");

const SnowflakeGenerator = new Generator(1420070400000);

const Community = require("../models/community");
const User = require("../models/user");
const Role = require("../models/role");
const Member = require("../models/member");

async function createCommunity(req, res) {
  const authorizationHeader = req.headers["authorization"];
  const { name } = req.query;
  try {
    if (authorizationHeader && authorizationHeader.startsWith("Bearer ")) {
      const token = authorizationHeader.slice(7);
      const decoded = jwt.verify(token, process.env.JWT_KEY);
      const findUser = await User.findById({ _id: decoded._id });
      const slug = name.toLowerCase();
      const owner = findUser._id;
      const date = new Date();
      const communityId = SnowflakeGenerator.generate().toString();

      //Checking if community exists with same name
      const communityExists = await Community.findOne({ slug });
      if (communityExists)
        return res
          .status(StatusCodes.BAD_REQUEST)
          .json({ message: "Community with that name already exists" });

      //Creating community with given name
      const community = await Community.create({
        _id: communityId,
        name,
        slug,
        owner,
        created_at: date,
        updated_at: date,
      });

      community.save();

      const roleId = SnowflakeGenerator.generate().toString();
      //Creating role as Community Admin to add in Members
      const role = await Role.create({
        _id: roleId,
        name: "Community Admin",
        created_at: date,
        updated_at: date,
      });
      role.save();

      const memberId = SnowflakeGenerator.generate().toString();

      //First Member generated as part of the community
      const member = await Member.create({
        _id: memberId,
        community: communityId,
        user: owner,
        role: roleId,
        created_at: date,
      });
      member.save();

      const findCommunity = await Community.findById({ _id: communityId });
      const resMessage = {
        status: true,
        content: {
          data: findCommunity,
        },
      };
      return res.json(resMessage);
    }
  } catch (Error) {
    return res.json({ message: error });
  }
}

async function getCommunity(req, res) {
  const total = await Community.countDocuments({});
  const pages = Math.ceil(total / 10);
  const data = [];

  const findCommunity = await Community.find({});
  //Loop over all the community instances
  for (const community of findCommunity) {
    //Retrieve the community owner of each community through the owner referencing the user id
    const communityOwner = await User.findById({ _id: community.owner });
    data.push({
      id: community._id,
      name: community.name,
      slug: community.slug,
      owner: {
        id: communityOwner._id,
        name: communityOwner.name,
      },
      created_at: community.created_at,
      updated_at: community.updated_at,
    });
  }

  const resMessage = {
    status: true,
    content: {
      meta: {
        total,
        pages,
        page: pages,
      },
      data,
    },
  };
  return res.json(resMessage);
}

async function getMembers(req, res) {
  const id = req.params.id;
  const findCommunity = await Community.findOne({ slug: id });
  const communityId = findCommunity._id;
  const findMembers = await Member.find({ community: communityId });
  const data = [];

  for (const member of findMembers) {
    //Get user and role instances using the user and role referencing the User Id and Role Id respectively
    const user = await User.findById({ _id: member.user });
    const role = await Role.findById({ _id: member.role });

    data.push({
      id: member._id,
      community: member.community,
      user: {
        id: member.user,
        name: user.name,
      },
      role: {
        id: member.role,
        name: role.name,
      },
      created_at: member.created_at,
    });
  }

  const total = data.length;
  const pages = Math.ceil(total / 10);
  const resMessage = {
    status: true,
    content: {
      meta: {
        total,
        pages,
        page: pages,
      },
      data,
    },
  };
  return res.json(resMessage);
}
async function getOwnedCommunity(req, res) {
  const authorizationHeader = req.headers["authorization"];
  try {
    if (authorizationHeader && authorizationHeader.startsWith("Bearer ")) {
      const token = authorizationHeader.slice(7);
      const decoded = jwt.verify(token, process.env.JWT_KEY);
      const findUser = await User.findById({ _id: decoded._id });

      //Get community throough the user id
      const ownedCommunity = await Community.find({ owner: findUser._id });
      const total = ownedCommunity.length;
      const pages = Math.ceil(total / 10);
      const resMessage = {
        status: true,
        content: {
          meta: {
            total,
            pages,
            page: pages,
          },
          data: ownedCommunity,
        },
      };
      return res.json(resMessage);
    }
  } catch (error) {
    return res.json({ message: error });
  }
  return res.json({
    status: false,
    errors: [
      {
        message: "You need to sign in to proceed.",
        code: "NOT_SIGNEDIN",
      },
    ],
  });
}

async function getJoinedCommunity(req, res) {
  const authorizationHeader = req.headers["authorization"];
  try {
    if (authorizationHeader && authorizationHeader.startsWith("Bearer ")) {
      const token = authorizationHeader.slice(7);
      const decoded = jwt.verify(token, process.env.JWT_KEY);
      const findUser = await User.findById({ _id: decoded._id });

      const findMember = await Member.find({ user: findUser._id });
      const data = [];
      for (const member of findMember) {
        //Get community in member referencing the community ID
        const getCommunityId = member.community;
        const getCommunity = await Community.findById({ _id: getCommunityId });
        //Get community owner in User referncing the owner in Community
        const getCommunityOwner = await User.findById({
          _id: getCommunity.owner,
        });

        data.push({
          id: getCommunity.id,
          name: getCommunity.name,
          slug: getCommunity.slug,
          owner: {
            id: getCommunityOwner._id,
            name: getCommunityOwner.name,
          },
          created_at: getCommunity.created_at,
          updated_at: getCommunity.updated_at,
        });
      }
      const total = data.length;
      const pages = Math.ceil(total / 10);
      const resMessage = {
        status: true,
        content: {
          meta: {
            total,
            pages,
            page: pages,
          },
          data,
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

module.exports = {
  createCommunity,
  getCommunity,
  getMembers,
  getOwnedCommunity,
  getJoinedCommunity,
};
