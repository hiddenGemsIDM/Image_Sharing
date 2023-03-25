const LocalStrategy = require("passport-local").Strategy;
const { pool } = require("./dbConfig");
const bcrypt = require("bcrypt");

function initialize(passport) {
    console.log("Initialized");

  const authenticateUser = (email, password, done) => {
   // console.log(email, password);

    pool.query(
      `SELECT * FROM public."User" WHERE email = $1`,
      [email],
      (err, results) => {
        if (err) {
          throw err;
        }
       // console.log(results.rows);

        if (results.rows.length > 0) {
          const user = results.rows[0];
           
          bcrypt.compare(password, user.passwordHash, (err, isMatch) => {
          console.log(password, user.passwordHash)
            if (err) {
              console.log(err);
            }
            if (isMatch) {
             // console.log(user)
              return done(null, user);
            } else {
              //password is incorrect
              return done(null, false, { message: "Password is incorrect" });
            }
          });
        } else {
          // No user
          return done(null, false, { message: "No user with that email address" });
        }
      }
    );
  };

  passport.use(
    new LocalStrategy(
      { usernameField: "email", passwordField: "password" },
      authenticateUser
    )
  );
  // Stores user details inside session. serializeUser determines which data of the user object should be stored in the session. 

 //passport.serializeUser((user, done) => done(null, user.userID));


 passport.serializeUser(function(user, done) {
    console.log(user)
    return done(null, user.userID)
 })

  // In deserializeUser that key is matched with the in memory array / database or any data resource.

  passport.deserializeUser((id, done) => {
    pool.query(`SELECT "userID", "firstName", "lastName", email, "passwordHash"
                FROM public."User" WHERE "userID" = $1`, [id], (err, results) => {
      if (err) {
        console.log('I am a dumbass')
        return done(err);
      }
      console.log(`ID is ${results.rows[0].userID}`);
      return done(null, results.rows[0]);
    });
  });


  // passport.deserializeUser(function(id, done) {
  //     console.log(id)
  //     return done(null, true)
  // })
}

module.exports = initialize;