import createError from 'http-errors';
import System from '../../../models/schemas/System.js';

// Get membership details
const getMembership = async (req, res, next) => {
  const key = req.headers.key;

  // Check for valid access key in headers
  if (!key || key !== process.env.ACCESS_KEY) {
    return res.status(401).json({
      message: 'Unauthorized',
    });
  }

  try {
    // Check if any data exists
    let membershipData = await System.findOne({}, { membership: 1, _id: 0 });

    // If no data exists, insert sample data (only runs once)
    if (!membershipData) {
      membershipData = await System.findOne({}, { membership: 1, _id: 0 });
    }

    // Get valid keys dynamically from schema data
    const validFields = Object.keys(membershipData.membership);
    // Parse query parameters correctly
    const queryParams = req.query.q ? req.query.q.split(',').map(param => param.trim()) : [];
    // If no query params, return full membership object
    if (queryParams.length === 0) {
      return res.status(200).json(membershipData);
    }

    // Validate query parameters
    const selectedFields = queryParams.filter(field => validFields.includes(field));

    if (selectedFields.length === 0) {
      return res.status(400).json({ message: 'Invalid query parameter(s)' });
    }

    // Construct projection object dynamically
    const projection = selectedFields.reduce((acc, field) => ({ ...acc, [`membership.${field}`]: 1 }), { _id: 0 });

    // Fetch only the requested fields
    const result = await System.findOne({}, projection);

    if (!result) {
      return next(createError(404, 'No membership data found'));
    }

    res.status(200).json(result);
  } catch (error) {
    return next(error);
  }
};

export { getMembership };
