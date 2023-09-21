const { Generator } = require("snowflake-generator");

const SnowflakeGenerator = new Generator(1420070400000);

const Role = require("../models/role");

async function createRole(req, res) {
  let { name } = req.query;
  name = name.toLowerCase();
  const roleId = SnowflakeGenerator.generate().toString();
  const date = new Date();

  const role = await Role.create({
    _id: roleId,
    name,
    created_at: date,
    updated_at: date,
  });
  role.save();

  const findRole = await Role.findById({ _id: roleId });
  const resMessage = {
    status: true,
    content: {
      data: findRole,
    },
  };
  return res.json({ resMessage });
}

async function getRole(req, res) {
  const total = await Role.countDocuments({});
  const pages = Math.ceil(total / 10);

  const findRoles = await Role.find({});
  const resMessage = {
    status: true,
    content: {
      meta: {
        total,
        pages,
        page: pages,
      },
      data: findRoles,
    },
  };
  return res.json(resMessage);
}

module.exports = { createRole, getRole };
