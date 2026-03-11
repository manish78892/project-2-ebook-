
module.exports = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch((err) => {
            console.log("wrapAsync caught error:", err);
            next(err);
        });
    };
};
