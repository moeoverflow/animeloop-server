class Response {
  static returnSuccess(code, message, data) {
    return {
      status: 'success',
      code,
      message,
      data: (data === undefined ? {} : data),
    };
  }

  static returnError(statusCode, message) {
    return {
      status: 'error',
      code: statusCode,
      message,
    };
  }

  static handleResponse(res) {
    return (err, data) => {
      if (err) {
        res.json(Response.returnError(500, err.message));
        return;
      }
      res.json(this.returnSuccess(200, 'success', data));
    };
  }
}

module.exports = Response;
