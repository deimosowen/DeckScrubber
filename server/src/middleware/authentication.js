module.exports = function ensureAuthenticated(req, res, next) {
    // Здесь логика аутентификации
    next();
};
