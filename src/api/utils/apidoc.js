/**
 * @apiDefine APISuccess
 * @apiSuccess {Number} status_code status code
 * @apiSuccess {String} message message
 * @apiSuccess {Object} data response data
 */

/**
 * @apiDefine APIError
 * @apiError {Object} error error object
 * @apiError {Number} error.status_code error status code
 * @apiError {String} error.message error message
 */

/**
 * @api {get} /common Response
 * @apiName COMMON
 * @apiDescription this is not a real api, for telling response success and error example
 * @apiGroup COMMON
 *
 * @apiUse APISuccess
 * @apiUse APIError
 *
 * @apiSampleRequest off
 */
