require("dotenv").config();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { StatusCodes } = require("http-status-codes");
const { Generator } = require("snowflake-generator");

//Snowflake use to generate random ID
const SnowflakeGenerator = new Generator(1420070400000);

const User = require("../models/user");

async function signup(req, res) {
  const { name, email, password } = req.body;
  const userId = SnowflakeGenerator.generate().toString();
  const date = new Date();

  const hashedPassword = await bcrypt.hash(password,10);
  const user = await User.create({
    _id: userId,
    name,
    email,
    password: hashedPassword,
    created_at: date,
  });
  user.save();

  //Getting the JWT token using the user id
  const token = jwt.sign({ _id: userId }, process.env.JWT_KEY, {
    expiresIn: "30d",
  });

  const resMessage = {
    status: true,
    content: {
      data: {
        id: userId,
        name,
        email,
        created_at: date,
      },
      meta: {
        access_token: token,
      },
    },
  };
  return res.json(resMessage);
}
async function signin(req, res) {
  const { email, password } = req.body;
  const findUser = await User.findOne({ email });
  const matchedPassword = await bcrypt.compare(password, findUser.password);
  if (!matchedPassword)
    return res.status(StatusCodes.BAD_REQUEST).json({
      status: false,
      errors: [
        {
          param: "password",
          message: "The credentials you provided are invalid.",
          code: "INVALID_CREDENTIALS",
        },
      ],
    });
  //Token generated to authorize user
  const token = jwt.sign({ _id: findUser._id }, process.env.JWT_KEY, {
    expiresIn: "30d",
  });

  const resMessage = {
    status: true,
    content: {
      data: {
        id: findUser._id,
        name: findUser.name,
        email: findUser.email,
        created_at: findUser.created_at,
      },
      meta: {
        access_token: token,
      },
    },
  };
  return res.json(resMessage);
}

async function getMe(req, res) {
  const authorizationHeader = req.headers["authorization"];

  //If authorization header is not provided, thereby the user is not signed in
  try {
    if (authorizationHeader && authorizationHeader.startsWith("Bearer ")) {
      //Decoding the user ID from the authorization header token
      const token = authorizationHeader.slice(7);
      const decoded = jwt.verify(token, process.env.JWT_KEY);
      const findUser = await User.findById({ _id: decoded._id });

      const resMessage = {
        status: true,
        content: {
          data: {
            id: findUser._id,
            name: findUser.name,
            email: findUser.email,
            created_at: findUser.created_at,
          },
        },
      };
      return res.json(resMessage);
    } else {
      res.json({
        status: false,
        errors: [
          {
            message: "You need to sign in to proceed.",
            code: "NOT_SIGNEDIN",
          },
        ],
      });
    }
  } catch (error) {
    return res.json({ message: error });
  }
}

module.exports = { signup, signin, getMe };
