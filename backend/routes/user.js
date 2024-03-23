// backend/routes/user.js

const express = require("express");
const router = express.Router();

const { User, Account } = require("../db");
const zod = require("zod");
const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../config");
//signupp and signin Schema
const { authMiddleware } = require("../MiddleWare");

const signupSchema = zod.object({
  username: zod.string().email(),
  password: zod.string(),
  firstName: zod.string(),
  lastName: zod.string(),
});

router.post("/signup", async (req, res) => {
  const body = req.body;
  const { success } = signupSchema.safeParse(req.body);

  if (!success) {
    return res.json({
      message: "Email already taken / Incorrect inputs",
    });
  }

  const user = await User.findOne({
    username: body.username,
  });

  if (user) {
    return res.json({
      message: "Email already taken / Incorrect inputs",
    });
  }

  const dbUSer = await User.create({
    username: body.username,
    password: body.password,
    firstName: body.firstName,
    lastName: body.lastName,
  });

  const userId= dbUSer._id;

  await Account.create({
    userId,
    balance: 1 + Math.random() * 10000,
  })

  const token = jwt.sign({
      userId
    }, JWT_SECRET);

  res.json({
    message: "User created succesfully",
    token: token,
  });
});


const signinBody = zod.object({
  username: zod.string().email(),
  password: zod.string(),
});

router.post("/signin", async (req, res) => {
  const { success } = signinBody.safeParse(req.body);

  if (!success) {
    return res.json({
      message: "Incorrect Inputs",
    });
  }


    const user = await User.findOne({
    username: req.body.username,
    password: req.body.password,
  });

  if (user) {
    const token = jwt.sign(
      {
        userId: user._id,
      },
      JWT_SECRET
    );
    res.json({
      token: token,
    });
  }

  req.statusCode(411).json({
    message: "Error while Logging in",
  });
});

const updatedBody = zod.object({
  password: zod.string().optional(),
  firstName: zod.string().optional(),
  lastName: zod.string().optional(),
});

router.put("/", authMiddleware, async (req, res) => {
  const { success } = updatedBody.safeParse(req.body);

  if (!success) {
    res.json({
      message: "Error while updating information",
    });
  }

  await User.updateOne(req.body, { _id: req.userId });

  res.json({
    message: "Updated succesfully",
  });
});

router.get("/bulk", async (req, res) => {
  const filter = req.query.filter || "";

  const users = await User.find({
    $or: [
      {
        firstName: {
          $regex: filter,
        },
      },
      {
        lastName: {
          $regex: filter,
        },
      },
    ],
  });
  res.json({
    user: users.map((user) => ({
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      _id: user._id,
    })),
  });
});

module.exports = router;
