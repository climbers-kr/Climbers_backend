const checkLoggedIn=(req, res, next) => {
    console.log("checkLoggedIn");
    console.dir(res.locals.user.username);
    if(!res.locals.user){
        console.log("checkLoggedIn no user");
        return res.status(401).send("Unauthorized (checkLoggedIn)");
    }

    return next();
};

export default checkLoggedIn;