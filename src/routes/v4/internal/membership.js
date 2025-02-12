import { Router } from 'express';
import { getMembership } from '../../../controllers/v4/internal/membership.js';
import createRateLimiter from '../../../middlewares/rateLimit.js';

const router = Router();

router
  .route('/')
  /**
   * @api {get} v4/membership Get Membership Details
   * @apiDescription Retrieve membership details, including plans and features.
   * @apiName getMembership
   * @apiGroup Membership
   * @apiPermission user
   *
   * @apiHeader {String} Authorization System access token.
   *
   * @apiParam {String} [q] Optional query parameter to filter results.
   * @apiParamExample {json} Request Example:
   *    GET /membership?q=plans&features
   *
   * @apiSuccess {Object} membership Membership object.
   * @apiSuccessExample {json} Success Response:
   *    {
   *      "membership": {
   *        "plans": [...],
   *        "features": [...]
   *      }
   *    }
   *
   * @apiError (Unauthorized 401) Unauthorized Only authenticated users can access the data.
   * @apiError (Forbidden 403) Forbidden Only authorized users can access the data.
   * @apiError (Too Many Requests 429) TooManyRequests The client has exceeded the allowed number of requests within the time window.
   * @apiError (Bad Request 400) BadRequest Invalid query parameter(s) provided.
   * @apiError (Internal Server Error 500) InternalServerError An error occurred while processing the request.
   */
  .get(createRateLimiter(), getMembership);

// Export the router
export default router;
