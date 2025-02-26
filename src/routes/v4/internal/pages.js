import { Router } from 'express';
import createRateLimiter from '../../../middlewares/rateLimit.js';
import {
  getPageStatus,
  getPageMeta,
  checkPageAccess,
  getPageInfo,
  updatePage,
  addPage,
} from '../../../controllers/v4/internal/pages.js';

const router = Router();

router
  .route('/')
  /**
   * @api {post} v4/pages Add Page
   * @apiDescription Adds a new page to the system.
   * @apiName addPage
   * @apiGroup PageManagement
   * @apiPermission internal
   *
   * @apiHeader {String} Key Internal access token.
   * @apiBody {String} name Page name.
   * @apiBody {Boolean} [available] Page availability status.
   * @apiBody {String="production","alpha","beta"} [type] Page type.
   * @apiBody {Object} [maintenance] Maintenance info.
   * @apiBody {Object} [permission] Role-based access.
   *
   * @apiSuccess {Object} page Newly created page details.
   *
   * @apiError (401) Unauthorized Invalid or missing access key.
   * @apiError (400) BadRequest Missing or invalid required fields.
   * @apiError (500) InternalServerError Unexpected error.
   */
  .post(addPage);

router
  .route('/:id/status')
  /**
   * @api {get} v4/pages/:id/status Get Page Status
   * @apiDescription Fetches the availability and maintenance status of a specific page.
   * @apiName getPageStatus
   * @apiGroup PageManagement
   * @apiPermission internal
   *
   * @apiHeader {String} Key Internal access token.
   * @apiParam {String} id Page's unique identifier.
   *
   * @apiSuccess {String} _id Page ID.
   * @apiSuccess {Boolean} available Page availability status.
   * @apiSuccess {Object} maintenance Page maintenance status and message.
   *
   * @apiError (401) Unauthorized Invalid or missing access key.
   * @apiError (404) NotFound Page not found.
   * @apiError (500) InternalServerError Unexpected error.
   */
  .get(getPageStatus);

router
  .route('/:id/meta')
  /**
   * @api {get} v4/pages/:id/meta Get Page Metadata
   * @apiDescription Fetches metadata, including type, permissions, and maintenance info.
   * @apiName getPageMeta
   * @apiGroup PageManagement
   * @apiPermission internal
   *
   * @apiHeader {String} Key Internal access token.
   * @apiParam {String} id Page's unique identifier.
   *
   * @apiSuccess {String} _id Page ID.
   * @apiSuccess {String} type Page type (production, alpha, beta).
   * @apiSuccess {Object} maintenance Maintenance info.
   * @apiSuccess {Object} permission Role-based access.
   *
   * @apiError (401) Unauthorized Invalid or missing access key.
   * @apiError (404) NotFound Page not found.
   * @apiError (500) InternalServerError Unexpected error.
   */
  .get(getPageMeta);

router
  .route('/:id/access')
  /**
   * @api {get} v4/pages/:id/access Check Page Access
   * @apiDescription Checks if a user role has access to the page.
   * @apiName checkPageAccess
   * @apiGroup PageManagement
   * @apiPermission internal
   *
   * @apiHeader {String} Key Internal access token.
   * @apiParam {String} id Page's unique identifier.
   * @apiQuery {String} role User role to check access.
   *
   * @apiSuccess {Boolean} access True if role has access, false otherwise.
   *
   * @apiError (401) Unauthorized Invalid or missing access key.
   * @apiError (400) BadRequest Role query parameter is required.
   * @apiError (404) NotFound Page not found.
   * @apiError (500) InternalServerError Unexpected error.
   */
  .get(checkPageAccess);

router
  .route('/:id')
  /**
   * @api {get} v4/pages/:id Get Page Info
   * @apiDescription Returns general page details, including type, status, and permissions.
   * @apiName getPageInfo
   * @apiGroup PageManagement
   * @apiPermission internal
   *
   * @apiHeader {String} Key Internal access token.
   * @apiParam {String} id Page's unique identifier.
   *
   * @apiSuccess {Object} page Full page details.
   *
   * @apiError (401) Unauthorized Invalid or missing access key.
   * @apiError (404) NotFound Page not found.
   * @apiError (500) InternalServerError Unexpected error.
   */
  .get(getPageInfo)
  /**
   * @api {patch} v4/pages/:id Update Page
   * @apiDescription Updates page details (availability, type, maintenance, or permissions).
   * @apiName updatePage
   * @apiGroup PageManagement
   * @apiPermission internal
   *
   * @apiHeader {String} Key Internal access token.
   * @apiParam {String} id Page's unique identifier.
   * @apiBody {Boolean} [available] Page availability status.
   * @apiBody {String="production","alpha","beta"} [type] Page type.
   * @apiBody {Object} [maintenance] Maintenance info.
   * @apiBody {Object} [permission] Role-based access.
   *
   * @apiSuccess {Object} page Updated page details.
   *
   * @apiError (401) Unauthorized Invalid or missing access key.
   * @apiError (400) BadRequest No valid fields to update.
   * @apiError (404) NotFound Page not found.
   * @apiError (500) InternalServerError Unexpected error.
   */
  .patch(updatePage);

// Export the router
export default router;
