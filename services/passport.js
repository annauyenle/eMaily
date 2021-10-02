const passport = require('passport')
const GoogleStrategy = require('passport-google-oauth20').Strategy
const mongoose = require('mongoose')
const keys = require('../config/keys')

const User = mongoose.model('users')

passport.serializeUser((user, done) => {
  console.log('user:', user)
  done(null, user.id)
})

passport.deserializeUser((id, done) => {
  User.findById(id)
    .then(user => {
      done(null, user)
    })
})

passport.use(
  new GoogleStrategy({
    clientID: keys.googleClientID,
    clientSecret: keys.googleClientSecret,
    callbackURL: '/auth/google/callback',
    proxy: true
  },
    (accessToken, refreshToken, profile, done) => {
      User.findOne({ googleId: profile.id })
        .then(existingUser => {
          if (existingUser) {
            console.log('User already exists in database.')
            done(null, existingUser)
          } else {
            new User({
              googleId: profile.id,
              displayName: profile.displayName
            }).save((err, res) => {
              if (err) {
                console.log('Unable to insert new user instance. Error:', err)
              } else {
                console.log('Successfully inserted:', res)
              }
            }).then(newUser => {
              done(null, newUser)
            })
          }
        }).catch(err => {
          console.log('Something went wrong with the OAuth process. Error:', err)
        })
    })
)