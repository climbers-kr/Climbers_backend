const checkAdmin=(req, res, next) => {
    console.log("checkAdmin");

    if(res.locals.user.username !== 'master'){
        console.log("checkLoggedIn no user");
        return res.status(401).send("Unauthorized (checkLoggedIn)");
    }

    return next();
};

export default checkAdmin;