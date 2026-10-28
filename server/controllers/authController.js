const { validationResult } = require("express-validator");
const prisma = require("../../lib/prisma");
const bcrypt = require("bcryptjs")

const createUserPost = async (req, res, next) => {
    // 1. Check if express-validator caught any input errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    // Since we dropped confirmPassword from the frontend, we only destructure these three:
    const { username, email,password } = req.body;
    const passwordHash = await bcrypt.hash(password,10)

    try {
        const newAcc = await prisma.user.create({
            data:
           { username,
            email ,
            passwordHash}
        })
        res.status(200).json({message:'ok' ,
                            userId : newAcc.id
        })
    } catch (err) {
        console.error(err);
        // Handle unique constraint errors (e.g., email or username already taken)
        if (err.code === 'P2002') {
            return res.status(400).json({ 
                message: "A user with that email or username already exists." 
            });
        }
        next(err);
    }
};



const getCurrentUser = async (req, res, next) => {
  if (req.isAuthenticated && req.isAuthenticated()) {
    return res.json({ isAuthenticated: true, user: req.user });
  }
  return res.status(401).json({ isAuthenticated: false });
};

const updateProfile = async (req,res,next) => {
    const body = req.body
    const user = req.user
    const params = req.params

    console.log(body)
    console.log(user)
    console.log(params)
}

module.exports = ({createUserPost,getCurrentUser,updateProfile})