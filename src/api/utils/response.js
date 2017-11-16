class Response {
  static returnSuccess(statusCode, message, data) {
    return {
      status_code: statusCode,
      message,
      data,
    };
  }

  static returnError(statusCode, message) {
    return {
      error: {
        status_code: statusCode,
        message,
      },
    };
  }

  static handleResponse(res) {
    return (err, data) => {
      if (err) {
        res.json(Response.returnError(404, err.message));
        return;
      }
      res.json(this.returnSuccess(200, 'success', data));
    };
  }
}

module.exports = Response;
