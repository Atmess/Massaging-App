const passport = require("passport")
const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcryptjs");
const prisma = require("../../lib/prisma.js"); // Change this path to wherever your database pool is!

passport.use(
  new LocalStrategy(
    { usernameField: 'identifier' }, // <--- CRITICAL: Tells Passport to look at req.body.identifier
    async (identifier, password, done) => {
      try {
        // Find user by username OR email
        const user = await prisma.user.findFirst({
          where: {
            OR: [
              { username: identifier },
              { email: identifier },
            ],
          },
        });

        if (!user) {
          return done(null, false, { message: 'Incorrect username or email.' });
        }

        const match = await bcrypt.compare(password, user.passwordHash);
        if (!match) {
          return done(null, false, { message: 'Incorrect password.' });
        }

        return done(null, user);
      } catch (err) {
        return done(err);
      }
    }
  )
);
passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await prisma.user.findUnique({where:{id}});
    done(null, user);
  } catch(err) {
    done(err);
  }
});

// Export the configured passport object
module.exports=passport;