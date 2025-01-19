import { Router } from 'express';
import {
  retrieveUserProfile,
  processUserAction,
  processUserSessionAndUpdate,
  getUser,
} from '../../../controllers/v4/internal/user.js';
import createRateLimiter from '../../../middlewares/rateLimit.js';

const router = Router();

router
  .route('/')
  /**
   * @api {post} v4/user Get User Details
   * @apiDescription Get details about the authenticated user.
   * @apiName getUserDetails
   * @apiGroup UserManagement
   * @apiPermission user
   *
   * @apiHeader {String} Key Internal access token
   *
   * @apiSuccess {Object} userDetails User's details.
   * @apiSuccess {String} userDetails.username User's username.
   * @apiSuccess {String} userDetails.email User's email address.
   * @apiSuccess {String} userDetails.avatar User's avatar URL.
   * @apiSuccess {Date} userDetails.createdAt Date when the user profile was created.
   *
   * @apiError (Unauthorized 401) Unauthorized Only authenticated users can access the data.
   * @apiError (Forbidden 403) Forbidden Only authorized users can access the data.
   * @apiError (Too Many Requests 429) TooManyRequests The client has exceeded the allowed number of requests within the time window.
   * @apiError (Internal Server Error 500) InternalServerError An error occurred while processing the rate limit.
   *
   * @api {function} createRateLimiter
   * @apiDescription Creates a rate limiter middleware to control the frequency of requests.
   * @apiSuccess {function} middleware Express middleware function that handles rate limiting.
   *
   */
  .post(createRateLimiter(), processUserSessionAndUpdate)
  .get(createRateLimiter(), getUser);

router
  .route('/profile/:id')
  /**
   * @api {get} v4/user/profile/:id Get User Profile
   * @apiDescription Get the profile of a specific user.
   * @apiName retrieveUserProfile
   * @apiGroup UserManagement
   * @apiPermission sudo
   *
   * @apiHeader {String} Key Internal access token
   *
   * @apiParam {String} id User's unique identifier.
   *
   * @apiSuccess {Object} userProfile User's profile information.
   * @apiSuccess {String} userProfile.username User's username.
   * @apiSuccess {String} userProfile.email User's email address.
   * @apiSuccess {String} userProfile.avatar User's avatar URL.
   * @apiSuccess {Date} userProfile.createdAt Date when the user profile was created.
   *
   * @apiError (Unauthorized 401) Unauthorized Only authenticated users can access the data.
   * @apiError (Forbidden 403) Forbidden Only authorized users can access the data.
   * @apiError (Too Many Requests 429) TooManyRequests The client has exceeded the allowed number of requests within the time window.
   * @apiError (Internal Server Error 500) InternalServerError An error occurred while processing the rate limit.
   *
   * @api {function} createRateLimiter
   * @apiDescription Creates a rate limiter middleware to control the frequency of requests.
   * @apiSuccess {function} middleware Express middleware function that handles rate limiting.
   *
   */
  .get(createRateLimiter(), retrieveUserProfile)
  /**
   * @api {patch} v4/user/profile/:id Perform User Action (addquota, removequota, ban, unban, updatetoken)
   * @apiDescription Processes various user actions including adding/removing quota, banning/unbanning users, and updating user token.
   * @apiName processUserAction
   * @apiGroup UserManagement
   * @apiPermission sudo
   *
   * @apiHeader {String} Key Internal access token
   *
   * @apiParam {String} id User's unique identifier.
   * @apiParam {String} action Action to be performed (e.g., addquota, removequota, ban, unban, updatetoken).
   * @apiParam {String} [amount] Amount of quota to add or remove (required for addquota/removequota).
   * @apiParam {String} [reason] Reason for the action (required for ban, unban, and updatetoken).
   * @apiParam {String} [executor] Executor of the action (optional).
   * @apiParam {String} [expiry] Expiry of the ban (optional).
   *
   * @apiSuccess {Object} message Success message with details of the performed action.
   * @apiSuccess {Object} user Updated user data after the action.
   * @apiError (Unauthorized 401) Unauthorized Only authenticated users can perform actions.
   * @apiError (Forbidden 403) Forbidden Only authorized users can perform certain actions.
   * @apiError (Bad Request 400) BadRequest Invalid parameters for the specified action.
   * @apiError (Internal Server Error 500) InternalServerError An error occurred while processing the action.
   *
   * @api {function} createRateLimiter
   * @apiDescription Creates a rate limiter middleware to control the frequency of requests.
   * @apiSuccess {function} middleware Express middleware function that handles rate limiting.
   */

  .patch(createRateLimiter(), processUserAction);

// Export the router
export default router;
