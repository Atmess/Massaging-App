const { validationResult } = require("express-validator");
const prisma = require("../lib/prisma");
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

const updateProfile = async (req, res, next) => {
    try {
        const userId = parseInt(req.user.id, 10);
        const { name, username } = req.body;
        const fileData = req.savedFileData; // Whatever your storage middleware populates
      
        
        // 1. Fetch current user to get existing avatarUrl if no new file is uploaded
        const currentUser = await prisma.user.findUnique({
            where: { id: userId },
        });

        if (!currentUser) {
            return res.status(404).json({ message: "User not found" });
        }

        let newAvatarUrl = currentUser.avatarUrl;

        // 2. If a new file was uploaded, save or extract its URL
        if (fileData) {
            // Option A: If your storage middleware already gives you a public URL string:
            newAvatarUrl = fileData.url;
          
            // Option B: If you want to log it to your `File` table in Prisma:
             await prisma.file.create({
            data: {
            name: fileData.name,
            size: fileData.size,
            url: fileData.url,
            user:{connect:{id:userId}}
          },
        });
        }

        // 3. Update the user record
        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: {
                name: name !== undefined ? name : currentUser.name,
                username: username !== undefined ? username : currentUser.username,
                avatarUrl: newAvatarUrl,
            },
        });

        // 4. Send back the updated user (exclude password for safety!)
        const { password, ...userWithoutPassword } = updatedUser;
        res.status(200).json(userWithoutPassword);

    } catch (error) {
        console.error('Error updating user:', error);
        if (error.code === 'P2002') {
            return res.status(400).json({ message: 'Username is already taken.' });
        }
        next(error);
    }
};


module.exports = ({createUserPost,getCurrentUser,updateProfile})