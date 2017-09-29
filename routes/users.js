const express = require('express');
const passport = require('passport');
const Account = require('../models/user');
const router = express.Router();



router.get('/register', (req, res) => {
    res.render('register', { });
});

router.post('/register', (req, res, next) => {
    Account.register(new Account({ username : req.body.username }), req.body.password, (err, account) => {
        if (err) {
          return res.render('register', { error : err.message });
        }

        passport.authenticate('local')(req, res, () => {
            req.session.save((err) => {
                if (err) {
                    return next(err);
                }
                res.redirect('/');
            });
        });
    });
});


router.get('/login', (req, res) => {
    res.render('login', { user : req.user, error : req.flash('error')});
});

router.post('/login', passport.authenticate('local', { failureRedirect: '/users/login', failureFlash: true }), (req, res, next) => {
    console.log(req.session)
    req.session.save((err) => {
        
        if (err) {
            return next(err);
        }
        
        res.redirect(req.session.redirect_url);
    });
});

/*
router.post('/login',(req,res)=>{

  passport.authenticate('local', { failureRedirect: '/users/login', failureFlash: true },(err,user,info)=>{

    console.log(err,user,info)
  })

})

*/
router.get('/logout', (req, res, next) => {
    req.logout();
    req.session.save((err) => {
        if (err) {
            return next(err);
        }
        res.redirect('/');
    });
});

module.exports = router;