const checkLoggedIn=(req, res, next) => {
    console.log("checkLoggedIn");

    if(!res.locals.user){
        console.log("checkLoggedIn no user");
        return res.status(401).send("Unauthorized (checkLoggedIn)");
    }

    return next();
};

export default checkLoggedIn;